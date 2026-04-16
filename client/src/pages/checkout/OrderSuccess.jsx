import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const [ordersHovered, setOrdersHovered] = useState(false);
    const [shopHovered, setShopHovered] = useState(false);

    return (
        <div style={s.page}>
            <div style={s.card}>
                <div style={s.icon}>✓</div>
                <h1 style={s.title}>Order Placed Successfully!</h1>
                <p style={s.subtitle}>
                    Thank you for your order. Your items will be delivered across Ukraine
                    via your chosen delivery service.
                </p>
                <div style={s.actions}>
                    <button
                        onMouseEnter={() => setOrdersHovered(true)}
                        onMouseLeave={() => setOrdersHovered(false)}
                        style={{ ...s.ordersBtn, ...(ordersHovered ? s.ordersBtnHover : {}) }}
                        onClick={() => navigate('/orders')}
                    >
                        View My Orders
                    </button>
                    <button
                        onMouseEnter={() => setShopHovered(true)}
                        onMouseLeave={() => setShopHovered(false)}
                        style={{ ...s.shopBtn, ...(shopHovered ? s.shopBtnHover : {}) }}
                        onClick={() => navigate('/')}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

const s = {
    page: { minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' },
    card: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '20px', padding: '60px 48px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' },
    icon: { width: '72px', height: '72px', backgroundColor: '#dcfce7', border: '2px solid #86efac', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px', color: '#16a34a' },
    title: { fontSize: '26px', fontWeight: '700', color: '#040d15', margin: '0 0 12px' },
    subtitle: { fontSize: '15px', color: '#6b7a8d', lineHeight: '1.6', margin: '0 0 36px' },
    actions: { display: 'flex', flexDirection: 'column', gap: '12px' },
    ordersBtn: { padding: '13px', backgroundColor: '#1f73b7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s ease' },
    ordersBtnHover: { backgroundColor: '#145082' },
    shopBtn: { padding: '13px', backgroundColor: 'transparent', color: '#1f73b7', border: '1px solid #1f73b7', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
    shopBtnHover: { backgroundColor: '#1f73b7', color: '#ffffff' },
};

export default OrderSuccess;