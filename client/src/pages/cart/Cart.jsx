import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/context/CartContext';
import { useLanguage } from '../../store/context/LanguageContext';

const Cart = () => {
    const { cart, cartLoading, updateItem, removeItem, clearCart } = useCart();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const total = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

    if (cartLoading) return (
        <div className="page-container cart-page">
            <div className="center-loader"><div className="shared-spinner" /></div>
        </div>
    );

    return (
        <div className="page-container cart-page">
            <div className="cart-wrapper">
                <h1 className="cart-title">{t('cart_title')}</h1>

                {!cart?.items?.length ? (
                    <div className="cart-empty-box">
                        <p className="cart-empty-text">{t('cart_empty')}</p>
                        <button className="cart-shop-btn" onClick={() => navigate('/')}>{t('cart_browse')}</button>
                    </div>
                ) : (
                    <>
                        <div className="cart-item-list">
                            {cart.items.map((item) => {
                                const productId = item.product?._id || item.product?.id || item.product;
                                const productName = item.product?.name || 'Product';
                                const productImage = item.product?.images?.[0] || null;
                                return (
                                    <div key={productId} className="cart-item-card">
                                        {productImage && (
                                            <img
                                                src={productImage}
                                                alt={productName}
                                                className="cart-item-img"
                                            />
                                        )}
                                        <div className="cart-item-info">
                                            <div className="cart-item-name">{productName}</div>
                                            <div className="cart-item-price-each">{item.price?.toLocaleString()}₴ {t('cart_each')}</div>
                                        </div>
                                        <div className="cart-item-controls">
                                            <button
                                                className="cart-qty-btn"
                                                onClick={() => item.quantity > 1
                                                    ? updateItem(productId, item.quantity - 1)
                                                    : removeItem(productId)
                                                }
                                            >–</button>
                                            <span className="cart-qty-num">{item.quantity}</span>
                                            <button
                                                className="cart-qty-btn"
                                                onClick={() => updateItem(productId, item.quantity + 1)}
                                            >+</button>
                                        </div>
                                        <div className="cart-item-bottom">
                                            <div className="cart-item-total">
                                                {(item.price * item.quantity).toLocaleString()}₴
                                            </div>
                                            <button
                                                className="cart-remove-btn-el cart-remove-btn"
                                                onClick={() => removeItem(productId)}
                                            >
                                                {t('cart_remove')}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cart-summary-box">
                            <div className="cart-summary-row">
                                <span className="cart-summary-label">
                                    {t('cart_total')} ({cart.items.reduce((s, i) => s + i.quantity, 0)} {t('cart_items')})
                                </span>
                                <span className="cart-summary-total">{total.toLocaleString()}₴</span>
                            </div>
                            <div className="cart-summary-actions">
                                <button className="cart-clear-btn" onClick={clearCart}>
                                    {t('cart_clear')}
                                </button>
                                <button className="cart-checkout-btn" onClick={() => navigate('/checkout')}>
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

export default Cart;