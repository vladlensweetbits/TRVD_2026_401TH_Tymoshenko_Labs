const orderRepository = require('../repositories/OrderRepository');
const productRepository = require('../repositories/ProductRepository');

class OrderService {
    async createOrder(userId, items, address) {
        let totalPrice = 0;

        for (const item of items) {
            const product = await productRepository.findById(item.product);
            if (!product) {
                throw new Error(`Product ${item.product} not found`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }
            totalPrice += product.price * item.quantity;

            await productRepository.updateStock(item.product, -item.quantity);
        }

        return await orderRepository.create({
            user: userId,
            items,
            totalPrice,
            address
        });
    }

    async getOrderById(id) {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new Error('Order not found');
        }
        return order;
    }

    async getUserOrders(userId) {
        return await orderRepository.findByUser(userId);
    }

    async getAllOrders() {
        return await orderRepository.findAll();
    }

    async updateOrderStatus(id, status) {
        const order = await orderRepository.updateStatus(id, status);
        if (!order) {
            throw new Error('Order not found');
        }
        return order;
    }

    async cancelOrder(id) {
        const order = await orderRepository.findById(id);
        if (!order) {
            throw new Error('Order not found');
        }
        if (order.status !== 'pending') {
            throw new Error('Only pending orders can be cancelled');
        }

        for (const item of order.items) {
            await productRepository.updateStock(item.product, item.quantity);
        }

        return await orderRepository.updateStatus(id, 'cancelled');
    }
}

module.exports = new OrderService();