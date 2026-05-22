import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/api/orderService';
import { useLanguage } from '../../store/context/LanguageContext';

const STATUS_COLORS = {
    pending:    { bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
    processing: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
    shipped:    { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
    delivered:  { bg: '#dcfce7', color: '#166534', border: '#86efac' },
    cancelled:  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
    returned:   { bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' },
};

const Orders = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await orderService.getMyOrders();
                setOrders(res.data || []);
            } catch { setError(t('orders_load_fail')); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return (
        <div className="orders-page">
            <div className="center-loader"><div className="shared-spinner" /></div>
        </div>
    );

    return (
        <div className="orders-page page-wrapper">
            <h1 className="orders-title">{t('orders_title')}</h1>
            {error && <div className="orders-error-box">{error}</div>}
            {!loading && !error && orders.length === 0 && (
                <div className="orders-empty-box">
                    <p className="orders-empty-text">{t('orders_empty')}</p>
                    <button className="orders-browse-btn" onClick={() => navigate('/')}>{t('orders_browse')}</button>
                </div>
            )}
            <div className="orders-list">
                {orders.map((order) => {
                    const orderId = order._id || order.id;
                    const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                    const date = new Date(order.createdAt).toLocaleDateString('uk-UA', {
                        day: '2-digit', month: 'short', year: 'numeric',
                    });
                    const itemCount = order.items?.length || 0;
                    return (
                        <div key={orderId} className="orders-card" onClick={() => navigate(`/orders/${orderId}`)}>
                            <div className="orders-card-header order-card-header">
                                <div>
                                    <div className="orders-id">Order #{orderId?.slice(-8).toUpperCase()}</div>
                                    <div className="orders-date">{date}</div>
                                </div>
                                <div className="orders-badge-row order-badge-row">
                                    {order.isPaid && <span className="orders-paid-badge">{t('orders_paid')}</span>}
                                    <span
                                        className="orders-status-badge"
                                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
                                    >
                                        {t(`status_${order.status}`)}
                                    </span>
                                </div>
                            </div>
                            <div className="orders-image-row">
                                {order.items?.slice(0, 4).map((item, i) => {
                                    const img = item.product?.images?.[0];
                                    return img
                                        ? <img key={i} src={img} alt={item.product?.name} className="orders-thumb" />
                                        : <div key={i} className="orders-thumb-placeholder" />;
                                })}
                                {order.items?.length > 4 && (
                                    <div className="orders-more-items">+{order.items.length - 4}</div>
                                )}
                            </div>
                            <div className="orders-card-footer">
                                <span className="orders-item-count">{itemCount} {itemCount === 1 ? t('orders_item') : t('orders_items')}</span>
                                <span className="orders-total">{order.totalPrice?.toLocaleString()}₴</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Orders;