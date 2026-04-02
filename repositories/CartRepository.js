const Cart = require('../models/Cart');

const POPULATE = 'items.product';
const POPULATE_FIELDS = 'name price images stock';

class CartRepository {
    async findByUser(userId) {
        return await Cart.findOne({ user: userId }).populate(POPULATE, POPULATE_FIELDS);
    }

    async create(userId) {
        const cart = await Cart.create({ user: userId, items: [] });
        return await Cart.findById(cart._id).populate(POPULATE, POPULATE_FIELDS);
    }

    async save(cart) {
        await cart.save();
        return await Cart.findById(cart._id).populate(POPULATE, POPULATE_FIELDS);
    }

    async clear(userId) {
        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { items: [] },
            { new: true }
        );
        return await Cart.findById(cart._id).populate(POPULATE, POPULATE_FIELDS);
    }
}

module.exports = new CartRepository();