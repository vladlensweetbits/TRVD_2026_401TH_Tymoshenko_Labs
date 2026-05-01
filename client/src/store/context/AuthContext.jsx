import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../../services/api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = authService.getCurrentUser();
        if (savedUser) setUser(savedUser);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await authService.login(email, password);
        const savedUser = authService.getCurrentUser();
        setUser(savedUser);
        return response;
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        return response;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);