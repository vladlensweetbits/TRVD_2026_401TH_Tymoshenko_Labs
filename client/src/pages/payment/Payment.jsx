import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import orderService from '../../services/api/orderService';
import { useCart } from '../../store/context/CartContext';
import { useLanguage } from '../../store/context/LanguageContext';

const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
};

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();
    const { t } = useLanguage();

    const { items, address, total, guestInfo } = location.state || {};

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [skipLoading, setSkipLoading] = useState(false);

    useEffect(() => { if (!items || !address) navigate('/cart'); }, []);

    if (!items || !address) return null;

    const validate = () => {
        const e = {};
        const rawCard = cardNumber.replace(/\s/g, '');
        if (!cardName.trim()) e.cardName = t('payment_err_name');
        if (!rawCard || rawCard.length < 16) e.cardNumber = t('payment_err_card');
        if (!expiry || expiry.length < 5) e.expiry = t('payment_err_expiry');
        else {
            const [mm, yy] = expiry.split('/');
            const month = parseInt(mm);
            const year = parseInt('20' + yy);
            const now = new Date();
            if (month < 1 || month > 12) e.expiry = t('payment_err_month');
            else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
                e.expiry = t('payment_err_expired');
            }
        }
        if (!cvv || cvv.length < 3) e.cvv = t('payment_err_cvv');
        return e;
    };

    const handlePayOnline = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setLoading(true);
        try {
            await new Promise(res => setTimeout(res, 2000));
            if (guestInfo) { await orderService.createGuest(guestInfo, items, address, true); }
            else { await orderService.create(items, address, true); }
            await clearCart();
            navigate('/order-success');
        } catch {
            setErrors({ submit: t('payment_fail') });
            setLoading(false);
        }
    };

    const handlePayAtNovaPoshta = async () => {
        setSkipLoading(true);
        try {
            if (guestInfo) { await orderService.createGuest(guestInfo, items, address, false); }
            else { await orderService.create(items, address, false); }
            await clearCart();
            navigate('/order-success');
        } catch {
            setErrors({ submit: t('payment_order_fail') });
            setSkipLoading(false);
        }
    };

    const getCardType = () => {
        const n = cardNumber.replace(/\s/g, '');
        if (n.startsWith('4')) return 'VISA';
        if (n.startsWith('5')) return 'MC';
        if (n.startsWith('3')) return 'AMEX';
        return '';
    };

    return (
        <div className="payment-page">
            <button className="back-btn" onClick={() => navigate(-1)}>{t('payment_back')}</button>

            <div className="payment-layout">
                <div>
                    <div className="payment-card">
                        <h2 className="payment-card-title">{t('payment_title')}</h2>
                        <div className="payment-secure-row">
                            <span className="payment-secure-text">{t('payment_secure')}</span>
                        </div>

                        {guestInfo && (
                            <div className="payment-guest-info">
                                {t('payment_guest_info')} <strong>{guestInfo.name}</strong> ({guestInfo.email})
                            </div>
                        )}

                        {errors.submit && <div className="api-error-box">{errors.submit}</div>}

                        <form onSubmit={handlePayOnline} noValidate>
                            <Field label={t('payment_cardholder')} error={errors.cardName}>
                                <input
                                    value={cardName}
                                    onChange={e => { setCardName(e.target.value.toUpperCase()); setErrors({ ...errors, cardName: '' }); }}
                                    placeholder="JOHN DOE"
                                    className={`form-input${errors.cardName ? ' has-error' : ''}`}
                                    autoComplete="cc-name"
                                />
                            </Field>

                            <Field label={t('payment_card_number')} error={errors.cardNumber}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        value={cardNumber}
                                        onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setErrors({ ...errors, cardNumber: '' }); }}
                                        placeholder="0000 0000 0000 0000"
                                        className={`form-input${errors.cardNumber ? ' has-error' : ''}`}
                                        style={{ paddingRight: '60px' }}
                                        autoComplete="cc-number"
                                        inputMode="numeric"
                                    />
                                    {getCardType() && <span className="payment-card-type-badge">{getCardType()}</span>}
                                </div>
                            </Field>

                            <div className="form-row">
                                <div style={{ flex: 1 }}>
                                    <Field label={t('payment_expiry')} error={errors.expiry}>
                                        <input
                                            value={expiry}
                                            onChange={e => { setExpiry(formatExpiry(e.target.value)); setErrors({ ...errors, expiry: '' }); }}
                                            placeholder="MM/YY"
                                            className={`form-input${errors.expiry ? ' has-error' : ''}`}
                                            autoComplete="cc-exp"
                                            inputMode="numeric"
                                        />
                                    </Field>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Field label={t('payment_cvv')} error={errors.cvv}>
                                        <input
                                            value={cvv}
                                            onChange={e => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); setErrors({ ...errors, cvv: '' }); }}
                                            placeholder="•••"
                                            type="password"
                                            className={`form-input${errors.cvv ? ' has-error' : ''}`}
                                            autoComplete="cc-csc"
                                            inputMode="numeric"
                                        />
                                    </Field>
                                </div>
                            </div>

                            <button type="submit" disabled={loading || skipLoading} className="payment-pay-btn">
                                {loading ? (
                                    <span className="payment-loading-row">
                                        <span className="payment-btn-spinner" />{t('payment_processing')}
                                    </span>
                                ) : (
                                    `${t('payment_pay_online')} ${total?.toLocaleString()}₴`
                                )}
                            </button>
                        </form>

                        <div className="payment-divider">
                            <div className="payment-divider-line" />
                            <span className="payment-divider-text">{t('payment_or')}</span>
                            <div className="payment-divider-line" />
                        </div>

                        <button disabled={loading || skipLoading} className="payment-skip-btn" onClick={handlePayAtNovaPoshta}>
                            {skipLoading ? (
                                <span className="payment-loading-row">
                                    <span className="payment-btn-spinner-blue" />{t('payment_placing')}
                                </span>
                            ) : (
                                t('payment_pay_delivery')
                            )}
                        </button>
                    </div>
                </div>

                <div>
                    <div className="payment-card">
                        <h2 className="payment-card-title">{t('payment_summary')}</h2>
                        <div className="payment-delivery-info">
                            <div className="payment-delivery-row">
                                <span className="payment-delivery-label">{t('payment_city')}</span>
                                <span className="payment-delivery-value">{address.city}</span>
                            </div>
                            <div className="payment-delivery-row">
                                <span className="payment-delivery-label">{t('payment_warehouse')}</span>
                                <span className="payment-delivery-value">{address.street.replace('Нова Пошта, ', '')}</span>
                            </div>
                            <div className="payment-delivery-row">
                                <span className="payment-delivery-label">{t('payment_phone')}</span>
                                <span className="payment-delivery-value">{address.phone}</span>
                            </div>
                        </div>
                        <div className="payment-summary-divider" />
                        <div className="payment-total-row">
                            <span className="payment-total-label">{t('payment_total')}</span>
                            <span className="payment-total-amount">{total?.toLocaleString()}₴</span>
                        </div>
                        <div className="payment-delivery-note">{t('payment_delivery_note')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Field = ({ label, error, children }) => (
    <div className="form-field">
        <label className="form-label">{label}</label>
        {children}
        {error && <span className="field-error">{error}</span>}
    </div>
);

export default Payment;