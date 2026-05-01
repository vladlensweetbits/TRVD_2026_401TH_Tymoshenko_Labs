const cartService = require('../services/CartService');

class CartController {
    async getCart(req, res) {
        try {
            const cart = await cartService.getCart(req.user.id);
            res.status(200).json({ success: true, data: cart });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async addItem(req, res) {
        try {
            const { productId, quantity } = req.body;
            const cart = await cartService.addItem(req.user.id, productId, quantity);
            res.status(200).json({ success: true, data: cart });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateItem(req, res) {
        try {
            const { productId, quantity } = req.body;
            const cart = await cartService.updateItem(req.user.id, productId, quantity);
            res.status(200).json({ success: true, data: cart });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async removeItem(req, res) {
        try {
            const cart = await cartService.removeItem(req.user.id, req.params.productId);
            res.status(200).json({ success: true, data: cart });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async clearCart(req, res) {
        try {
            const cart = await cartService.clearCart(req.user.id);
            res.status(200).json({ success: true, data: cart });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CartController();