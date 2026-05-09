import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/context/CartContext';
import { useLanguage } from '../../store/context/LanguageContext';

const Cart = () => {
    const { cart, cartLoading, updateItem, removeItem, clearCart } = useCart();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [hoveredRemove, setHoveredRemove] = useState(null);
    const [hoveredClear, setHoveredClear] = useState(false);
    const [hoveredCheckout, setHoveredCheckout] = useState(false);

    const total = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

    if (cartLoading) return (
        <div style={s.page}><div style={s.center}><div style={s.spinner} /></div></div>
    );

    return (
        <div style={s.page}>
            <div style={s.wrapper}>
                <h1 style={s.title}>{t('cart_title')}</h1>

                {!cart?.items?.length ? (
                    <div style={s.emptyBox}>
                        <p style={s.emptyText}>{t('cart_empty')}</p>
                        <button style={s.shopBtn} onClick={() => navigate('/')}>{t('cart_browse')}</button>
                    </div>
                ) : (
                    <>
                        <div style={s.itemList}>
                            {cart.items.map((item) => {
                                const productId = item.product?._id || item.product?.id || item.product;
                                const productName = item.product?.name || 'Product';
                                const productImage = item.product?.images?.[0] || null;
                                return (
                                    <div key={productId} style={s.itemCard}>
                                        {productImage && <img src={productImage} alt={productName} style={s.itemImage} />}
                                        <div style={s.itemInfo}>
                                            <div style={s.itemName}>{productName}</div>
                                            <div style={s.itemPrice}>{item.price?.toLocaleString()}₴ {t('cart_each')}</div>
                                        </div>
                                        <div style={s.itemControls}>
                                            <button style={s.qtyBtn}
                                                    onClick={() => item.quantity > 1 ? updateItem(productId, item.quantity - 1) : removeItem(productId)}>-</button>
                                            <span style={s.qty}>{item.quantity}</span>
                                            <button style={s.qtyBtn}
                                                    onClick={() => updateItem(productId, item.quantity + 1)}>+</button>
                                        </div>
                                        <div style={s.itemTotal}>{(item.price * item.quantity).toLocaleString()}₴</div>
                                        <button
                                            onMouseEnter={() => setHoveredRemove(productId)}
                                            onMouseLeave={() => setHoveredRemove(null)}
                                            style={{ ...s.removeBtn, ...(hoveredRemove === productId ? s.removeBtnHover : {}) }}
                                            onClick={() => removeItem(productId)}
                                        >
                                            {t('cart_remove')}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={s.summary}>
                            <div style={s.summaryRow}>
                                <span style={s.summaryLabel}>{t('cart_total')} ({cart.items.reduce((s, i) => s + i.quantity, 0)} {t('cart_items')})</span>
                                <span style={s.summaryTotal}>{total.toLocaleString()}₴</span>
                            </div>
                            <div style={s.summaryActions}>
                                <button
                                    onMouseEnter={() => setHoveredClear(true)}
                                    onMouseLeave={() => setHoveredClear(false)}
                                    style={{ ...s.clearBtn, ...(hoveredClear ? s.clearBtnHover : {}) }}
                                    onClick={clearCart}
                                >
                                    {t('cart_clear')}
                                </button>
                                <button
                                    onMouseEnter={() => setHoveredCheckout(true)}
                                    onMouseLeave={() => setHoveredCheckout(false)}
                                    style={{ ...s.checkoutBtn, ...(hoveredCheckout ? s.checkoutBtnHover : {}) }}
                                    onClick={() => navigate('/checkout')}
                                >
                                    {t('cart_checkout')}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const s = {
    page: { minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '32px', color: '#040d15' },
    wrapper: { maxWidth: '800px', margin: '0 auto' },
    title: { fontSize: '28px', fontWeight: '700', color: '#040d15', marginBottom: '28px' },
    center: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
    spinner: { width: '40px', height: '40px', border: '4px solid #d1dce8', borderTop: '4px solid #1f73b7', borderRadius: '50%' },
    emptyBox: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #e0e7ef' },
    emptyText: { color: '#6b7a8d', fontSize: '18px', marginBottom: '20px' },
    shopBtn: { backgroundColor: '#1f73b7', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
    itemList: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
    itemCard: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    itemImage: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e7ef', flexShrink: 0 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: '16px', fontWeight: '700', color: '#040d15', marginBottom: '4px' },
    itemPrice: { fontSize: '13px', color: '#6b7a8d' },
    itemControls: { display: 'flex', alignItems: 'center', gap: '10px' },
    qtyBtn: { width: '32px', height: '32px', border: '1px solid #d1dce8', backgroundColor: '#f0f4f8', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', color: '#040d15' },
    qty: { fontSize: '16px', fontWeight: '700', color: '#040d15', minWidth: '24px', textAlign: 'center' },
    itemTotal: { fontSize: '16px', fontWeight: '700', color: '#1f73b7', minWidth: '80px', textAlign: 'right' },
    removeBtn: { padding: '6px 14px', backgroundColor: 'transparent', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s ease' },
    removeBtnHover: { backgroundColor: '#dc2626', color: '#ffffff' },
    summary: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    summaryLabel: { fontSize: '16px', color: '#6b7a8d' },
    summaryTotal: { fontSize: '24px', fontWeight: '700', color: '#040d15' },
    summaryActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
    clearBtn: { padding: '10px 24px', backgroundColor: 'transparent', border: '1px solid #d1dce8', color: '#6b7a8d', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease' },
    clearBtnHover: { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' },
    checkoutBtn: { padding: '10px 28px', backgroundColor: '#1f73b7', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'background-color 0.2s ease' },
    checkoutBtnHover: { backgroundColor: '#145082' },
};

export default Cart;