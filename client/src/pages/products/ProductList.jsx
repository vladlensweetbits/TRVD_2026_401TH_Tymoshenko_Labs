import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';
import productService from '../../services/api/productService';

const CATEGORIES = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'Cooling'];

const ProductList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (category) params.category = category;
            if (search) params.search = search;
            const res = await productService.getAll(params);

            console.log("Fetched products:", res.data);

            setProducts(res.data || []);
        } catch (err) {
            setError('Не вдалось завантажити товари');
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
            showToast('✅ Товар видалено');
        } catch {
            showToast('❌ Помилка видалення');
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
                        <p style={s.modalText}>Ви впевнені, що хочете видалити цей товар?</p>
                        <div style={s.modalBtns}>
                            <button style={s.cancelBtn} onClick={() => setConfirmDelete(null)}>Скасувати</button>
                            <button style={s.deleteBtn} onClick={() => handleDelete(confirmDelete)}>Видалити</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={s.header}>
                <h1 style={s.title}>Каталог техніки</h1>
                {user?.role === 'admin' && (
                    <button style={s.addBtn} onClick={() => navigate('/products/new')}>
                        + Додати товар
                    </button>
                )}
            </div>

            <div style={s.filters}>
                <form onSubmit={handleSearch} style={s.searchForm}>
                    <input
                        style={s.searchInput}
                        placeholder="Пошук товарів..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button type="submit" style={s.searchBtn}>Знайти</button>
                </form>
                <select style={s.select} value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">Всі категорії</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {loading && <div style={s.center}><div style={s.spinner} /></div>}
            {error && <div style={s.errorBox}>{error}</div>}

            {!loading && !error && products.length === 0 && (
                <div style={s.center}><p style={s.empty}>Товарів не знайдено</p></div>
            )}

            <div style={s.grid}>
                {products.map((product, index) => {
                    const productId = product._id || product.id || index;

                    return (
                        <div key={productId} style={s.card}>
                            <div style={s.cardCategory}>{product.category}</div>
                            <h3 style={s.cardName}>{product.name}</h3>
                            <p style={s.cardDesc}>
                                {product.description?.slice(0, 80)}
                                {product.description?.length > 80 ? '...' : ''}
                            </p>
                            <div style={s.cardBottom}>
                                <span style={s.price}>{product.price?.toLocaleString()} ₴</span>
                                <span style={product.stock > 0 ? s.inStock : s.outStock}>
                                    {product.stock > 0 ? `В наявності: ${product.stock}` : 'Немає'}
                                </span>
                            </div>
                            <div style={s.cardActions}>
                                {/* FIX: Ensure ID is passed correctly to the Link */}
                                <Link to={`/products/${productId}`} style={s.viewBtn}>Детальніше</Link>

                                {user?.role === 'admin' && (
                                    <>
                                        <button
                                            style={s.editBtn}
                                            onClick={() => navigate(`/products/${productId}/edit`)}
                                        >
                                            Редагувати
                                        </button>
                                        <button
                                            style={s.deleteCardBtn}
                                            onClick={() => setConfirmDelete(productId)}
                                        >
                                            Видалити
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
    page: { minHeight: '100vh', backgroundColor: '#0f0f1a', padding: '32px', color: '#fff' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: 0 },
    addBtn: { backgroundColor: '#4a9eff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    filters: { display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' },
    searchForm: { display: 'flex', gap: '8px', flex: 1 },
    searchInput: { flex: 1, padding: '10px 14px', backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e', borderRadius: '8px', color: '#fff', fontSize: '14px', minWidth: '200px' },
    searchBtn: { padding: '10px 20px', backgroundColor: '#4a9eff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    select: { padding: '10px 14px', backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e', borderRadius: '8px', color: '#fff', fontSize: '14px', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#1a1a2e', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a4e', display: 'flex', flexDirection: 'column', gap: '10px' },
    cardCategory: { fontSize: '11px', color: '#4a9eff', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' },
    cardName: { fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: 0 },
    cardDesc: { fontSize: '13px', color: '#888', margin: 0, lineHeight: '1.5' },
    cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' },
    price: { fontSize: '18px', fontWeight: 'bold', color: '#4a9eff' },
    inStock: { fontSize: '12px', color: '#4caf50' },
    outStock: { fontSize: '12px', color: '#e05555' },
    cardActions: { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' },
    viewBtn: { padding: '7px 14px', backgroundColor: '#0f0f1a', border: '1px solid #4a9eff', color: '#4a9eff', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', cursor: 'pointer' },
    editBtn: { padding: '7px 14px', backgroundColor: '#2a2a4e', border: 'none', color: '#ccc', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
    deleteCardBtn: { padding: '7px 14px', backgroundColor: 'transparent', border: '1px solid #e05555', color: '#e05555', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
    center: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
    spinner: { width: '40px', height: '40px', border: '4px solid #2a2a4e', borderTop: '4px solid #4a9eff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    empty: { color: '#888', fontSize: '16px' },
    errorBox: { backgroundColor: '#2d1515', border: '1px solid #e05555', color: '#e05555', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e', color: '#fff', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 1000, fontSize: '14px' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modal: { backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e', borderRadius: '12px', padding: '32px', maxWidth: '360px', width: '90%' },
    modalText: { color: '#fff', fontSize: '16px', marginBottom: '24px', textAlign: 'center' },
    modalBtns: { display: 'flex', gap: '12px', justifyContent: 'center' },
    cancelBtn: { padding: '10px 24px', backgroundColor: '#2a2a4e', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    deleteBtn: { padding: '10px 24px', backgroundColor: '#e05555', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
};

export default ProductList;