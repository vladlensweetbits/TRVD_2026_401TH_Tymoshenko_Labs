import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [backHovered, setBackHovered] = useState(false);
    const [cancelHovered, setCancelHovered] = useState(false);
    const [confirmHovered, setConfirmHovered] = useState(false);
    const [dismissHovered, setDismissHovered] = useState(false);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await orderService.getById(id);
                setOrder(res.data);
            } catch {
                setError(t('order_not_found'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            const res = await orderService.cancel(id);
            setOrder(res.data);
            setConfirmCancel(false);
            showToast(t('order_cancel_success'));
        } catch (err) {
            showToast(err.response?.data?.message || t('order_cancel_fail'));
            setConfirmCancel(false);
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return (
        <div style={s.page}><div style={s.center}><div style={s.spinner} /></div></div>
    );

    if (error || !order) return (
        <div style={s.page}>
            <div style={s.errorBox}>{error || t('order_not_found')}</div>
            <button style={s.backBtn} onClick={() => navigate('/orders')}>{t('order_back')}</button>
        </div>
    );

    const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
    const date = new Date(order.createdAt).toLocaleDateString('uk-UA', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const orderId = order._id || order.id;
    const canCancel = order.status === 'pending';

    const userName = order.user?.name || order.guestInfo?.name || 'N/A';
    const userNameParts = userName.trim().split(' ');
    const firstName = userNameParts[0] || '';
    const lastName = userNameParts.slice(1).join(' ') || '';

    return (
        <div style={s.page}>
            {toast && <div style={s.toast}>{toast}</div>}

            {confirmCancel && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <p style={s.modalText}>{t('order_cancel_confirm')}</p>
                        <div style={s.modalBtns}>
                            <button
                                onMouseEnter={() => setDismissHovered(true)}
                                onMouseLeave={() => setDismissHovered(false)}
                                style={{ ...s.dismissBtn, ...(dismissHovered ? s.dismissBtnHover : {}) }}
                                onClick={() => setConfirmCancel(false)}
                            >
                                {t('order_no')}
                            </button>
                            <button
                                onMouseEnter={() => setConfirmHovered(true)}
                                onMouseLeave={() => setConfirmHovered(false)}
                                style={{ ...s.confirmCancelBtn, ...(confirmHovered ? s.confirmCancelBtnHover : {}) }}
                                onClick={handleCancel}
                                disabled={cancelling}
                            >
                                {cancelling ? t('order_cancelling') : t('order_yes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onMouseEnter={() => setBackHovered(true)}
                onMouseLeave={() => setBackHovered(false)}
                style={{ ...s.backBtn, ...(backHovered ? s.backBtnHover : {}) }}
                onClick={() => navigate('/orders')}
            >
                {t('order_back')}
            </button>

            <div style={s.wrapper}>
                <div style={s.card}>
                    <div style={s.cardHeader}>
                        <div>
                            <h1 style={s.title}>Order #{orderId?.slice(-8).toUpperCase()}</h1>
                            <p style={s.date}>{date}</p>
                        </div>
                        <div style={s.badgeRow}>
                            {order.isPaid ? (
                                <span style={s.paidBadge}>{t('order_paid_online')}</span>
                            ) : (
                                <span style={s.unpaidBadge}>{t('order_pay_delivery')}</span>
                            )}
                            <span style={{ ...s.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                                {t(`status_${order.status}`)}
                            </span>
                        </div>
                    </div>

                    <div style={s.section}>
                        <h3 style={s.sectionTitle}>{t('order_customer_info')}</h3>
                        <div style={s.deliveryGrid}>
                            <div style={s.deliveryItem}>
                                <span style={s.deliveryLabel}>{t('order_first_name')}</span>
                                <span style={s.deliveryValue}>{firstName}</span>
                            </div>
                            {lastName && (
                                <div style={s.deliveryItem}>
                                    <span style={s.deliveryLabel}>{t('order_last_name')}</span>
                                    <span style={s.deliveryValue}>{lastName}</span>
                                </div>
                            )}
                            {order.guestInfo?.email && (
                                <div style={s.deliveryItem}>
                                    <span style={s.deliveryLabel}>{t('order_email')}</span>
                                    <span style={s.deliveryValue}>{order.guestInfo.email}</span>
                                </div>
                            )}
                            <div style={s.deliveryItem}>
                                <span style={s.deliveryLabel}>{t('order_phone')}</span>
                                <span style={s.deliveryValue}>{order.address?.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div style={s.divider} />

                    <div style={s.section}>
                        <h3 style={s.sectionTitle}>{t('order_items')}</h3>
                        <div style={s.itemList}>
                            {order.items?.map((item, i) => {
                                const name = item.product?.name || 'Product';
                                const img = item.product?.images?.[0] || null;
                                return (
                                    <div key={i} style={s.item}>
                                        {img ? (
                                            <img src={img} alt={name} style={s.itemImg} />
                                        ) : (
                                            <div style={s.itemImgPlaceholder} />
                                        )}
                                        <div style={s.itemInfo}>
                                            <div style={s.itemName}>{name}</div>
                                            <div style={s.itemQty}>{t('order_qty')} {item.quantity}</div>
                                        </div>
                                        <div style={s.itemPrice}>
                                            {(item.price * item.quantity).toLocaleString()}₴
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={s.divider} />

                    <div style={s.section}>
                        <h3 style={s.sectionTitle}>{t('order_delivery')}</h3>
                        <div style={s.deliveryGrid}>
                            <div style={s.deliveryItem}>
                                <span style={s.deliveryLabel}>{t('order_delivery_service')}</span>
                                <span style={s.deliveryValue}>
                                    {order.address?.street?.includes(',')
                                        ? order.address.street.split(',')[0].trim()
                                        : 'N/A'}
                                </span>
                            </div>
                            <div style={s.deliveryItem}>
                                <span style={s.deliveryLabel}>{t('order_warehouse')}</span>
                                <span style={s.deliveryValue}>
                                    {order.address?.street?.includes(',')
                                        ? order.address.street.split(',').slice(1).join(',').trim()
                                        : order.address?.street}
                                </span>
                            </div>
                            <div style={s.deliveryItem}>
                                <span style={s.deliveryLabel}>{t('order_city')}</span>
                                <span style={s.deliveryValue}>{order.address?.city}</span>
                            </div>
                            <div style={s.deliveryItem}>
                                <span style={s.deliveryLabel}>{t('order_postal_code')}</span>
                                <span style={s.deliveryValue}>{order.address?.zip}</span>
                            </div>
                        </div>
                    </div>

                    <div style={s.divider} />

                    <div style={s.section}>
                        <h3 style={s.sectionTitle}>{t('order_payment')}</h3>
                        <div style={s.deliveryGrid}>
                            <div style={s.deliveryItem}>
                                <span style={s.deliveryLabel}>{t('order_payment_method')}</span>
                                <span style={s.deliveryValue}>
                                    {order.isPaid ? t('order_online_card') : t('order_cash_delivery')}
                                </span>
                            </div>
                            <div style={s.deliveryItem}>
                                <span style={s.deliveryLabel}>{t('order_payment_status')}</span>
                                <span style={{ ...s.deliveryValue, color: order.isPaid ? '#16a34a' : '#854d0e', fontWeight: '600' }}>
                                    {order.isPaid ? t('order_paid_status') : t('order_pending_payment')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={s.divider} />

                    <div style={s.totalRow}>
                        <span style={s.totalLabel}>{t('order_total')}</span>
                        <span style={s.totalAmount}>{order.totalPrice?.toLocaleString()}₴</span>
                    </div>

                    {canCancel && (
                        <button
                            onMouseEnter={() => setCancelHovered(true)}
                            onMouseLeave={() => setCancelHovered(false)}
                            style={{ ...s.cancelBtn, ...(cancelHovered ? s.cancelBtnHover : {}) }}
                            onClick={() => setConfirmCancel(true)}
                        >
                            {t('order_cancel')}
                        </button>
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
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
    title: { fontSize: '22px', fontWeight: '700', color: '#040d15', margin: '0 0 6px' },
    date: { fontSize: '13px', color: '#6b7a8d', margin: 0 },
    badgeRow: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
    paidBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', whiteSpace: 'nowrap' },
    unpaidBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', whiteSpace: 'nowrap' },
    statusBadge: { padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' },
    section: { marginBottom: '24px' },
    sectionTitle: { fontSize: '13px', color: '#6b7a8d', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', marginBottom: '16px' },
    itemList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    item: { display: 'flex', alignItems: 'center', gap: '14px' },
    itemImg: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e7ef', flexShrink: 0 },
    itemImgPlaceholder: { width: '80px', height: '80px', borderRadius: '8px', backgroundColor: '#f0f4f8', border: '1px solid #e0e7ef', flexShrink: 0 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: '15px', fontWeight: '600', color: '#040d15', marginBottom: '4px' },
    itemQty: { fontSize: '13px', color: '#6b7a8d' },
    itemPrice: { fontSize: '15px', fontWeight: '700', color: '#1f73b7' },
    divider: { height: '1px', backgroundColor: '#e0e7ef', margin: '24px 0' },
    deliveryGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
    deliveryItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    deliveryLabel: { fontSize: '13px', color: '#6b7a8d' },
    deliveryValue: { fontSize: '14px', fontWeight: '500', color: '#040d15' },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    totalLabel: { fontSize: '16px', color: '#6b7a8d', fontWeight: '500' },
    totalAmount: { fontSize: '26px', fontWeight: '700', color: '#040d15' },
    cancelBtn: { width: '100%', padding: '12px', backgroundColor: 'transparent', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s ease' },
    cancelBtnHover: { backgroundColor: '#dc2626', color: '#ffffff' },
    errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e7ef', color: '#040d15', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 1000, fontSize: '14px' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modal: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '12px', padding: '32px', maxWidth: '360px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
    modalText: { color: '#040d15', fontSize: '16px', marginBottom: '24px', textAlign: 'center' },
    modalBtns: { display: 'flex', gap: '12px', justifyContent: 'center' },
    dismissBtn: { padding: '10px 24px', backgroundColor: '#f0f4f8', border: '1px solid #d1dce8', color: '#040d15', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease' },
    dismissBtnHover: { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' },
    confirmCancelBtn: { padding: '10px 24px', backgroundColor: '#dc2626', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.2s ease' },
    confirmCancelBtnHover: { backgroundColor: '#b91c1c' },
};

export default OrderDetail;