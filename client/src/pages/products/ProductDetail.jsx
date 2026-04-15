import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';
import { useCart } from '../../store/context/CartContext.jsx';
import productService from '../../services/api/productService';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [backHovered, setBackHovered] = useState(false);
    const [editHovered, setEditHovered] = useState(false);
    const [deleteHovered, setDeleteHovered] = useState(false);
    const [cancelHovered, setCancelHovered] = useState(false);
    const [confirmDeleteHovered, setConfirmDeleteHovered] = useState(false);
    const [cartHovered, setCartHovered] = useState(false);

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
            <button
                onMouseEnter={() => setBackHovered(true)}
                onMouseLeave={() => setBackHovered(false)}
                style={{ ...s.backBtn, ...(backHovered ? s.backBtnHover : {}) }}
                onClick={() => navigate('/')}
            >
                Back to Catalogue
            </button>
        </div>
    );

    const outOfStock = product.stock === 0;

    return (
        <div style={s.page}>
            {toast && <div style={s.toast}>{toast}</div>}

            {confirmDelete && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <p style={s.modalText}>Are you sure you want to delete this product?</p>
                        <div style={s.modalBtns}>
                            <button
                                onMouseEnter={() => setCancelHovered(true)}
                                onMouseLeave={() => setCancelHovered(false)}
                                style={{ ...s.cancelBtn, ...(cancelHovered ? s.cancelBtnHover : {}) }}
                                onClick={() => setConfirmDelete(false)}
                            >
                                Cancel
                            </button>
                            <button
                                onMouseEnter={() => setConfirmDeleteHovered(true)}
                                onMouseLeave={() => setConfirmDeleteHovered(false)}
                                style={{ ...s.deleteBtn, ...(confirmDeleteHovered ? s.deleteBtnHover : {}) }}
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onMouseEnter={() => setBackHovered(true)}
                onMouseLeave={() => setBackHovered(false)}
                style={{ ...s.backBtn, ...(backHovered ? s.backBtnHover : {}) }}
                onClick={() => navigate('/')}
            >
                Back to Catalogue
            </button>

            <div style={s.wrapper}>
                <div style={s.card}>
                    <div style={s.topRow}>
                        <span style={s.category}>{product.category}</span>
                        <span style={outOfStock ? s.outStock : s.inStock}>
                            {outOfStock ? 'Out of stock' : `In stock: ${product.stock} pcs.`}
                        </span>
                    </div>

                    <h1 style={s.name}>{product.name}</h1>

                    {product.images && product.images.length > 0 && (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{
                                ...s.productImage,
                                ...(outOfStock ? s.productImageGrey : {}),
                            }}
                        />
                    )}

                    <p style={s.price}>${product.price?.toLocaleString()}</p>

                    {user && (
                        <button
                            onMouseEnter={() => setCartHovered(true)}
                            onMouseLeave={() => setCartHovered(false)}
                            disabled={outOfStock}
                            style={{
                                ...s.addCartBtn,
                                ...(cartHovered && !outOfStock ? s.addCartBtnHover : {}),
                                ...(outOfStock ? s.addCartBtnDisabled : {}),
                            }}
                            onClick={async () => {
                                if (outOfStock) {
                                    showToast('This item is out of stock');
                                    return;
                                }
                                try {
                                    await addToCart(id);
                                    showToast('Added to cart');
                                } catch {
                                    showToast('This item is out of stock');
                                }
                            }}
                        >
                            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    )}

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
                            <button
                                onMouseEnter={() => setEditHovered(true)}
                                onMouseLeave={() => setEditHovered(false)}
                                style={{ ...s.editBtn, ...(editHovered ? s.editBtnHover : {}) }}
                                onClick={() => navigate(`/products/${id}/edit`)}
                            >
                                Edit Product
                            </button>
                            <button
                                onMouseEnter={() => setDeleteHovered(true)}
                                onMouseLeave={() => setDeleteHovered(false)}
                                style={{ ...s.deleteBtn, ...(deleteHovered ? s.deleteBtnHover : {}) }}
                                onClick={() => setConfirmDelete(true)}
                            >
                                Delete Product
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const s = {
    page: { minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '32px', color: '#040d15' },
    center: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
    spinner: { width: '40px', height: '40px', border: '4px solid #d1dce8', borderTop: '4px solid #1f73b7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    backBtn: { background: 'transparent', border: '1px solid #d1dce8', color: '#6b7a8d', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', transition: 'all 0.2s ease' },
    backBtnHover: { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' },
    wrapper: { display: 'flex', justifyContent: 'center' },
    card: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '720px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    category: { fontSize: '12px', color: '#1f73b7', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' },
    inStock: { fontSize: '13px', color: '#16a34a' },
    outStock: { fontSize: '13px', color: '#dc2626' },
    name: { fontSize: '28px', fontWeight: '700', margin: '0 0 16px', color: '#040d15' },
    productImage: { width: '100%', height: '360px', objectFit: 'cover', borderRadius: '12px', marginBottom: '24px', transition: 'filter 0.2s ease' },
    productImageGrey: { filter: 'grayscale(100%)', opacity: 0.6 },
    price: { fontSize: '24px', fontWeight: '700', color: '#1f73b7', margin: '0 0 16px' },
    addCartBtn: { padding: '12px 32px', backgroundColor: '#1f73b7', border: 'none', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '24px', transition: 'background-color 0.2s ease' },
    addCartBtnHover: { backgroundColor: '#145082' },
    addCartBtnDisabled: { backgroundColor: '#d1dce8', color: '#94a3b8', cursor: 'not-allowed', opacity: 0.7 },
    section: { marginBottom: '24px' },
    sectionTitle: { fontSize: '13px', color: '#6b7a8d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: '600' },
    desc: { color: '#040d15', lineHeight: '1.7', fontSize: '15px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tdKey: { padding: '8px 12px', color: '#6b7a8d', fontSize: '14px', borderBottom: '1px solid #e0e7ef', width: '40%' },
    tdVal: { padding: '8px 12px', color: '#040d15', fontSize: '14px', borderBottom: '1px solid #e0e7ef' },
    rating: { fontSize: '16px', color: '#1f73b7', fontWeight: '600' },
    adminActions: { display: 'flex', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e0e7ef' },
    editBtn: { padding: '10px 24px', backgroundColor: '#f0f4f8', border: '1px solid #d1dce8', color: '#040d15', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease' },
    editBtnHover: { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' },
    deleteBtn: { padding: '10px 24px', backgroundColor: '#dc2626', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.2s ease' },
    deleteBtnHover: { backgroundColor: '#b91c1c' },
    errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e7ef', color: '#040d15', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 1000, fontSize: '14px' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modal: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '12px', padding: '32px', maxWidth: '360px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
    modalText: { color: '#040d15', fontSize: '16px', marginBottom: '24px', textAlign: 'center' },
    modalBtns: { display: 'flex', gap: '12px', justifyContent: 'center' },
    cancelBtn: { padding: '10px 24px', backgroundColor: '#f0f4f8', border: '1px solid #d1dce8', color: '#040d15', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease' },
    cancelBtnHover: { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' },
};

export default ProductDetail;