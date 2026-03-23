import axiosInstance from './axiosInstance';

const userService = {
    getById: async (id) => {
        const response = await axiosInstance.get(`/users/${id}`);
        return response.data;
    },

    getAll: async () => {
        const response = await axiosInstance.get('/users');
        return response.data;
    },

    update: async (id, userData) => {
        const response = await axiosInstance.put(`/users/${id}`, userData);
        return response.data;
    },

    delete: async (id) => {
        const response = await axiosInstance.delete(`/users/${id}`);
        return response.data;
    },

    addToWishlist: async (id, productId) => {
        const response = await axiosInstance.patch(`/users/${id}/wishlist/add`, { productId });
        return response.data;
    },

    removeFromWishlist: async (id, productId) => {
        const response = await axiosInstance.patch(`/users/${id}/wishlist/remove`, { productId });
        return response.data;
    },
};

export default userService;