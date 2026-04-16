import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import orderService from '../../services/api/orderService';
import { useCart } from '../../store/context/CartContext';

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

    const { items, address, total } = location.state || {};

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [skipLoading, setSkipLoading] = useState(false);
    const [backHovered, setBackHovered] = useState(false);
    const [payHovered, setPayHovered] = useState(false);
    const [skipHovered, setSkipHovered] = useState(false);
    const [focused, setFocused] = useState('');

    useEffect(() => {
        if (!items || !address) {
            navigate('/cart');
        }
    }, []);

    if (!items || !address) return null;

    const validate = () => {
        const e = {};
        const rawCard = cardNumber.replace(/\s/g, '');
        if (!cardName.trim()) e.cardName = 'Cardholder name is required';
        if (!rawCard || rawCard.length < 16) e.cardNumber = 'Enter a valid 16-digit card number';
        if (!expiry || expiry.length < 5) e.expiry = 'Enter a valid expiry date';
        else {
            const [mm, yy] = expiry.split('/');
            const month = parseInt(mm);
            const year = parseInt('20' + yy);
            const now = new Date();
            if (month < 1 || month > 12) e.expiry = 'Invalid month';
            else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
                e.expiry = 'Card has expired';
            }
        }
        if (!cvv || cvv.length < 3) e.cvv = 'Enter a valid CVV';
        return e;
    };

    const handlePayOnline = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        try {
            await new Promise(res => setTimeout(res, 2000));
            await orderService.create(items, address, true);
            await clearCart();
            navigate('/order-success');
        } catch {
            setErrors({ submit: 'Payment failed. Please try again.' });
            setLoading(false);
        }
    };

    const handlePayAtNovaPoshta = async () => {
        setSkipLoading(true);
        try {
            await orderService.create(items, address, false);
            await clearCart();
            navigate('/order-success');
        } catch {
            setErrors({ submit: 'Failed to place order. Please try again.' });
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
        <div style={s.page}>
            <button
                onMouseEnter={() => setBackHovered(true)}
                onMouseLeave={() => setBackHovered(false)}
                style={{ ...s.backBtn, ...(backHovered ? s.backBtnHover : {}) }}
                onClick={() => navigate(-1)}
            >
                Back to Checkout
            </button>

            <div style={s.layout}>
                <div style={s.formSection}>
                    <div style={s.card}>
                        <h2 style={s.cardTitle}>Payment Details</h2>
                        <div style={s.secureRow}>
                            <span style={s.lockIcon}>🔒</span>
                            <span style={s.secureText}>Secure payment — your data is encrypted</span>
                        </div>

                        {errors.submit && <div style={s.errorBox}>{errors.submit}</div>}

                        <form onSubmit={handlePayOnline} noValidate>
                            <Field label="Cardholder Name" error={errors.cardName}>
                                <input
                                    value={cardName}
                                    onChange={e => { setCardName(e.target.value.toUpperCase()); setErrors({ ...errors, cardName: '' }); }}
                                    onFocus={() => setFocused('cardName')}
                                    onBlur={() => setFocused('')}
                                    placeholder="JOHN DOE"
                                    style={{ ...s.input, ...(focused === 'cardName' ? s.inputFocused : {}), ...(errors.cardName ? s.inputErr : {}) }}
                                    autoComplete="cc-name"
                                />
                            </Field>

                            <Field label="Card Number" error={errors.cardNumber}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        value={cardNumber}
                                        onChange={e => { setCardNumber(formatCardNumber(e.target.value)); setErrors({ ...errors, cardNumber: '' }); }}
                                        onFocus={() => setFocused('cardNumber')}
                                        onBlur={() => setFocused('')}
                                        placeholder="0000 0000 0000 0000"
                                        style={{ ...s.input, ...(focused === 'cardNumber' ? s.inputFocused : {}), ...(errors.cardNumber ? s.inputErr : {}), paddingRight: '60px' }}
                                        autoComplete="cc-number"
                                        inputMode="numeric"
                                    />
                                    {getCardType() && (
                                        <span style={s.cardType}>{getCardType()}</span>
                                    )}
                                </div>
                            </Field>

                            <div style={s.row}>
                                <div style={{ flex: 1 }}>
                                    <Field label="Expiry Date" error={errors.expiry}>
                                        <input
                                            value={expiry}
                                            onChange={e => { setExpiry(formatExpiry(e.target.value)); setErrors({ ...errors, expiry: '' }); }}
                                            onFocus={() => setFocused('expiry')}
                                            onBlur={() => setFocused('')}
                                            placeholder="MM/YY"
                                            style={{ ...s.input, ...(focused === 'expiry' ? s.inputFocused : {}), ...(errors.expiry ? s.inputErr : {}) }}
                                            autoComplete="cc-exp"
                                            inputMode="numeric"
                                        />
                                    </Field>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Field label="CVV" error={errors.cvv}>
                                        <input
                                            value={cvv}
                                            onChange={e => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); setErrors({ ...errors, cvv: '' }); }}
                                            onFocus={() => setFocused('cvv')}
                                            onBlur={() => setFocused('')}
                                            placeholder="•••"
                                            type="password"
                                            style={{ ...s.input, ...(focused === 'cvv' ? s.inputFocused : {}), ...(errors.cvv ? s.inputErr : {}) }}
                                            autoComplete="cc-csc"
                                            inputMode="numeric"
                                        />
                                    </Field>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || skipLoading}
                                onMouseEnter={() => setPayHovered(true)}
                                onMouseLeave={() => setPayHovered(false)}
                                style={{ ...s.payBtn, ...(payHovered && !loading && !skipLoading ? s.payBtnHover : {}), ...(loading ? s.payBtnLoading : {}) }}
                            >
                                {loading ? (
                                    <span style={s.loadingRow}>
                                        <span style={s.spinner} />
                                        Processing payment...
                                    </span>
                                ) : (
                                    `Pay Online $${total?.toLocaleString()}`
                                )}
                            </button>
                        </form>

                        <div style={s.divider}>
                            <span style={s.dividerText}>or</span>
                        </div>

                        <button
                            disabled={loading || skipLoading}
                            onMouseEnter={() => setSkipHovered(true)}
                            onMouseLeave={() => setSkipHovered(false)}
                            style={{ ...s.skipBtn, ...(skipHovered && !loading && !skipLoading ? s.skipBtnHover : {}) }}
                            onClick={handlePayAtNovaPoshta}
                        >
                            {skipLoading ? (
                                <span style={s.loadingRow}>
                                    <span style={{ ...s.spinner, borderTopColor: '#1f73b7' }} />
                                    Placing order...
                                </span>
                            ) : (
                                '📦 Pay at Nova Poshta on Delivery'
                            )}
                        </button>
                    </div>
                </div>

                <div style={s.summarySection}>
                    <div style={s.card}>
                        <h2 style={s.cardTitle}>Order Summary</h2>
                        <div style={s.deliveryInfo}>
                            <div style={s.deliveryRow}>
                                <span style={s.deliveryLabel}>City</span>
                                <span style={s.deliveryValue}>{address.city}</span>
                            </div>
                            <div style={s.deliveryRow}>
                                <span style={s.deliveryLabel}>Warehouse</span>
                                <span style={s.deliveryValue}>{address.street.replace('Нова Пошта, ', '')}</span>
                            </div>
                            <div style={s.deliveryRow}>
                                <span style={s.deliveryLabel}>Phone</span>
                                <span style={s.deliveryValue}>{address.phone}</span>
                            </div>
                        </div>
                        <div style={s.summaryDivider} />
                        <div style={s.totalRow}>
                            <span style={s.totalLabel}>Total</span>
                            <span style={s.totalAmount}>${total?.toLocaleString()}</span>
                        </div>
                        <div style={s.deliveryNote}>
                            Delivery across Ukraine via "Nova Poshta"
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Field = ({ label, error, children }) => (
    <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', color: '#040d15', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
            {label}
        </label>
        {children}
        {error && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
);

const s = {
    page: { minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '32px', color: '#040d15' },
    backBtn: { background: 'transparent', border: '1px solid #d1dce8', color: '#6b7a8d', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', transition: 'all 0.2s ease' },
    backBtnHover: { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '1000px', margin: '0 auto' },
    formSection: {},
    summarySection: {},
    card: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
    cardTitle: { fontSize: '20px', fontWeight: '700', color: '#040d15', margin: '0 0 12px' },
    secureRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' },
    lockIcon: { fontSize: '14px' },
    secureText: { fontSize: '12px', color: '#16a34a', fontWeight: '500' },
    errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
    input: { width: '100%', padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #d1dce8', borderRadius: '8px', color: '#040d15', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s ease' },
    inputFocused: { border: '1px solid #1f73b7', backgroundColor: '#ffffff' },
    inputErr: { border: '1px solid #dc2626' },
    row: { display: 'flex', gap: '16px' },
    cardType: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: '700', color: '#1f73b7', backgroundColor: '#e8f0fe', padding: '2px 8px', borderRadius: '4px' },
    payBtn: { width: '100%', padding: '14px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', transition: 'background-color 0.2s ease' },
    payBtnHover: { backgroundColor: '#15803d' },
    payBtnLoading: { backgroundColor: '#6b7a8d', cursor: 'not-allowed' },
    loadingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    spinner: { width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #ffffff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' },
    divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' },
    dividerText: { fontSize: '13px', color: '#6b7a8d', whiteSpace: 'nowrap' , backgroundColor: '#fff', padding: '0 8px' },
    skipBtn: { width: '100%', padding: '13px', backgroundColor: 'transparent', border: '1px solid #1f73b7', color: '#1f73b7', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
    skipBtnHover: { backgroundColor: '#1f73b7', color: '#ffffff' },
    deliveryInfo: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
    deliveryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
    deliveryLabel: { fontSize: '13px', color: '#6b7a8d', whiteSpace: 'nowrap' },
    deliveryValue: { fontSize: '13px', color: '#040d15', fontWeight: '500', textAlign: 'right' },
    summaryDivider: { height: '1px', backgroundColor: '#e0e7ef', margin: '16px 0' },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    totalLabel: { fontSize: '16px', color: '#6b7a8d', fontWeight: '500' },
    totalAmount: { fontSize: '24px', fontWeight: '700', color: '#040d15' },
    deliveryNote: { backgroundColor: '#f0f7ff', border: '1px solid #bdd7ee', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#1f73b7' },
};

export default Payment;