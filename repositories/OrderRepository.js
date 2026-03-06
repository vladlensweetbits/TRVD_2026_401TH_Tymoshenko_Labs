const Order = require('../models/Order');

class OrderRepository {
    async create(orderData) {
        const order = new Order(orderData);
        return await order.save();
    }

    async findById(id) {
        return await Order.findById(id)
            .populate('user', 'name email')
            .populate('items.product', 'name price');
    }

    async findByUser(userId) {
        return await Order.find({ user: userId })
            .populate('items.product', 'name price');
    }

    async findAll() {
        return await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name price');
    }

    async updateStatus(id, status) {
        return await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
    }

    async delete(id) {
        return await Order.findByIdAndDelete(id);
    }
}

module.exports = new OrderRepository();