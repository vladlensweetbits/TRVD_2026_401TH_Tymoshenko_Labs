import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/context/AuthContext';
import { CartProvider } from './store/context/CartContext';
import { LanguageProvider } from './store/context/LanguageContext';
import { useAuth } from './store/context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
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
                    <LanguageProvider>
                        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                            <Navbar />
                            <div style={{ flex: 1 }}>
                                <Routes>
                                    <Route path="/" element={<ProductList />} />
                                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                                    <Route path="/products/:id" element={<ProductDetail />} />
                                    <Route path="/products/:id/edit" element={
                                        <ProtectedRoute employeeOrAdmin={true}><ProductForm /></ProtectedRoute>
                                    } />
                                    <Route path="/products/new" element={
                                        <ProtectedRoute employeeOrAdmin={true}><ProductForm /></ProtectedRoute>
                                    } />
                                    <Route path="/cart" element={<Cart />} />
                                    <Route path="/checkout" element={<Checkout />} />
                                    <Route path="/payment" element={<Payment />} />
                                    <Route path="/order-success" element={<OrderSuccess />} />
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
                            </div>
                            <Footer />
                        </div>
                    </LanguageProvider>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;