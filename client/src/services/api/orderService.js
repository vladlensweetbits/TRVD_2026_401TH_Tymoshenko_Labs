import axiosInstance from './axiosInstance';

const orderService = {
    create: async (items, address) => {
        const response = await axiosInstance.post('/orders', { items, address });
        return response.data;
    },

    getMyOrders: async () => {
        const response = await axiosInstance.get('/orders/my');
        return response.data;
    },

    getById: async (id) => {
        const response = await axiosInstance.get(`/orders/${id}`);
        return response.data;
    },

    getAll: async () => {
        const response = await axiosInstance.get('/orders');
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await axiosInstance.patch(`/orders/${id}/status`, { status });
        return response.data;
    },

    cancel: async (id) => {
        const response = await axiosInstance.patch(`/orders/${id}/cancel`);
        return response.data;
    },
};

export default orderService;