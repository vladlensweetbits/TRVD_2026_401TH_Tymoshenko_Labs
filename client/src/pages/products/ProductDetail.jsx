import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';
import productService from '../../services/api/productService';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    useEffect(() => {
        const fetch = async () => {
            if (!id || id === 'undefined') {
                setError('Invalid product ID');
                setLoading(false);
                return;
            }
            try {
                const res = await productService.getById(id);
                setProduct(res.data);
            } catch {
                setError('Product not found');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    const handleDelete = async () => {
        try {
            await productService.delete(id);
            showToast('Product deleted successfully');
            setTimeout(() => navigate('/'), 1500);
        } catch {
            showToast('Failed to delete product');
            setConfirmDelete(false);
        }
    };

    if (loading) return (
        <div style={s.page}>
            <div style={s.center}><div style={s.spinner} /></div>
        </div>
    );

    if (error || !product) return (
        <div style={s.page}>
            <div style={s.errorBox}>{error || 'Failed to load product'}</div>
            <button style={s.backBtn} onClick={() => navigate('/')}>Back to Catalogue</button>
        </div>
    );

    return (
        <div style={s.page}>
            {toast && <div style={s.toast}>{toast}</div>}

            {confirmDelete && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <p style={s.modalText}>Are you sure you want to delete this product?</p>
                        <div style={s.modalBtns}>
                            <button style={s.cancelBtn} onClick={() => setConfirmDelete(false)}>Cancel</button>
                            <button style={s.deleteBtn} onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <button style={s.backBtn} onClick={() => navigate('/')}>Back to Catalogue</button>

            <div style={s.card}>
                <div style={s.topRow}>
                    <span style={s.category}>{product.category}</span>
                    <span style={product.stock > 0 ? s.inStock : s.outStock}>
                        {product.stock > 0 ? `In stock: ${product.stock} pcs.` : 'Out of stock'}
                    </span>
                </div>

                <h1 style={s.name}>{product.name}</h1>
                <p style={s.price}>${product.price?.toLocaleString()}</p>

                <div style={s.section}>
                    <h3 style={s.sectionTitle}>Description</h3>
                    <p style={s.desc}>{product.description}</p>
                </div>

                {product.specs && (
                    <div style={s.section}>
                        <h3 style={s.sectionTitle}>Specifications</h3>
                        <table style={s.table}>
                            <tbody>
                            {product.specs instanceof Map || Array.isArray(product.specs) ? (
                                Array.from(product.specs).map(([key, val]) => (
                                    <tr key={key}>
                                        <td style={s.tdKey}>{key}</td>
                                        <td style={s.tdVal}>{val}</td>
                                    </tr>
                                ))
                            ) : (
                                Object.entries(product.specs).map(([key, val]) => (
                                    <tr key={key}>
                                        <td style={s.tdKey}>{key}</td>
                                        <td style={s.tdVal}>{val}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {product.rating > 0 && (
                    <div style={s.section}>
                        <span style={s.rating}>Rating: {product.rating.toFixed(1)} / 5</span>
                    </div>
                )}

                {user?.role === 'admin' && (
                    <div style={s.adminActions}>
                        <button style={s.editBtn} onClick={() => navigate(`/products/${id}/edit`)}>
                            Edit Product
                        </button>
                        <button style={s.deleteBtn} onClick={() => setConfirmDelete(true)}>
                            Delete Product
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const s = {
    page: { minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '32px', color: '#040d15' },
    center: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
    spinner: { width: '40px', height: '40px', border: '4px solid #d1dce8', borderTop: '4px solid #1f73b7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    backBtn: { background: 'transparent', border: '1px solid #d1dce8', color: '#6b7a8d', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '24px' },
    card: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '16px', padding: '40px', maxWidth: '720px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    category: { fontSize: '12px', color: '#1f73b7', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' },
    inStock: { fontSize: '13px', color: '#16a34a' },
    outStock: { fontSize: '13px', color: '#dc2626' },
    name: { fontSize: '28px', fontWeight: '700', margin: '0 0 12px', color: '#040d15' },
    price: { fontSize: '24px', fontWeight: '700', color: '#1f73b7', margin: '0 0 24px' },
    section: { marginBottom: '24px' },
    sectionTitle: { fontSize: '13px', color: '#6b7a8d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: '600' },
    desc: { color: '#040d15', lineHeight: '1.7', fontSize: '15px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tdKey: { padding: '8px 12px', color: '#6b7a8d', fontSize: '14px', borderBottom: '1px solid #e0e7ef', width: '40%' },
    tdVal: { padding: '8px 12px', color: '#040d15', fontSize: '14px', borderBottom: '1px solid #e0e7ef' },
    rating: { fontSize: '16px', color: '#1f73b7', fontWeight: '600' },
    adminActions: { display: 'flex', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e0e7ef' },
    editBtn: { padding: '10px 24px', backgroundColor: '#f0f4f8', border: '1px solid #d1dce8', color: '#040d15', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    deleteBtn: { padding: '10px 24px', backgroundColor: '#dc2626', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e7ef', color: '#040d15', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 1000, fontSize: '14px' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modal: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '12px', padding: '32px', maxWidth: '360px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
    modalText: { color: '#040d15', fontSize: '16px', marginBottom: '24px', textAlign: 'center' },
    modalBtns: { display: 'flex', gap: '12px', justifyContent: 'center' },
    cancelBtn: { padding: '10px 24px', backgroundColor: '#f0f4f8', border: '1px solid #d1dce8', color: '#040d15', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
};

export default ProductDetail;