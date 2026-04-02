import axiosInstance from './axiosInstance';

const cartService = {
    getCart: async () => {
        const response = await axiosInstance.get('/cart');
        return response.data;
    },

    addItem: async (productId, quantity = 1) => {
        const response = await axiosInstance.post('/cart/add', { productId, quantity });
        return response.data;
    },

    updateItem: async (productId, quantity) => {
        const response = await axiosInstance.patch('/cart/update', { productId, quantity });
        return response.data;
    },

    removeItem: async (productId) => {
        const response = await axiosInstance.delete(`/cart/remove/${productId}`);
        return response.data;
    },

    clearCart: async () => {
        const response = await axiosInstance.delete('/cart/clear');
        return response.data;
    },
};

export default cartService;