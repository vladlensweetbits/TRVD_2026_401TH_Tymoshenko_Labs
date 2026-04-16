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
            .populate('user', 'name');
    }

    async findByUser(userId) {
        return await Review.find({ user: userId })
            .populate('product', 'name');
    }

    async update(id, updateData) {
        return await Review.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Review.findByIdAndDelete(id);
    }

    async getAverageRating(productId) {
        const result = await Review.aggregate([
            { $match: { product: productId } },
            { $group: { _id: '$product', avgRating: { $avg: '$rating' } } }
        ]);
        return result[0]?.avgRating || 0;
    }
}

module.exports = new ReviewRepository();