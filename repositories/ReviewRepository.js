const mongoose = require('mongoose');
const Review = require('../models/Review');

class ReviewRepository {
    async create(reviewData) {
        const review = new Review(reviewData);
        return await review.save();
    }

    async findById(id) {
        return await Review.findById(id)
            .populate('user', 'name')
            .populate('product', 'name');
    }

    async findByProduct(productId) {
        return await Review.find({ product: productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
    }

    async findByUser(userId) {
        return await Review.find({ user: userId })
            .populate('product', 'name');
    }

    async findByUserAndProduct(userId, productId) {
        return await Review.find({ user: userId, product: productId });
    }

    async update(id, updateData) {
        return await Review.findByIdAndUpdate(id, updateData, { new: true })
            .populate('user', 'name');
    }

    async delete(id) {
        return await Review.findByIdAndDelete(id);
    }

    async getAverageRating(productId) {
        const objectId = typeof productId === 'string'
            ? new mongoose.Types.ObjectId(productId)
            : productId;

        const result = await Review.aggregate([
            { $match: { product: objectId } },
            { $group: { _id: '$product', avgRating: { $avg: '$rating' } } }
        ]);
        return result[0]?.avgRating || 0;
    }
}

module.exports = new ReviewRepository();