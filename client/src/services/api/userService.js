import axiosInstance from './axiosInstance';

const userService = {
    getAll: async () => {
        const response = await axiosInstance.get('/users');
        return response.data;
    },

    search: async (query) => {
        const response = await axiosInstance.get(`/users/search/users?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await axiosInstance.get(`/users/${id}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await axiosInstance.put(`/users/${id}`, data);
        return response.data;
    },

    updateRole: async (id, role) => {
        const response = await axiosInstance.patch(`/users/${id}/role`, { role });
        return response.data;
    },

    delete: async (id) => {
        const response = await axiosInstance.delete(`/users/${id}`);
        return response.data;
    },
};

export default userService;