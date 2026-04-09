import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import OrderSuccess from './pages/checkout/OrderSuccess';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<ProductList />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/products/:id/edit" element={
                            <ProtectedRoute adminOnly={true}><ProductForm /></ProtectedRoute>
                        } />
                        <Route path="/products/new" element={
                            <ProtectedRoute adminOnly={true}><ProductForm /></ProtectedRoute>
                        } />
                        <Route path="/cart" element={
                            <ProtectedRoute><Cart /></ProtectedRoute>
                        } />
                        <Route path="/checkout" element={
                            <ProtectedRoute><Checkout /></ProtectedRoute>
                        } />
                        <Route path="/order-success" element={
                            <ProtectedRoute><OrderSuccess /></ProtectedRoute>
                        } />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;