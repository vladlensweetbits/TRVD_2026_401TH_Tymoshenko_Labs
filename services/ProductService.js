const productRepository = require('../repositories/ProductRepository');

class ProductService {
    async createProduct(productData) {
        return await productRepository.create(productData);
    }

    async getProductById(id) {
        const product = await productRepository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async getAllProducts(filters = {}) {
        return await productRepository.findAll(filters);
    }

    async getProductsByCategory(category) {
        return await productRepository.findByCategory(category);
    }

    async searchProducts(query) {
        if (!query) {
            throw new Error('Search query is required');
        }
        return await productRepository.search(query);
    }

    async updateProduct(id, updateData) {
        const product = await productRepository.update(id, updateData);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async deleteProduct(id) {
        const product = await productRepository.delete(id);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }

    async updateStock(id, quantity) {
        const product = await productRepository.findById(id);
        if (!product) {
            throw new Error('Product not found');
        }
        if (product.stock + quantity < 0) {
            throw new Error('Insufficient stock');
        }
        return await productRepository.updateStock(id, quantity);
    }
}

module.exports = new ProductService();