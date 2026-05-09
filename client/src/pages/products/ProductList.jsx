import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';
import productService from '../../services/api/productService';
import { useCart } from '../../store/context/CartContext.jsx';
import { useLanguage } from '../../store/context/LanguageContext.jsx';

const CATEGORIES = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'Cooling'];

const ProductList = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { t } = useLanguage();
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
    const [cardImgIndex, setCardImgIndex] = useState({});
    const [lightbox, setLightbox] = useState(null);

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

    useEffect(() => {
        const handleKey = (e) => {
            if (!lightbox) return;
            if (e.key === 'ArrowRight') setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lb.images.length }));
            if (e.key === 'ArrowLeft') setLightbox(lb => ({ ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }));
            if (e.key === 'Escape') setLightbox(null);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightbox]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleDelete = async (id) => {
        try {
            await productService.delete(id);
            setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
            showToast(t('catalogue_delete_success'));
        } catch {
            showToast(t('catalogue_delete_fail'));
        } finally {
            setConfirmDelete(null);
        }
    };

    const setCardImg = (productId, dir, total) => {
        setCardImgIndex(prev => {
            const cur = prev[productId] || 0;
            return { ...prev, [productId]: (cur + dir + total) % total };
        });
    };

    return (
        <div style={s.page}>
            {toast && <div style={s.toast}>{toast}</div>}

            {lightbox && (
                <div style={s.lightboxOverlay} onClick={() => setLightbox(null)}>
                    <div style={s.lightboxContent} onClick={e => e.stopPropagation()}>
                        <button style={s.lightboxClose} onClick={() => setLightbox(null)}>✕</button>
                        {lightbox.images.length > 1 && (
                            <button style={{ ...s.lightboxArrow, left: '12px' }}
                                    onClick={() => setLightbox(lb => ({ ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }))}>
                                ‹
                            </button>
                        )}
                        <img src={lightbox.images[lightbox.index]} alt="" style={s.lightboxImg} />
                        {lightbox.images.length > 1 && (
                            <button style={{ ...s.lightboxArrow, right: '12px' }}
                                    onClick={() => setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lb.images.length }))}>
                                ›
                            </button>
                        )}
                        {lightbox.images.length > 1 && (
                            <div style={s.lightboxDots}>
                                {lightbox.images.map((_, i) => (
                                    <div key={i} style={{ ...s.lightboxDot, ...(i === lightbox.index ? s.lightboxDotActive : {}) }}
                                         onClick={() => setLightbox(lb => ({ ...lb, index: i }))} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {confirmDelete && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <p style={s.modalText}>{t('catalogue_delete_confirm')}</p>
                        <div style={s.modalBtns}>
                            <button
                                onMouseEnter={() => setCancelHovered(true)}
                                onMouseLeave={() => setCancelHovered(false)}
                                style={{ ...s.cancelBtn, ...(cancelHovered ? s.cancelBtnHover : {}) }}
                                onClick={() => setConfirmDelete(null)}
                            >
                                {t('catalogue_cancel')}
                            </button>
                            <button
                                onMouseEnter={() => setDeleteHovered(true)}
                                onMouseLeave={() => setDeleteHovered(false)}
                                style={{ ...s.deleteBtn, ...(deleteHovered ? s.deleteBtnHover : {}) }}
                                onClick={() => handleDelete(confirmDelete)}
                            >
                                {t('catalogue_delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={s.header}>
                <h1 style={s.title}>{t('catalogue_title')}</h1>
                {canManageProducts && (
                    <button
                        onMouseEnter={() => setAddHovered(true)}
                        onMouseLeave={() => setAddHovered(false)}
                        style={{ ...s.addBtn, ...(addHovered ? s.addBtnHover : {}) }}
                        onClick={() => navigate('/products/new')}
                    >
                        {t('catalogue_add')}
                    </button>
                )}
            </div>

            <div style={s.filters}>
                <form onSubmit={handleSearch} style={s.searchForm}>
                    <input
                        style={s.searchInput}
                        placeholder={t('catalogue_search_placeholder')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button
                        type="submit"
                        onMouseEnter={() => setSearchHovered(true)}
                        onMouseLeave={() => setSearchHovered(false)}
                        style={{ ...s.searchBtn, ...(searchHovered ? s.searchBtnHover : {}) }}
                    >
                        {t('catalogue_search_btn')}
                    </button>
                </form>
                <select style={s.select} value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">{t('catalogue_all_categories')}</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {loading && <div style={s.center}><div style={s.spinner} /></div>}
            {error && <div style={s.errorBox}>{error}</div>}

            {!loading && !error && products.length === 0 && (
                <div style={s.center}><p style={s.empty}>{t('catalogue_no_products')}</p></div>
            )}

            <div style={s.grid}>
                {products.map((product, index) => {
                    const productId = product._id || product.id || index;
                    const outOfStock = product.stock === 0;
                    const images = product.images || [];
                    const imgIdx = cardImgIndex[productId] || 0;
                    return (
                        <div key={productId} style={s.card}>
                            {images.length > 0 && (
                                <div style={s.cardImgWrap}>
                                    {images.length > 1 && (
                                        <button style={{ ...s.cardArrow, left: '6px' }}
                                                onClick={e => { e.preventDefault(); setCardImg(productId, -1, images.length); }}>‹</button>
                                    )}
                                    <img
                                        src={images[imgIdx]}
                                        alt={product.name}
                                        style={{ ...s.cardImage, ...(outOfStock ? s.cardImageGrey : {}), cursor: 'zoom-in' }}
                                        onClick={() => setLightbox({ images, index: imgIdx })}
                                    />
                                    {images.length > 1 && (
                                        <button style={{ ...s.cardArrow, right: '6px' }}
                                                onClick={e => { e.preventDefault(); setCardImg(productId, 1, images.length); }}>›</button>
                                    )}
                                    {images.length > 1 && (
                                        <div style={s.cardDots}>
                                            {images.map((_, i) => (
                                                <div key={i}
                                                     style={{ ...s.cardDot, ...(i === imgIdx ? s.cardDotActive : {}) }}
                                                     onClick={() => setCardImgIndex(prev => ({ ...prev, [productId]: i }))}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div style={s.cardCategory}>{product.category}</div>
                            <h3 style={s.cardName}>{product.name}</h3>
                            <p style={s.cardDesc}>
                                {product.description?.slice(0, 80)}
                                {product.description?.length > 80 ? '...' : ''}
                            </p>
                            <div style={s.cardBottom}>
                                <span style={s.price}>{product.price?.toLocaleString()}₴</span>
                                <span style={outOfStock ? s.outStock : s.inStock}>
                                    {outOfStock ? t('catalogue_out_stock') : `${t('catalogue_in_stock')}: ${product.stock}`}
                                </span>
                            </div>
                            <div style={s.cardActions}>
                                <Link
                                    to={`/products/${productId}`}
                                    onMouseEnter={() => setHoveredView(productId)}
                                    onMouseLeave={() => setHoveredView(null)}
                                    style={{ ...s.viewBtn, ...(hoveredView === productId ? s.viewBtnHover : {}) }}
                                >
                                    {t('catalogue_view')}
                                </Link>
                                <button
                                    onMouseEnter={() => setHoveredCart(productId)}
                                    onMouseLeave={() => setHoveredCart(null)}
                                    disabled={outOfStock}
                                    style={{ ...s.cartBtn, ...(hoveredCart === productId && !outOfStock ? s.cartBtnHover : {}), ...(outOfStock ? s.cartBtnDisabled : {}) }}
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        if (outOfStock) { showToast(t('catalogue_stock_toast')); return; }
                                        try {
                                            await addToCart(productId, 1, product);
                                            showToast(t('catalogue_added_toast'));
                                        } catch {
                                            showToast(t('catalogue_fail_toast'));
                                        }
                                    }}
                                >
                                    {t('catalogue_add_cart')}
                                </button>
                                {canManageProducts && (
                                    <>
                                        <button
                                            onMouseEnter={() => setHoveredEdit(productId)}
                                            onMouseLeave={() => setHoveredEdit(null)}
                                            style={{ ...s.editBtn, ...(hoveredEdit === productId ? s.editBtnHover : {}) }}
                                            onClick={() => navigate(`/products/${productId}/edit`)}
                                        >
                                            {t('catalogue_edit')}
                                        </button>
                                        <button
                                            onMouseEnter={() => setHoveredDelete(productId)}
                                            onMouseLeave={() => setHoveredDelete(null)}
                                            style={{ ...s.deleteCardBtn, ...(hoveredDelete === productId ? s.deleteCardBtnHover : {}) }}
                                            onClick={() => setConfirmDelete(productId)}
                                        >
                                            {t('catalogue_delete')}
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
    cardImgWrap: { position: 'relative' },
    cardImage: { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', transition: 'filter 0.2s ease', display: 'block' },
    cardImageGrey: { filter: 'grayscale(100%)', opacity: 0.6 },
    cardArrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, lineHeight: 1 },
    cardDots: { position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' },
    cardDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'background-color 0.15s ease' },
    cardDotActive: { backgroundColor: '#ffffff' },
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
    lightboxOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
    lightboxContent: { position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    lightboxImg: { maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', display: 'block' },
    lightboxClose: { position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: '#ffffff', fontSize: '24px', cursor: 'pointer', padding: '4px 8px' },
    lightboxArrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
    lightboxDots: { display: 'flex', gap: '8px', marginTop: '14px' },
    lightboxDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'background-color 0.15s ease' },
    lightboxDotActive: { backgroundColor: '#ffffff' },
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