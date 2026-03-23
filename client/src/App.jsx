import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './store/context/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import ProductForm from './pages/products/ProductForm';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/" element={<ProductList />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/products/new" element={
                        <ProtectedRoute adminOnly={true}>
                            <ProductForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/products/:id/edit" element={
                        <ProtectedRoute adminOnly={true}>
                            <ProductForm />
                        </ProtectedRoute>
                    } />

                    <Route path="/products/:id" element={<ProductDetail />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
