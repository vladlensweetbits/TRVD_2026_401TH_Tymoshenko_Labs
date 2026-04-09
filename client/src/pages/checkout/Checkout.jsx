import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/context/CartContext';
import orderService from '../../services/api/orderService';

const DELIVERY_SERVICES = ['Нова Пошта', 'УкрПошта'];

const Checkout = () => {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        street: '',
        city: '',
        zip: '',
        deliveryService: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitHovered, setSubmitHovered] = useState(false);
    const [backHovered, setBackHovered] = useState(false);

    const total = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

    const validate = () => {
        const e = {};
        if (!form.street.trim()) e.street = 'Street address is required';
        if (!form.city.trim()) e.city = 'City or village is required';
        if (!form.zip.trim()) e.zip = 'Postal code is required';
        else if (!/^\d{5}$/.test(form.zip.trim())) e.zip = 'Ukrainian postal code must be 5 digits';
        if (!form.deliveryService) e.deliveryService = 'Please select a delivery service';
        return e;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        try {
            const items = cart.items.map(item => ({
                product: item.product._id || item.product.id || item.product,
                quantity: item.quantity,
                price: item.price,
            }));

            const address = {
                street: `${form.deliveryService}, ${form.street}`,
                city: form.city,
                zip: form.zip,
            };

            await orderService.create(items, address);
            await clearCart();
            navigate('/order-success');
        } catch (err) {
            setErrors({ submit: err.response?.data?.message || 'Failed to place order. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    if (!cart?.items?.length) {
        navigate('/cart');
        return null;
    }

    return (
        <div style={s.page}>
            <button
                onMouseEnter={() => setBackHovered(true)}
                onMouseLeave={() => setBackHovered(false)}
                style={{ ...s.backBtn, ...(backHovered ? s.backBtnHover : {}) }}
                onClick={() => navigate('/cart')}
            >
                Back to Cart
            </button>

            <div style={s.layout}>
                <div style={s.formSection}>
                    <div style={s.card}>
                        <h2 style={s.cardTitle}>Delivery Details</h2>

                        {errors.submit && <div style={s.errorBox}>{errors.submit}</div>}

                        <form onSubmit={handleSubmit} noValidate>
                            <Field label="Delivery Service" error={errors.deliveryService}>
                                <select
                                    name="deliveryService"
                                    value={form.deliveryService}
                                    onChange={handleChange}
                                    style={{ ...s.input, ...(errors.deliveryService ? s.inputErr : {}) }}
                                >
                                    <option value="">Select delivery service</option>
                                    {DELIVERY_SERVICES.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="City or Village (Ukraine)" error={errors.city}>
                                <input
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    placeholder="e.g. Полтава, Харків, Київ"
                                    style={{ ...s.input, ...(errors.city ? s.inputErr : {}) }}
                                />
                            </Field>

                            <Field label="Street Address" error={errors.street}>
                                <input
                                    name="street"
                                    value={form.street}
                                    onChange={handleChange}
                                    placeholder="e.g. вул. Соборності, 10, кв. 5"
                                    style={{ ...s.input, ...(errors.street ? s.inputErr : {}) }}
                                />
                            </Field>

                            <Field label="Postal Code" error={errors.zip}>
                                <input
                                    name="zip"
                                    value={form.zip}
                                    onChange={handleChange}
                                    placeholder="e.g. 36000"
                                    maxLength={5}
                                    style={{ ...s.input, ...(errors.zip ? s.inputErr : {}) }}
                                />
                            </Field>

                            <button
                                type="submit"
                                disabled={loading}
                                onMouseEnter={() => setSubmitHovered(true)}
                                onMouseLeave={() => setSubmitHovered(false)}
                                style={{ ...s.submitBtn, ...(submitHovered && !loading ? s.submitBtnHover : {}) }}
                            >
                                {loading ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </form>
                    </div>
                </div>

                <div style={s.summarySection}>
                    <div style={s.card}>
                        <h2 style={s.cardTitle}>Order Summary</h2>
                        <div style={s.itemList}>
                            {cart.items.map((item) => {
                                const productId = item.product?._id || item.product?.id || item.product;
                                const productName = item.product?.name || 'Product';
                                const productImage = item.product?.images?.[0] || null;

                                return (
                                    <div key={productId} style={s.summaryItem}>
                                        {productImage && (
                                            <img src={productImage} alt={productName} style={s.itemImage} />
                                        )}
                                        <div style={s.itemInfo}>
                                            <div style={s.itemName}>{productName}</div>
                                            <div style={s.itemQty}>Qty: {item.quantity}</div>
                                        </div>
                                        <div style={s.itemPrice}>
                                            ${(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={s.divider} />
                        <div style={s.totalRow}>
                            <span style={s.totalLabel}>Total</span>
                            <span style={s.totalAmount}>${total.toLocaleString()}</span>
                        </div>
                        <div style={s.deliveryNote}>
                            Delivery across Ukraine via Нова Пошта or УкрПошта
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
    cardTitle: { fontSize: '20px', fontWeight: '700', color: '#040d15', margin: '0 0 24px' },
    errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
    input: { width: '100%', padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #d1dce8', borderRadius: '8px', color: '#040d15', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    inputErr: { border: '1px solid #dc2626' },
    submitBtn: { width: '100%', padding: '13px', backgroundColor: '#1f73b7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', transition: 'background-color 0.2s ease' },
    submitBtnHover: { backgroundColor: '#145082' },
    itemList: { display: 'flex', flexDirection: 'column', gap: '14px' },
    summaryItem: { display: 'flex', alignItems: 'center', gap: '12px' },
    itemImage: { width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e7ef', flexShrink: 0 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: '14px', fontWeight: '600', color: '#040d15' },
    itemQty: { fontSize: '12px', color: '#6b7a8d', marginTop: '2px' },
    itemPrice: { fontSize: '15px', fontWeight: '700', color: '#1f73b7' },
    divider: { height: '1px', backgroundColor: '#e0e7ef', margin: '20px 0' },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    totalLabel: { fontSize: '16px', color: '#6b7a8d', fontWeight: '500' },
    totalAmount: { fontSize: '24px', fontWeight: '700', color: '#040d15' },
    deliveryNote: { backgroundColor: '#f0f7ff', border: '1px solid #bdd7ee', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#1f73b7' },
};

export default Checkout;