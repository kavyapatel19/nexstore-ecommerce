const Product = require('../models/Product');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    // Keyword search on name or description
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting options
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { 'ratings.average': -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('seller', 'name email avatar role')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'name email avatar role'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products created by current logged-in seller
// @route   GET /api/products/seller/me
// @access  Private (Sales Person, Admin)
const getMyProducts = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { seller: req.user._id };
    const products = await Product.find(filter)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
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

    // 1. If file uploaded via multipart/form-data
    if (req.file) {
      try {
        const uploadedUrl = await uploadToCloudinary(req.file.buffer, 'kavya_ecommerce/products');
        imageUrls.push(uploadedUrl);
      } catch (uploadError) {
        console.error('[Cloudinary Upload Error]:', uploadError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload product image to Cloudinary: ' + uploadError.message,
        });
      }
    } else if (imageUrl) {
      // 2. Direct image URL provided in JSON body
      imageUrls.push(imageUrl);
    } else {
      // 3. Fallback default high quality product image
      imageUrls.push('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');
    }

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

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: populatedProduct,
    });
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
    let product = req.product; // Attached by authorizeProductOwnerOrAdmin middleware

    // Handle new image upload if provided
    if (req.file) {
      try {
        const uploadedUrl = await uploadToCloudinary(req.file.buffer, 'kavya_ecommerce/products');
        product.images = [uploadedUrl];
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload replacement image to Cloudinary: ' + uploadError.message,
        });
      }
    } else if (imageUrl) {
      product.images = [imageUrl];
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);

    await product.save();
    const updatedProduct = await Product.findById(product._id).populate('seller', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Strict RBAC: Admin can delete any, Sales only their own)
// @route   DELETE /api/products/:id
// @access  Private (Admin, Sales)
const deleteProduct = async (req, res, next) => {
  try {
    const product = req.product; // Attached by authorizeProductOwnerOrAdmin middleware

    await Product.deleteOne({ _id: product._id });

    res.status(200).json({
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

    res.status(200).json({
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

