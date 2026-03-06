class ProductDTO {
    constructor(product) {
        this.id = product._id;
        this.name = product.name;
        this.description = product.description;
        this.price = product.price;
        this.category = product.category;
        this.stock = product.stock;
        this.images = product.images;
        this.specs = product.specs;
        this.rating = product.rating;
        this.createdAt = product.createdAt;
    }
}

module.exports = { ProductDTO };