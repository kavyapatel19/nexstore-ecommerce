const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get logged in user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      populate: { path: 'seller', select: 'name email' },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Filter out deleted products
    wishlist.products = wishlist.products.filter((p) => p !== null);

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist (add if not present, remove if present)
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex(
      (id) => id.toString() === productId
    );

    let added = false;
    if (index > -1) {
      // Remove
      wishlist.products.splice(index, 1);
      added = false;
    } else {
      // Add
      wishlist.products.push(productId);
      added = true;
    }

    await wishlist.save();

    const populatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      populate: { path: 'seller', select: 'name email' },
    });

    res.status(200).json({
      success: true,
      added,
      message: added ? 'Product added to wishlist' : 'Product removed from wishlist',
      wishlist: populatedWishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    const populatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      populate: { path: 'seller', select: 'name email' },
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: populatedWishlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
};

