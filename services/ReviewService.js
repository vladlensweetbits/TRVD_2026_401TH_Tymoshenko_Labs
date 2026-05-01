const reviewRepository = require('../repositories/ReviewRepository');
const productRepository = require('../repositories/ProductRepository');

class ReviewService {
    async createReview(reviewData) {
        const review = await reviewRepository.create(reviewData);

        const avgRating = await reviewRepository.getAverageRating(reviewData.product);
        await productRepository.updateRating(reviewData.product, avgRating);

        return review;
    }

    async getReviewById(id) {
        const review = await reviewRepository.findById(id);
        if (!review) {
            throw new Error('Review not found');
        }
        return review;
    }

    async getProductReviews(productId) {
        return await reviewRepository.findByProduct(productId);
    }

    async getUserReviews(userId) {
        return await reviewRepository.findByUser(userId);
    }

    async updateReview(id, updateData) {
        const review = await reviewRepository.update(id, updateData);
        if (!review) {
            throw new Error('Review not found');
        }

        // Recalculate product rating after update
        const avgRating = await reviewRepository.getAverageRating(review.product);
        await productRepository.updateRating(review.product, avgRating);

        return review;
    }

    async deleteReview(id) {
        const review = await reviewRepository.findById(id);
        if (!review) {
            throw new Error('Review not found');
        }

        await reviewRepository.delete(id);

        const avgRating = await reviewRepository.getAverageRating(review.product);
        await productRepository.updateRating(review.product, avgRating);

        return review;
    }
}

module.exports = new ReviewService();