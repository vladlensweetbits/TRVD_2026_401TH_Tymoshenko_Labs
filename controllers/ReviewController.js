const reviewService = require('../services/ReviewService');
const { toReviewDTO, toReviewDTOList } = require('../mappers/reviewMapper');

class ReviewController {
    async createReview(req, res) {
        try {
            const review = await reviewService.createReview({
                ...req.body,
                user: req.user.id
            });
            res.status(201).json({ success: true, data: toReviewDTO(review) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getReviewById(req, res) {
        try {
            const review = await reviewService.getReviewById(req.params.id);
            res.status(200).json({ success: true, data: toReviewDTO(review) });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getProductReviews(req, res) {
        try {
            const reviews = await reviewService.getProductReviews(req.params.productId);
            res.status(200).json({ success: true, data: toReviewDTOList(reviews) });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getUserReviews(req, res) {
        try {
            const reviews = await reviewService.getUserReviews(req.user.id);
            res.status(200).json({ success: true, data: toReviewDTOList(reviews) });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateReview(req, res) {
        try {
            const review = await reviewService.updateReview(req.params.id, req.body);
            res.status(200).json({ success: true, data: toReviewDTO(review) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteReview(req, res) {
        try {
            await reviewService.deleteReview(req.params.id);
            res.status(200).json({ success: true, message: 'Review deleted successfully' });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ReviewController();