const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');
const { authorize, authorizeProductOwnerOrAdmin } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/detail/:id', getProductById);
router.get('/:id', getProductById);

// Protected routes (Sales Person & Admin)
router.get('/seller/me', protect, authorize('sales', 'admin'), getMyProducts);

router.post(
  '/',
  protect,
  authorize('sales', 'admin'),
  upload.single('image'),
  createProduct
);

router.post(
  '/upload-image',
  protect,
  authorize('sales', 'admin'),
  upload.single('image'),
  uploadProductImage
);

router.put(
  '/:id',
  protect,
  authorize('sales', 'admin'),
  authorizeProductOwnerOrAdmin,
  upload.single('image'),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('sales', 'admin'),
  authorizeProductOwnerOrAdmin,
  deleteProduct
);

module.exports = router;

