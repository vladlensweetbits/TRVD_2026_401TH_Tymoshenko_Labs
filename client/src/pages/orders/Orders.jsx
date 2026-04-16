import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/api/orderService';

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
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await orderService.getMyOrders();
                setOrders(res.data || []);
            } catch {
                setError('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div style={s.page}><div style={s.center}><div style={s.spinner} /></div></div>
    );

    return (
        <div style={s.page}>
            {toast && <div style={s.toast}>{toast}</div>}

            <h1 style={s.title}>My Orders</h1>

            {error && <div style={s.errorBox}>{error}</div>}

            {!loading && !error && orders.length === 0 && (
                <div style={s.emptyBox}>
                    <p style={s.emptyText}>You have no orders yet</p>
                    <button style={s.shopBtn} onClick={() => navigate('/')}>
                        Browse Products
                    </button>
                </div>
            )}

            <div style={s.list}>
                {orders.map((order) => {
                    const orderId = order._id || order.id;
                    const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                    const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                    });

                    return (
                        <div
                            key={orderId}
                            style={s.card}
                            onClick={() => navigate(`/orders/${orderId}`)}
                        >
                            <div style={s.cardHeader}>
                                <div>
                                    <div style={s.orderId}>Order #{orderId?.slice(-8).toUpperCase()}</div>
                                    <div style={s.orderDate}>{date}</div>
                                </div>
                                <div style={s.badgeRow}>
                                    {order.isPaid && (
                                        <span style={s.paidBadge}>✓ Paid</span>
                                    )}
                                    <span style={{ ...s.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div style={s.imageRow}>
                                {order.items?.slice(0, 4).map((item, i) => {
                                    const img = item.product?.images?.[0];
                                    return img ? (
                                        <img key={i} src={img} alt={item.product?.name} style={s.thumb} />
                                    ) : (
                                        <div key={i} style={s.thumbPlaceholder} />
                                    );
                                })}
                                {order.items?.length > 4 && (
                                    <div style={s.moreItems}>+{order.items.length - 4}</div>
                                )}
                            </div>

                            <div style={s.cardFooter}>
                                <span style={s.itemCount}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
                                <span style={s.total}>${order.totalPrice?.toLocaleString()}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const s = {
    page: { minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '32px', color: '#040d15', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    title: { fontSize: '28px', fontWeight: '700', color: '#040d15', marginBottom: '28px', width: '100%', maxWidth: '800px' },
    center: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
    spinner: { width: '40px', height: '40px', border: '4px solid #d1dce8', borderTop: '4px solid #1f73b7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', width: '100%', maxWidth: '800px' },
    emptyBox: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '60px', textAlign: 'center', border: '1px solid #e0e7ef', width: '100%', maxWidth: '800px' },
    emptyText: { color: '#6b7a8d', fontSize: '18px', marginBottom: '20px' },
    shopBtn: { backgroundColor: '#1f73b7', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
    list: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '800px' },
    card: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '12px', padding: '24px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s ease, transform 0.2s ease' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
    orderId: { fontSize: '15px', fontWeight: '700', color: '#040d15', marginBottom: '4px' },
    orderDate: { fontSize: '13px', color: '#6b7a8d' },
    badgeRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    paidBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
    statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    imageRow: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
    thumb: { width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e7ef' },
    thumbPlaceholder: { width: '72px', height: '72px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #e0e7ef' },
    moreItems: { width: '72px', height: '72px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #e0e7ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7a8d' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e0e7ef' },
    itemCount: { fontSize: '13px', color: '#6b7a8d' },
    total: { fontSize: '18px', fontWeight: '700', color: '#1f73b7' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e7ef', color: '#040d15', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 1000, fontSize: '14px' },
};

export default Orders;