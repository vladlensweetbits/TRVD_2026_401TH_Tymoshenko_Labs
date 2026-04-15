import axiosInstance from './axiosInstance';

const reviewService = {
    getByProduct: async (productId) => {
        const response = await axiosInstance.get(`/reviews/product/${productId}`);
        return response.data;
    },

    getMyReviews: async () => {
        const response = await axiosInstance.get('/reviews/my');
        return response.data;
    },

    create: async (reviewData) => {
        const response = await axiosInstance.post('/reviews', reviewData);
        return response.data;
    },

    update: async (id, reviewData) => {
        const response = await axiosInstance.put(`/reviews/${id}`, reviewData);
        return response.data;
    },

    delete: async (id) => {
        const response = await axiosInstance.delete(`/reviews/${id}`);
        return response.data;
    },
};

export default reviewService;