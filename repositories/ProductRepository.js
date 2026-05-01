const Product = require('../models/Product');

class ProductRepository {
    async create(productData) {
        const product = new Product(productData);
        return await product.save();
    }

    async findById(id) {
        return await Product.findById(id);
    }

    async findAll(filters = {}) {
        return await Product.find(filters);
    }

    async findByCategory(category) {
        return await Product.find({ category });
    }

    async search(query) {
        return await Product.find({
            name: { $regex: query, $options: 'i' }
        });
    }

    async update(id, updateData) {
        return await Product.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Product.findByIdAndDelete(id);
    }

    async updateStock(id, quantity) {
        return await Product.findByIdAndUpdate(
            id,
            { $inc: { stock: quantity } },
            { new: true }
        );
    }

    async updateRating(id, rating) {
        return await Product.findByIdAndUpdate(
            id,
            { rating },
            { new: true }
        );
    }
}

module.exports = new ProductRepository();