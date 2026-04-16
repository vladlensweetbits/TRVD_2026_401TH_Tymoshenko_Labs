import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/context/AuthContext';
import { CartProvider } from './store/context/CartContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import ProductForm from './pages/products/ProductForm';
import Cart from './pages/cart/Cart';
import Checkout from './pages/checkout/Checkout';
import Payment from './pages/payment/Payment';
import OrderSuccess from './pages/checkout/OrderSuccess';
import Orders from './pages/orders/Orders';
import OrderDetail from './pages/orders/OrderDetail';
import AdminPanel from './pages/admin/AdminPanel';
import { useAuth } from './store/context/AuthContext';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (user) return <Navigate to="/" replace />;
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<ProductList />} />
                        <Route path="/login" element={
                            <PublicRoute><Login /></PublicRoute>
                        } />
                        <Route path="/register" element={
                            <PublicRoute><Register /></PublicRoute>
                        } />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/products/:id/edit" element={
                            <ProtectedRoute employeeOrAdmin={true}><ProductForm /></ProtectedRoute>
                        } />
                        <Route path="/products/new" element={
                            <ProtectedRoute employeeOrAdmin={true}><ProductForm /></ProtectedRoute>
                        } />
                        <Route path="/cart" element={
                            <ProtectedRoute><Cart /></ProtectedRoute>
                        } />
                        <Route path="/checkout" element={
                            <ProtectedRoute><Checkout /></ProtectedRoute>
                        } />
                        <Route path="/payment" element={
                            <ProtectedRoute><Payment /></ProtectedRoute>
                        } />
                        <Route path="/order-success" element={
                            <ProtectedRoute><OrderSuccess /></ProtectedRoute>
                        } />
                        <Route path="/orders" element={
                            <ProtectedRoute><Orders /></ProtectedRoute>
                        } />
                        <Route path="/orders/:id" element={
                            <ProtectedRoute><OrderDetail /></ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>
                        } />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;