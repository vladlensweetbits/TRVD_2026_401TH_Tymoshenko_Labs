const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { protect, employeeOrAdmin } = require('../middleware/auth');

router.post('/guest', (req, res) => orderController.createGuestOrder(req, res));

router.post('/', protect, (req, res) => orderController.createOrder(req, res));
router.get('/my', protect, (req, res) => orderController.getUserOrders(req, res));
router.get('/:id', protect, (req, res) => orderController.getOrderById(req, res));
router.patch('/:id/cancel', protect, (req, res) => orderController.cancelOrder(req, res));

router.get('/', protect, employeeOrAdmin, (req, res) => orderController.getAllOrders(req, res));
router.patch('/:id/status', protect, employeeOrAdmin, (req, res) => orderController.updateOrderStatus(req, res));

module.exports = router;