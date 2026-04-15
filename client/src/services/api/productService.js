import axiosInstance from './axiosInstance';

const productService = {
    getAll: async (filters = {}) => {
        const response = await axiosInstance.get('/products', { params: filters });
        return response.data;
    },

    getById: async (id) => {
        const response = await axiosInstance.get(`/products/${id}`);
        return response.data;
    },

    search: async (query) => {
        const response = await axiosInstance.get('/products/search', { params: { q: query } });
        return response.data;
    },

    getByCategory: async (category) => {
        const response = await axiosInstance.get(`/products/category/${category}`);
        return response.data;
    },

    create: async (productData) => {
        const response = await axiosInstance.post('/products', productData);
        return response.data;
    },

    update: async (id, productData) => {
        const response = await axiosInstance.put(`/products/${id}`, productData);
        return response.data;
    },

    delete: async (id) => {
        const response = await axiosInstance.delete(`/products/${id}`);
        return response.data;
    },
};

export default productService;