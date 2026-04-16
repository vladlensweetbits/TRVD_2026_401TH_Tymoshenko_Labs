const cartRepository = require('../repositories/CartRepository');
const productRepository = require('../repositories/ProductRepository');

class CartService {
    async getCart(userId) {
        let cart = await cartRepository.findByUser(userId);
        if (!cart) cart = await cartRepository.create(userId);
        return cart;
    }

    async addItem(userId, productId, quantity = 1) {
        const product = await productRepository.findById(productId);
        if (!product) throw new Error('Product not found');
        if (product.stock < quantity) throw new Error('Insufficient stock');

        let cart = await cartRepository.findByUser(userId);
        if (!cart) cart = await cartRepository.create(userId);

        const existingItem = cart.items.find(item => item.product._id?.toString() === productId || item.product?.toString() === productId);

        if (existingItem) {
            const newQty = existingItem.quantity + quantity;
            if (product.stock < newQty) throw new Error('Insufficient stock');
            existingItem.quantity = newQty;
        } else {
            cart.items.push({ product: productId, quantity, price: product.price });
        }

        return await cartRepository.save(cart);
    }

    async updateItem(userId, productId, quantity) {
        if (quantity < 1) throw new Error('Quantity must be at least 1');

        const product = await productRepository.findById(productId);
        if (!product) throw new Error('Product not found');
        if (product.stock < quantity) throw new Error('Insufficient stock');

        const cart = await cartRepository.findByUser(userId);
        if (!cart) throw new Error('Cart not found');

        const item = cart.items.find(item => item.product._id?.toString() === productId || item.product?.toString() === productId);
        if (!item) throw new Error('Item not found in cart');

        item.quantity = quantity;
        return await cartRepository.save(cart);
    }

    async removeItem(userId, productId) {
        const cart = await cartRepository.findByUser(userId);
        if (!cart) throw new Error('Cart not found');

        cart.items = cart.items.filter(item => item.product._id?.toString() !== productId && item.product?.toString() !== productId);
        return await cartRepository.save(cart);
    }

    async clearCart(userId) {
        return await cartRepository.clear(userId);
    }
}

module.exports = new CartService();