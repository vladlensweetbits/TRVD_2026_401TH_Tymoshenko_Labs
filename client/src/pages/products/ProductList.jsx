import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';
import productService from '../../services/api/productService';
import { useCart } from '../../store/context/CartContext.jsx';
import { useLanguage } from '../../store/context/LanguageContext.jsx';

const CATEGORIES = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'Cooling'];

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 3H2l8 9.46V19l4 2V12.46L22 3z"/>
    </svg>
);

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
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [cardImgIndex, setCardImgIndex] = useState({});
    const [lightbox, setLightbox] = useState(null);

    const canManageProducts = user?.role === 'admin' || user?.role === 'employee';

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchProducts = async () => {
        setLoading(true); setError('');
        try {
            let res;
            if (search) { res = await productService.search(search); }
            else {
                const params = {};
                if (category) params.category = category;
                res = await productService.getAll(params);
            }
            setProducts(res.data || []);
        } catch { setError('Failed to load products'); }
        finally { setLoading(false); }
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

    const handleSearch = (e) => { e.preventDefault(); fetchProducts(); };

    const handleDelete = async (id) => {
        try {
            await productService.delete(id);
            setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
            showToast(t('catalogue_delete_success'));
        } catch { showToast(t('catalogue_delete_fail')); }
        finally { setConfirmDelete(null); }
    };

    const setCardImg = (productId, dir, total) => {
        setCardImgIndex(prev => {
            const cur = prev[productId] || 0;
            return { ...prev, [productId]: (cur + dir + total) % total };
        });
    };

    return (
        <div className="page-container page-wrapper">
            {toast && <div className="shared-toast">{toast}</div>}

            {/* Lightbox */}
            {lightbox && (
                <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
                        {lightbox.images.length > 1 && (
                            <button className="lightbox-arrow" style={{ left: '12px' }}
                                    onClick={() => setLightbox(lb => ({ ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }))}>‹</button>
                        )}
                        <img src={lightbox.images[lightbox.index]} alt="" className="lightbox-img" />
                        {lightbox.images.length > 1 && (
                            <button className="lightbox-arrow" style={{ right: '12px' }}
                                    onClick={() => setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lb.images.length }))}>›</button>
                        )}
                        {lightbox.images.length > 1 && (
                            <div className="lightbox-dots">
                                {lightbox.images.map((_, i) => (
                                    <div key={i}
                                         className={`lightbox-dot${i === lightbox.index ? ' lightbox-dot-active' : ''}`}
                                         onClick={() => setLightbox(lb => ({ ...lb, index: i }))} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {confirmDelete && (
                <div className="shared-overlay">
                    <div className="shared-modal">
                        <p className="shared-modal-text">{t('catalogue_delete_confirm')}</p>
                        <div className="shared-modal-btns">
                            <button className="modal-cancel-btn" onClick={() => setConfirmDelete(null)}>
                                {t('catalogue_cancel')}
                            </button>
                            <button className="modal-danger-btn" onClick={() => handleDelete(confirmDelete)}>
                                {t('catalogue_delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter modal */}
            {showFilterModal && (
                <div className="filter-modal-overlay" onClick={() => setShowFilterModal(false)}>
                    <div className="filter-modal" onClick={e => e.stopPropagation()}>
                        <div className="filter-modal-header">
                            <span className="filter-modal-title">{t('catalogue_all_categories')}</span>
                            <button className="filter-modal-close" onClick={() => setShowFilterModal(false)}>✕</button>
                        </div>
                        <div className="filter-modal-options">
                            <button
                                className={`filter-modal-option${category === '' ? ' selected' : ''}`}
                                onClick={() => { setCategory(''); setShowFilterModal(false); }}
                            >{t('catalogue_all_categories')}</button>
                            {CATEGORIES.map(c => (
                                <button
                                    key={c}
                                    className={`filter-modal-option${category === c ? ' selected' : ''}`}
                                    onClick={() => { setCategory(c); setShowFilterModal(false); }}
                                >{c}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="catalogue-header">
                <h1 className="catalogue-title">{t('catalogue_title')}</h1>
                {canManageProducts && (
                    <button className="add-product-btn" onClick={() => navigate('/products/new')}>
                        {t('catalogue_add')}
                    </button>
                )}
            </div>

            {/* Filters – input + [filter icon][search btn] */}
            <div className="filters-wrapper">
                <form id="product-search-form" className="search-form-el" onSubmit={handleSearch}>
                    <input
                        className="search-input-el"
                        placeholder={t('catalogue_search_placeholder')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </form>

                <div className="mobile-filter-row">
                    <button
                        type="button"
                        className={`filter-icon-btn${category !== '' ? ' active' : ''}`}
                        onClick={() => setShowFilterModal(true)}
                        aria-label="Filter"
                    >
                        <FilterIcon />
                    </button>
                    <button
                        type="submit"
                        form="product-search-form"
                        className="search-btn-text"
                    >
                        {t('catalogue_search_btn')}
                    </button>
                </div>
            </div>

            {loading && <div className="catalogue-loader"><div className="shared-spinner" /></div>}
            {error && <div className="catalogue-error">{error}</div>}
            {!loading && !error && products.length === 0 && (
                <div className="catalogue-loader"><p className="catalogue-empty">{t('catalogue_no_products')}</p></div>
            )}

            <div className="products-grid">
                {products.map((product, index) => {
                    const productId = product._id || product.id || index;
                    const outOfStock = product.stock === 0;
                    const images = product.images || [];
                    const imgIdx = cardImgIndex[productId] || 0;
                    return (
                        <div key={productId} className="product-card">
                            {images.length > 0 && (
                                <div className="product-card-img-wrap">
                                    {images.length > 1 && (
                                        <button className="card-arrow" style={{ left: '6px' }}
                                                onClick={e => { e.preventDefault(); setCardImg(productId, -1, images.length); }}>‹</button>
                                    )}
                                    <img
                                        src={images[imgIdx]}
                                        alt={product.name}
                                        className={`product-card-image${outOfStock ? ' out-of-stock' : ''}`}
                                        style={{ cursor: 'zoom-in' }}
                                        onClick={() => setLightbox({ images, index: imgIdx })}
                                    />
                                    {images.length > 1 && (
                                        <button className="card-arrow" style={{ right: '6px' }}
                                                onClick={e => { e.preventDefault(); setCardImg(productId, 1, images.length); }}>›</button>
                                    )}
                                    {images.length > 1 && (
                                        <div className="card-dots">
                                            {images.map((_, i) => (
                                                <div key={i}
                                                     className={`card-dot${i === imgIdx ? ' card-dot-active' : ''}`}
                                                     onClick={() => setCardImgIndex(prev => ({ ...prev, [productId]: i }))} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="product-card-body">
                                <div className="product-card-category">{product.category}</div>
                                <h3 className="product-card-name">{product.name}</h3>
                                <p className="product-card-desc">
                                    {product.description?.slice(0, 80)}{product.description?.length > 80 ? '...' : ''}
                                </p>
                                <div className="product-card-bottom">
                                    <span className="product-card-price">{product.price?.toLocaleString()}₴</span>
                                    <span className={outOfStock ? 'product-card-out-stock' : 'product-card-in-stock'}>
                                        {outOfStock ? t('catalogue_out_stock') : `${t('catalogue_in_stock')}: ${product.stock}`}
                                    </span>
                                </div>
                                <div className="product-card-actions">
                                    <Link to={`/products/${productId}`} className="product-view-btn">
                                        {t('catalogue_view')}
                                    </Link>
                                    <button
                                        className={`product-cart-btn cart-btn-el${outOfStock ? ' disabled' : ''}`}
                                        disabled={outOfStock}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            if (outOfStock) { showToast(t('catalogue_stock_toast')); return; }
                                            try { await addToCart(productId, 1, product); showToast(t('catalogue_added_toast')); }
                                            catch { showToast(t('catalogue_fail_toast')); }
                                        }}
                                    >{t('catalogue_add_cart')}</button>
                                    {canManageProducts && (
                                        <>
                                            <button className="product-edit-btn"
                                                    onClick={() => navigate(`/products/${productId}/edit`)}>
                                                {t('catalogue_edit')}
                                            </button>
                                            <button className="product-delete-btn"
                                                    onClick={() => setConfirmDelete(productId)}>
                                                {t('catalogue_delete')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductList;