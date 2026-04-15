const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const { protect, workerOrAdmin } = require('../middleware/auth');

router.get('/', (req, res) => productController.getAllProducts(req, res));
router.get('/search', (req, res) => productController.searchProducts(req, res));
router.get('/category/:category', (req, res) => productController.getProductsByCategory(req, res));
router.get('/:id', (req, res) => productController.getProductById(req, res));

router.post('/', protect, workerOrAdmin, (req, res) => productController.createProduct(req, res));
router.put('/:id', protect, workerOrAdmin, (req, res) => productController.updateProduct(req, res));
router.delete('/:id', protect, workerOrAdmin, (req, res) => productController.deleteProduct(req, res));

module.exports = router;