const reviewRepository = require('../repositories/ReviewRepository');
const productRepository = require('../repositories/ProductRepository');

class ReviewService {
    async createReview(reviewData) {
        const existingReviews = await reviewRepository.findByUserAndProduct(
            reviewData.user,
            reviewData.product
        );

        if (existingReviews.length >= 5) {
            throw new Error('You have reached the maximum of 5 reviews for this product');
        }

        const review = await reviewRepository.create(reviewData);

        const avgRating = await reviewRepository.getAverageRating(reviewData.product);
        await productRepository.updateRating(reviewData.product, avgRating);

        return await reviewRepository.findById(review._id);
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

        const avgRating = await reviewRepository.getAverageRating(review.product._id || review.product);
        await productRepository.updateRating(review.product._id || review.product, avgRating);

        return review;
    }
}

module.exports = new ReviewService();