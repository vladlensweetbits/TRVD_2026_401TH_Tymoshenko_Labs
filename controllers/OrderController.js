const orderService = require('../services/OrderService');
const { toOrderDTO, toOrderDTOList } = require('../mappers/orderMapper');

class OrderController {
    async createOrder(req, res) {
        try {
            const { items, address, isPaid } = req.body;
            const order = await orderService.createOrder(req.user.id, items, address, isPaid);
            res.status(201).json({ success: true, data: toOrderDTO(order) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getOrderById(req, res) {
        try {
            const order = await orderService.getOrderById(req.params.id);
            res.status(200).json({ success: true, data: toOrderDTO(order) });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getUserOrders(req, res) {
        try {
            const orders = await orderService.getUserOrders(req.user.id);
            res.status(200).json({ success: true, data: toOrderDTOList(orders) });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllOrders(req, res) {
        try {
            const orders = await orderService.getAllOrders();
            res.status(200).json({ success: true, data: toOrderDTOList(orders) });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
            res.status(200).json({ success: true, data: toOrderDTO(order) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async cancelOrder(req, res) {
        try {
            const order = await orderService.cancelOrder(req.params.id);
            res.status(200).json({ success: true, data: toOrderDTO(order) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new OrderController();