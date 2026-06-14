const { ReviewDTO } = require('../dto/reviewDto');

const toReviewDTO = (review) => new ReviewDTO(review);

const toReviewDTOList = (reviews) => reviews.map(toReviewDTO);

module.exports = { toReviewDTO, toReviewDTOList };