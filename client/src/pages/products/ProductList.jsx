import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';
import productService from '../../services/api/productService';
import { useCart } from '../../store/context/CartContext.jsx';

const CATEGORIES = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'Cooling'];

const ProductList = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [addHovered, setAddHovered] = useState(false);
    const [searchHovered, setSearchHovered] = useState(false);
    const [cancelHovered, setCancelHovered] = useState(false);
    const [deleteHovered, setDeleteHovered] = useState(false);
    const [hoveredEdit, setHoveredEdit] = useState(null);
    const [hoveredDelete, setHoveredDelete] = useState(null);
    const [hoveredView, setHoveredView] = useState(null);
    const [hoveredCart, setHoveredCart] = useState(null);

    const canManageProducts = user?.role === 'admin' || user?.role === 'employee';

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            let res;
            if (search) {
                res = await productService.search(search);
            } else {
                const params = {};
                if (category) params.category = category;
                res = await productService.getAll(params);
            }
            setProducts(res.data || []);
        } catch {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, [category]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleDelete = async (id) => {
        try {
            await productService.delete(id);
            setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
            showToast('Product deleted successfully');
        } catch {
            showToast('Failed to delete product');
        } finally {
            setConfirmDelete(null);
        }
    };

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
                                onClick={() => setConfirmDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                onMouseEnter={() => setDeleteHovered(true)}
                                onMouseLeave={() => setDeleteHovered(false)}
                                style={{ ...s.deleteBtn, ...(deleteHovered ? s.deleteBtnHover : {}) }}
                                onClick={() => handleDelete(confirmDelete)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={s.header}>
                <h1 style={s.title}>Product Catalogue</h1>
                {canManageProducts && (
                    <button
                        onMouseEnter={() => setAddHovered(true)}
                        onMouseLeave={() => setAddHovered(false)}
                        style={{ ...s.addBtn, ...(addHovered ? s.addBtnHover : {}) }}
                        onClick={() => navigate('/products/new')}
                    >
                        + Add Product
                    </button>
                )}
            </div>

            <div style={s.filters}>
                <form onSubmit={handleSearch} style={s.searchForm}>
                    <input
                        style={s.searchInput}
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button
                        type="submit"
                        onMouseEnter={() => setSearchHovered(true)}
                        onMouseLeave={() => setSearchHovered(false)}
                        style={{ ...s.searchBtn, ...(searchHovered ? s.searchBtnHover : {}) }}
                    >
                        Search
                    </button>
                </form>
                <select style={s.select} value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {loading && <div style={s.center}><div style={s.spinner} /></div>}
            {error && <div style={s.errorBox}>{error}</div>}

            {!loading && !error && products.length === 0 && (
                <div style={s.center}><p style={s.empty}>No products found</p></div>
            )}

            <div style={s.grid}>
                {products.map((product, index) => {
                    const productId = product._id || product.id || index;
                    const outOfStock = product.stock === 0;
                    return (
                        <div key={productId} style={s.card}>
                            {product.images && product.images.length > 0 && (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    style={{ ...s.cardImage, ...(outOfStock ? s.cardImageGrey : {}) }}
                                />
                            )}
                            <div style={s.cardCategory}>{product.category}</div>
                            <h3 style={s.cardName}>{product.name}</h3>
                            <p style={s.cardDesc}>
                                {product.description?.slice(0, 80)}
                                {product.description?.length > 80 ? '...' : ''}
                            </p>
                            <div style={s.cardBottom}>
                                <span style={s.price}>${product.price?.toLocaleString()}</span>
                                <span style={outOfStock ? s.outStock : s.inStock}>
                                    {outOfStock ? 'Out of stock' : `In stock: ${product.stock}`}
                                </span>
                            </div>
                            <div style={s.cardActions}>
                                <Link
                                    to={`/products/${productId}`}
                                    onMouseEnter={() => setHoveredView(productId)}
                                    onMouseLeave={() => setHoveredView(null)}
                                    style={{ ...s.viewBtn, ...(hoveredView === productId ? s.viewBtnHover : {}) }}
                                >
                                    View Details
                                </Link>
                                {user && (
                                    <button
                                        onMouseEnter={() => setHoveredCart(productId)}
                                        onMouseLeave={() => setHoveredCart(null)}
                                        disabled={outOfStock}
                                        style={{
                                            ...s.cartBtn,
                                            ...(hoveredCart === productId && !outOfStock ? s.cartBtnHover : {}),
                                            ...(outOfStock ? s.cartBtnDisabled : {}),
                                        }}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            if (outOfStock) { showToast('This item is out of stock'); return; }
                                            try {
                                                await addToCart(productId);
                                                showToast('Added to cart');
                                            } catch {
                                                showToast('Failed to add to cart');
                                            }
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                )}
                                {canManageProducts && (
                                    <>
                                        <button
                                            onMouseEnter={() => setHoveredEdit(productId)}
                                            onMouseLeave={() => setHoveredEdit(null)}
                                            style={{ ...s.editBtn, ...(hoveredEdit === productId ? s.editBtnHover : {}) }}
                                            onClick={() => navigate(`/products/${productId}/edit`)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onMouseEnter={() => setHoveredDelete(productId)}
                                            onMouseLeave={() => setHoveredDelete(null)}
                                            style={{ ...s.deleteCardBtn, ...(hoveredDelete === productId ? s.deleteCardBtnHover : {}) }}
                                            onClick={() => setConfirmDelete(productId)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const s = {
    page: { minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '32px', color: '#040d15' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#040d15', margin: 0 },
    addBtn: { backgroundColor: '#1f73b7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'background-color 0.2s ease' },
    addBtnHover: { backgroundColor: '#185d99' },
    filters: { display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' },
    searchForm: { display: 'flex', gap: '8px', flex: 1 },
    searchInput: { flex: 1, padding: '10px 14px', backgroundColor: '#ffffff', border: '1px solid #d1dce8', borderRadius: '8px', color: '#040d15', fontSize: '14px', minWidth: '200px', outline: 'none' },
    searchBtn: { padding: '10px 20px', backgroundColor: '#1f73b7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.2s ease' },
    searchBtnHover: { backgroundColor: '#185d99' },
    select: { padding: '10px 14px', backgroundColor: '#ffffff', border: '1px solid #d1dce8', borderRadius: '8px', color: '#040d15', fontSize: '14px', cursor: 'pointer', outline: 'none' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e0e7ef', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    cardImage: { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', transition: 'filter 0.2s ease' },
    cardImageGrey: { filter: 'grayscale(100%)', opacity: 0.6 },
    cardCategory: { fontSize: '11px', color: '#1f73b7', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' },
    cardName: { fontSize: '16px', fontWeight: '700', color: '#040d15', margin: 0 },
    cardDesc: { fontSize: '13px', color: '#6b7a8d', margin: 0, lineHeight: '1.5' },
    cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' },
    price: { fontSize: '18px', fontWeight: '700', color: '#1f73b7' },
    inStock: { fontSize: '12px', color: '#16a34a' },
    outStock: { fontSize: '12px', color: '#dc2626' },
    cardActions: { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' },
    viewBtn: { padding: '7px 14px', backgroundColor: '#f0f4f8', border: '1px solid #1f73b7', color: '#1f73b7', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', transition: 'all 0.2s ease' },
    viewBtnHover: { backgroundColor: '#1f73b7', color: '#ffffff' },
    editBtn: { padding: '7px 14px', backgroundColor: '#f0f4f8', border: '1px solid #d1dce8', color: '#040d15', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease' },
    editBtnHover: { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' },
    deleteCardBtn: { padding: '7px 14px', backgroundColor: 'transparent', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease' },
    deleteCardBtnHover: { backgroundColor: '#dc2626', color: '#ffffff' },
    center: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
    spinner: { width: '40px', height: '40px', border: '4px solid #d1dce8', borderTop: '4px solid #1f73b7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    empty: { color: '#6b7a8d', fontSize: '16px' },
    errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e7ef', color: '#040d15', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 1000, fontSize: '14px' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modal: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '12px', padding: '32px', maxWidth: '360px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
    modalText: { color: '#040d15', fontSize: '16px', marginBottom: '24px', textAlign: 'center' },
    modalBtns: { display: 'flex', gap: '12px', justifyContent: 'center' },
    cancelBtn: { padding: '10px 24px', backgroundColor: '#f0f4f8', border: '1px solid #d1dce8', color: '#040d15', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease' },
    cancelBtnHover: { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' },
    deleteBtn: { padding: '10px 24px', backgroundColor: '#dc2626', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.2s ease' },
    deleteBtnHover: { backgroundColor: '#b91c1c' },
    cartBtn: { padding: '7px 14px', backgroundColor: 'transparent', border: '1px solid #1f73b7', color: '#1f73b7', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s ease' },
    cartBtnHover: { backgroundColor: '#1f73b7', color: '#ffffff' },
    cartBtnDisabled: { border: '1px solid #d1dce8', color: '#94a3b8', cursor: 'not-allowed', opacity: 0.6 },
};

export default ProductList;