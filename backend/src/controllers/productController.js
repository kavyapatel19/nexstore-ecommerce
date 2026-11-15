const mongoose = require('mongoose');
const Product = require('../models/Product');
const memoryStore = require('../config/memoryStore');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
      const query = {};

      if (keyword) {
        query.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
        ];
      }

      if (category && category !== 'All') {
        query.category = category;
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      let sortOption = { createdAt: -1 };
      if (sort === 'price-asc') sortOption = { price: 1 };
      else if (sort === 'price-desc') sortOption = { price: -1 };
      else if (sort === 'rating') sortOption = { 'ratings.average': -1 };
      else if (sort === 'oldest') sortOption = { createdAt: 1 };

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .populate('seller', 'name email avatar role')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: products.length,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        products,
      });
    } else {
      // Memory Store fallback
      const { total, products } = memoryStore.getProducts(req.query);
      return res.status(200).json({
        success: true,
        count: products.length,
        total,
        totalPages: Math.ceil(total / (Number(req.query.limit) || 12)),
        currentPage: Number(req.query.page) || 1,
        products,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      const product = await Product.findById(req.params.id).populate(
        'seller',
        'name email avatar role'
      );
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, product });
    } else {
      const product = memoryStore.findProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, product });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get products created by current logged-in seller
// @route   GET /api/products/seller/me
// @access  Private (Sales Person, Admin)
const getMyProducts = async (req, res, next) => {
  try {
    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      const filter = req.user.role === 'admin' ? {} : { seller: req.user._id };
      const products = await Product.find(filter)
        .populate('seller', 'name email')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: products.length,
        products,
      });
    } else {
      const products = memoryStore.getSellerProducts(
        req.user._id || req.user.id,
        req.user.role === 'admin'
      );
      return res.status(200).json({
        success: true,
        count: products.length,
        products,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (with Cloudinary image upload)
// @route   POST /api/products
// @access  Private (Admin, Sales)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;
    let imageUrls = [];

    if (req.file) {
      try {
        const uploadedUrl = await uploadToCloudinary(req.file.buffer, 'kavya_ecommerce/products');
        imageUrls.push(uploadedUrl);
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload product image to Cloudinary: ' + uploadError.message,
        });
      }
    } else if (imageUrl) {
      imageUrls.push(imageUrl);
    } else {
      imageUrls.push('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');
    }

    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      const product = await Product.create({
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock || 10),
        images: imageUrls,
        seller: req.user._id,
      });

      const populatedProduct = await Product.findById(product._id).populate('seller', 'name email role');

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: populatedProduct,
      });
    } else {
      const newProduct = memoryStore.createProduct(
        {
          name,
          description,
          price,
          category,
          stock,
          images: imageUrls,
        },
        req.user
      );

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: newProduct,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Strict RBAC: Admin can edit any, Sales only their own)
// @route   PUT /api/products/:id
// @access  Private (Admin, Sales)
const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;
    let replacementImage = null;

    if (req.file) {
      replacementImage = await uploadToCloudinary(req.file.buffer, 'kavya_ecommerce/products');
    } else if (imageUrl) {
      replacementImage = imageUrl;
    }

    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      let product = req.product;
      if (replacementImage) product.images = [replacementImage];
      if (name !== undefined) product.name = name;
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = Number(price);
      if (category !== undefined) product.category = category;
      if (stock !== undefined) product.stock = Number(stock);

      await product.save();
      const updatedProduct = await Product.findById(product._id).populate('seller', 'name email role');

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct,
      });
    } else {
      const updatedProduct = memoryStore.updateProduct(req.params.id, {
        name,
        description,
        price,
        category,
        stock,
        imageUrl: replacementImage,
      });

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Strict RBAC: Admin can delete any, Sales only their own)
// @route   DELETE /api/products/:id
// @access  Private (Admin, Sales)
const deleteProduct = async (req, res, next) => {
  try {
    const isMongo = mongoose.connection.readyState === 1 && !memoryStore.isMemoryMode;

    if (isMongo) {
      await Product.deleteOne({ _id: req.product._id });
    } else {
      memoryStore.deleteProduct(req.params.id);
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload an image standalone to Cloudinary
// @route   POST /api/products/upload-image
// @access  Private (Admin, Sales)
const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided in request',
      });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'kavya_ecommerce/products');

    return res.status(200).json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
