class ReviewDTO {
    constructor(review) {
        this.id = review._id;
        this.user = review.user && typeof review.user === 'object'
            ? {
                id: review.user._id,
                _id: review.user._id,
                name: review.user.name,
            }
            : review.user;
        this.product = review.product;
        this.rating = review.rating;
        this.comment = review.comment;
        this.createdAt = review.createdAt;
    }
}

module.exports = { ReviewDTO };