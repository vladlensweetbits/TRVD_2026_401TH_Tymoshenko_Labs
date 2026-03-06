const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/ReviewController');
const { protect } = require('../middleware/auth');

router.get('/product/:productId', (req, res) => reviewController.getProductReviews(req, res));
router.get('/:id', (req, res) => reviewController.getReviewById(req, res));

router.get('/my', protect, (req, res) => reviewController.getUserReviews(req, res));
router.post('/', protect, (req, res) => reviewController.createReview(req, res));
router.put('/:id', protect, (req, res) => reviewController.updateReview(req, res));
router.delete('/:id', protect, (req, res) => reviewController.deleteReview(req, res));

module.exports = router;