const productService = require('../services/ProductService');
const { toProductDTO, toProductDTOList } = require('../mappers/productMapper');

class ProductController {
    async createProduct(req, res) {
        try {
            const product = await productService.createProduct(req.body);
            res.status(201).json({ success: true, data: toProductDTO(product) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getProductById(req, res) {
        try {
            const product = await productService.getProductById(req.params.id);
            res.status(200).json({ success: true, data: toProductDTO(product) });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getAllProducts(req, res) {
        try {
            const products = await productService.getAllProducts(req.query);
            res.status(200).json({ success: true, data: toProductDTOList(products) });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getProductsByCategory(req, res) {
        try {
            const products = await productService.getProductsByCategory(req.params.category);
            res.status(200).json({ success: true, data: toProductDTOList(products) });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async searchProducts(req, res) {
        try {
            const products = await productService.searchProducts(req.query.q);
            res.status(200).json({ success: true, data: toProductDTOList(products) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateProduct(req, res) {
        try {
            const product = await productService.updateProduct(req.params.id, req.body);
            res.status(200).json({ success: true, data: toProductDTO(product) });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteProduct(req, res) {
        try {
            await productService.deleteProduct(req.params.id);
            res.status(200).json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ProductController();