import axiosInstance from './axiosInstance';

const authService = {
    register: async (userData) => {
        const response = await axiosInstance.post('/users/register', userData);
        return response.data;
    },

    login: async (email, password) => {
        const response = await axiosInstance.post('/users/login', { email, password });
        const { token, ...user } = response.data.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    }
};

export default authService;