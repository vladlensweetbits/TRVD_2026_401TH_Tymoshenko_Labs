import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';
import { useCart } from '../../store/context/CartContext.jsx';
import { useLanguage } from '../../store/context/LanguageContext.jsx';
import productService from '../../services/api/productService';
import reviewService from '../../services/api/reviewService';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { t, language } = useLanguage();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [activeImg, setActiveImg] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [lightboxImg, setLightboxImg] = useState(0);

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [newRating, setNewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [reviewErrors, setReviewErrors] = useState({});
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editHoverRating, setEditHoverRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [editErrors, setEditErrors] = useState({});
    const [editSaving, setEditSaving] = useState(false);
    const [confirmDeleteReview, setConfirmDeleteReview] = useState(null);
    const [deletingReview, setDeletingReview] = useState(false);

    const canManageProducts = user?.role === 'admin' || user?.role === 'employee';
    const userId = user?.id || user?._id;
    const locale = language === 'uk' ? 'uk-UA' : 'en-US';

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const loadProduct = async () => {
        try { const res = await productService.getById(id); setProduct(res.data); } catch {}
    };

    useEffect(() => {
        const fetch = async () => {
            if (!id || id === 'undefined') { setError(t('detail_invalid_id')); setLoading(false); return; }
            try { const res = await productService.getById(id); setProduct(res.data); }
            catch { setError(t('detail_not_found')); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    const loadReviews = async () => {
        setReviewsLoading(true);
        try { const res = await reviewService.getByProduct(id); setReviews(res.data || []); }
        catch { setReviews([]); }
        finally { setReviewsLoading(false); }
    };

    useEffect(() => { if (id && id !== 'undefined') loadReviews(); }, [id]);

    useEffect(() => {
        const handleKey = (e) => {
            if (!lightbox || !product?.images?.length) return;
            if (e.key === 'ArrowRight') setLightboxImg(i => (i + 1) % product.images.length);
            if (e.key === 'ArrowLeft') setLightboxImg(i => (i - 1 + product.images.length) % product.images.length);
            if (e.key === 'Escape') setLightbox(false);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightbox, product]);

    const handleDelete = async () => {
        try { await productService.delete(id); showToast(t('detail_delete_success')); setTimeout(() => navigate('/'), 1500); }
        catch { showToast(t('detail_delete_fail')); setConfirmDelete(false); }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!newRating) errs.rating = t('reviews_err_rating');
        if (!newComment.trim()) errs.comment = t('reviews_err_comment');
        else if (newComment.length > 1000) errs.comment = t('reviews_err_limit');
        if (Object.keys(errs).length > 0) { setReviewErrors(errs); return; }
        setReviewSubmitting(true);
        try {
            await reviewService.create({ product: id, rating: newRating, comment: newComment.trim() });
            await loadReviews(); await loadProduct();
            setNewRating(0); setNewComment(''); setReviewErrors({});
            showToast(t('reviews_success'));
        } catch { showToast(t('reviews_fail')); }
        finally { setReviewSubmitting(false); }
    };

    const handleEditSave = async () => {
        const errs = {};
        if (!editRating) errs.rating = t('reviews_err_rating');
        if (!editComment.trim()) errs.comment = t('reviews_err_comment');
        else if (editComment.length > 1000) errs.comment = t('reviews_err_limit');
        if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
        setEditSaving(true);
        try {
            await reviewService.update(editingReview._id || editingReview.id, { rating: editRating, comment: editComment.trim() });
            await loadReviews(); await loadProduct();
            setEditingReview(null); showToast(t('reviews_updated'));
        } catch { showToast(t('reviews_update_fail')); }
        finally { setEditSaving(false); }
    };

    const handleReviewDelete = async () => {
        setDeletingReview(true);
        try {
            await reviewService.delete(confirmDeleteReview);
            await loadReviews(); await loadProduct();
            setConfirmDeleteReview(null); showToast(t('reviews_deleted'));
        } catch { showToast(t('reviews_delete_fail')); }
        finally { setDeletingReview(false); }
    };

    const userReviewCount = reviews.filter(r => (r.user?._id || r.user?.id) === userId).length;
    const canSubmitReview = user && userReviewCount < 5;

    if (loading) return (
        <div className="detail-page-wrapper">
            <div className="center-loader"><div className="shared-spinner" /></div>
        </div>
    );

    if (error || !product) return (
        <div className="detail-page-wrapper">
            <div className="api-error-box">{error || t('detail_load_fail')}</div>
            <button className="back-btn" onClick={() => navigate('/')}>{t('detail_back')}</button>
        </div>
    );

    const outOfStock = product.stock === 0;
    const images = product.images || [];

    return (
        <div className="detail-page-wrapper">
            {toast && <div className="shared-toast">{toast}</div>}

            {/* Lightbox */}
            {lightbox && images.length > 0 && (
                <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightbox(false)}>✕</button>
                        {images.length > 1 && (
                            <button className="lightbox-arrow" style={{ left: '12px' }}
                                    onClick={() => setLightboxImg(i => (i - 1 + images.length) % images.length)}>‹</button>
                        )}
                        <img src={images[lightboxImg]} alt={product.name} className="lightbox-img" />
                        {images.length > 1 && (
                            <button className="lightbox-arrow" style={{ right: '12px' }}
                                    onClick={() => setLightboxImg(i => (i + 1) % images.length)}>›</button>
                        )}
                        {images.length > 1 && (
                            <div className="lightbox-dots">
                                {images.map((_, i) => (
                                    <div key={i}
                                         className={`lightbox-dot${i === lightboxImg ? ' lightbox-dot-active' : ''}`}
                                         onClick={() => setLightboxImg(i)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete product confirm */}
            {confirmDelete && (
                <div className="shared-overlay">
                    <div className="shared-modal">
                        <p className="shared-modal-text">{t('detail_delete_confirm')}</p>
                        <div className="shared-modal-btns">
                            <button className="modal-cancel-btn" onClick={() => setConfirmDelete(false)}>
                                {t('detail_cancel')}
                            </button>
                            <button className="modal-danger-btn" onClick={handleDelete}>
                                {t('catalogue_delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete review confirm */}
            {confirmDeleteReview && (
                <div className="shared-overlay">
                    <div className="shared-modal">
                        <p className="shared-modal-text">{t('reviews_delete_confirm')}</p>
                        <div className="shared-modal-btns">
                            <button className="modal-cancel-btn" onClick={() => setConfirmDeleteReview(null)}>
                                {t('detail_cancel')}
                            </button>
                            <button className="modal-danger-btn" onClick={handleReviewDelete} disabled={deletingReview}>
                                {deletingReview ? '...' : t('reviews_delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button className="back-btn" onClick={() => navigate('/')}>{t('detail_back')}</button>

            <div className="detail-wrapper">
                <div className="detail-page-card">
                    <div className="detail-top-row">
                        <span className="detail-category">{product.category}</span>
                        <span className={outOfStock ? 'detail-out-stock' : 'detail-in-stock'}>
                            {outOfStock ? t('catalogue_out_stock') : `${t('catalogue_in_stock')}: ${product.stock} ${t('detail_pcs')}`}
                        </span>
                    </div>

                    <h1 className="detail-name">{product.name}</h1>

                    {images.length > 0 && (
                        <div className="detail-gallery-wrap">
                            <div className="detail-main-img-wrap">
                                {images.length > 1 && (
                                    <button className="detail-gallery-arrow" style={{ left: '10px' }}
                                            onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}>‹</button>
                                )}
                                <img
                                    src={images[activeImg]}
                                    alt={product.name}
                                    className={`detail-main-image${outOfStock ? ' out-of-stock' : ''}`}
                                    style={{ cursor: 'zoom-in' }}
                                    onClick={() => { setLightboxImg(activeImg); setLightbox(true); }}
                                />
                                {images.length > 1 && (
                                    <button className="detail-gallery-arrow" style={{ right: '10px' }}
                                            onClick={() => setActiveImg(i => (i + 1) % images.length)}>›</button>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="detail-thumb-row">
                                    {images.map((img, i) => (
                                        <img key={i} src={img} alt=""
                                             className={`detail-thumb${i === activeImg ? ' detail-thumb-active' : ''}${outOfStock ? ' detail-thumb-grey' : ''}`}
                                             onClick={() => setActiveImg(i)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <p className="detail-price">{product.price?.toLocaleString()}₴</p>

                    <button
                        className="detail-add-cart-btn"
                        disabled={outOfStock}
                        onClick={async () => {
                            if (outOfStock) { showToast(t('detail_stock_toast')); return; }
                            try { await addToCart(id, 1, product); showToast(t('detail_added_toast')); }
                            catch { showToast(t('detail_stock_toast')); }
                        }}
                    >
                        {outOfStock ? t('detail_out_stock') : t('detail_add_cart')}
                    </button>

                    <div className="detail-section">
                        <h3 className="detail-section-title">{t('detail_description')}</h3>
                        <p className="detail-desc">{product.description}</p>
                    </div>

                    {product.specs && (
                        <div className="detail-section">
                            <h3 className="detail-section-title">{t('detail_specs')}</h3>
                            <table className="detail-specs-table">
                                <tbody>
                                {Object.entries(product.specs).map(([key, val]) => (
                                    <tr key={key}>
                                        <td className="detail-specs-key">{key}</td>
                                        <td className="detail-specs-val">{val}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {product.rating > 0 && (
                        <div className="detail-section">
                            <span className="detail-rating">{t('detail_rating')}: {product.rating.toFixed(1)} / 5</span>
                        </div>
                    )}

                    {/* Reviews */}
                    <div className="detail-section">
                        <h3 className="detail-section-title">{t('reviews_title')} ({reviews.length})</h3>

                        {!user ? (
                            <div className="review-login-banner">
                                {t('reviews_login_prompt')} —{' '}
                                <span className="review-login-link" onClick={() => navigate('/login')}>
                                    {t('nav_login')}
                                </span>
                            </div>
                        ) : canSubmitReview ? (
                            <div className="review-form-card">
                                <h4 className="review-form-title">{t('reviews_your_review')}</h4>
                                <form onSubmit={handleReviewSubmit} noValidate>
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                                            {[1,2,3,4,5].map(star => (
                                                <span
                                                    key={star}
                                                    className="review-star-new"
                                                    style={{ color: star <= (hoverRating || newRating) ? '#f59e0b' : '#d1dce8' }}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => { setNewRating(star); setReviewErrors({ ...reviewErrors, rating: '' }); }}
                                                >★</span>
                                            ))}
                                        </div>
                                        {reviewErrors.rating && <span className="review-error">{reviewErrors.rating}</span>}
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <textarea
                                            className={`review-textarea${reviewErrors.comment ? ' has-error' : ''}`}
                                            value={newComment}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setNewComment(val);
                                                if (val.length <= 1000) setReviewErrors({ ...reviewErrors, comment: '' });
                                                else setReviewErrors({ ...reviewErrors, comment: t('reviews_err_limit') });
                                            }}
                                            placeholder={t('reviews_placeholder')}
                                            rows={4}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                            {reviewErrors.comment ? <span className="review-error">{reviewErrors.comment}</span> : <span />}
                                            <span style={{ fontSize: '12px', color: newComment.length >= 1000 ? '#dc2626' : newComment.length >= 900 ? '#f59e0b' : '#6b7a8d' }}>
                                                {newComment.length}/1000
                                            </span>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={reviewSubmitting} className="review-submit-btn">
                                        {reviewSubmitting ? t('reviews_submitting') : t('reviews_submit')}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="review-max-banner">{t('reviews_max_reached')}</div>
                        )}

                        {reviewsLoading ? (
                            <div className="center-loader"><div className="shared-spinner" /></div>
                        ) : reviews.length === 0 ? (
                            <div className="review-no-reviews">{t('reviews_no_reviews')}</div>
                        ) : (
                            <div className="review-list">
                                {reviews.map(review => {
                                    const reviewId = review._id || review.id;
                                    const reviewUserId = review.user?._id || review.user?.id;
                                    const isOwner = userId === reviewUserId;
                                    const isEditing = editingReview && (editingReview._id || editingReview.id) === reviewId;
                                    const canDelete = isOwner || user?.role === 'admin';
                                    const date = new Date(review.createdAt).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
                                    return (
                                        <div key={reviewId} className="review-card">
                                            <div className="review-header">
                                                <div>
                                                    <div className="review-author">{review.user?.name || 'User'}</div>
                                                    <div className="review-date">{date}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '2px' }}>
                                                    {[1,2,3,4,5].map(star => (
                                                        <span key={star} style={{ fontSize: '16px', color: star <= review.rating ? '#f59e0b' : '#d1dce8', lineHeight: 1 }}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {isEditing ? (
                                                <div style={{ marginTop: '12px' }}>
                                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                                                        {[1,2,3,4,5].map(star => (
                                                            <span
                                                                key={star}
                                                                className="review-star-edit"
                                                                style={{ color: star <= (editHoverRating || editRating) ? '#f59e0b' : '#d1dce8' }}
                                                                onMouseEnter={() => setEditHoverRating(star)}
                                                                onMouseLeave={() => setEditHoverRating(0)}
                                                                onClick={() => { setEditRating(star); setEditErrors({ ...editErrors, rating: '' }); }}
                                                            >★</span>
                                                        ))}
                                                    </div>
                                                    {editErrors.rating && <span className="review-error">{editErrors.rating}</span>}
                                                    <textarea
                                                        className={`review-textarea${editErrors.comment ? ' has-error' : ''}`}
                                                        value={editComment}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setEditComment(val);
                                                            if (val.length <= 1000) setEditErrors({ ...editErrors, comment: '' });
                                                            else setEditErrors({ ...editErrors, comment: t('reviews_err_limit') });
                                                        }}
                                                        rows={3}
                                                        style={{ marginTop: '8px' }}
                                                    />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                                        {editErrors.comment ? <span className="review-error">{editErrors.comment}</span> : <span />}
                                                        <span style={{ fontSize: '12px', color: editComment.length >= 1000 ? '#dc2626' : '#6b7a8d' }}>
                                                            {editComment.length}/1000
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                        <button className="review-save-btn" onClick={handleEditSave} disabled={editSaving}>
                                                            {editSaving ? '...' : t('reviews_save')}
                                                        </button>
                                                        <button className="review-cancel-btn" onClick={() => setEditingReview(null)}>
                                                            {t('reviews_cancel')}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="review-comment">{review.comment}</p>
                                                    {(isOwner || canDelete) && (
                                                        <div className="review-actions">
                                                            {isOwner && (
                                                                <button className="review-edit-btn" onClick={() => {
                                                                    setEditingReview(review);
                                                                    setEditRating(review.rating);
                                                                    setEditComment(review.comment);
                                                                    setEditErrors({});
                                                                }}>{t('reviews_edit')}</button>
                                                            )}
                                                            {canDelete && (
                                                                <button className="review-delete-btn" onClick={() => setConfirmDeleteReview(reviewId)}>
                                                                    {t('reviews_delete')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {canManageProducts && (
                        <div className="detail-admin-actions">
                            <button className="detail-edit-btn" onClick={() => navigate(`/products/${id}/edit`)}>
                                {t('detail_edit')}
                            </button>
                            <button className="detail-delete-btn" onClick={() => setConfirmDelete(true)}>
                                {t('detail_delete')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;