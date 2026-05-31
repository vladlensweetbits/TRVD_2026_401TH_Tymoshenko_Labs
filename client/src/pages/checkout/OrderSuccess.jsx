import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext';
import { useLanguage } from '../../store/context/LanguageContext';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    const isGuest = !user;

    return (
        <div className="order-success-page">
            <div className="order-success-card">
                <div className="order-success-icon">✓</div>
                <h1 className="order-success-title">{t('success_title')}</h1>
                <p className="order-success-subtitle">{t('success_subtitle')}</p>

                {isGuest && (
                    <div className="order-success-guest-banner">
                        <div className="order-success-guest-title">{t('success_guest_title')}</div>
                        <div className="order-success-guest-text">{t('success_guest_text')}</div>
                        <button className="order-success-register-btn" onClick={() => navigate('/register')}>
                            {t('success_register')}
                        </button>
                    </div>
                )}

                <div className="order-success-actions">
                    {!isGuest && (
                        <button className="order-success-orders-btn" onClick={() => navigate('/orders')}>
                            {t('success_view_orders')}
                        </button>
                    )}
                    <button className="order-success-shop-btn" onClick={() => navigate('/')}>
                        {t('success_continue')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;