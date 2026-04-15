import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';

const ProtectedRoute = ({ children, adminOnly = false, workerOrAdmin = false }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <Navigate to="/login" replace />;

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    if (workerOrAdmin && user.role !== 'admin' && user.role !== 'worker') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;