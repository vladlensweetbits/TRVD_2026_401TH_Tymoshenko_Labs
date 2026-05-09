const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, (req, res) => cartController.getCart(req, res));
router.post('/add', protect, (req, res) => cartController.addItem(req, res));
router.patch('/update', protect, (req, res) => cartController.updateItem(req, res));
router.delete('/remove/:productId', protect, (req, res) => cartController.removeItem(req, res));
router.delete('/clear', protect, (req, res) => cartController.clearCart(req, res));

module.exports = router;