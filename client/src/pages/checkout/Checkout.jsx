import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/context/CartContext';
import { useAuth } from '../../store/context/AuthContext';
import { useLanguage } from '../../store/context/LanguageContext';

const npCities = async (query) => {
    const res = await fetch('http://localhost:5000/api/novaposhta/cities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    return res.json();
};

const npWarehouses = async (cityRef, query) => {
    const res = await fetch('http://localhost:5000/api/novaposhta/warehouses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityRef, query }),
    });
    return res.json();
};

const getCityName = (city) => city?.Description || '';
const getCityRegion = (city) => city?.AreaDescription || '';
const getWarehouseName = (wh) => wh?.Description || '';
const getWarehouseNumber = (wh) => wh?.Number || '';
const getWarehouseAddress = (wh) => wh?.ShortAddress || '';

const Checkout = () => {
    const { cart } = useCart();
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [phone, setPhone] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);
    const [showCityModal, setShowCityModal] = useState(false);
    const [citySearchInput, setCitySearchInput] = useState('');
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [cityLoading, setCityLoading] = useState(false);
    const [warehouseInput, setWarehouseInput] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [warehouseSuggestions, setWarehouseSuggestions] = useState([]);
    const [warehouseLoading, setWarehouseLoading] = useState(false);
    const [showWarehouseSuggestions, setShowWarehouseSuggestions] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const warehouseRef = useRef(null);
    const cityDebounceRef = useRef(null);
    const warehouseDebounceRef = useRef(null);
    const citySearchRef = useRef(null);

    const total = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

    useEffect(() => { if (!cart?.items?.length) navigate('/cart'); }, [cart]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (warehouseRef.current && !warehouseRef.current.contains(e.target)) setShowWarehouseSuggestions(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (showCityModal) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => citySearchRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = '';
            setCitySearchInput('');
            setCitySuggestions([]);
        }
        return () => { document.body.style.overflow = ''; };
    }, [showCityModal]);

    const handleCitySearchInput = (e) => {
        const val = e.target.value;
        setCitySearchInput(val);
        if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
        if (!val || val.length < 2) { setCitySuggestions([]); return; }
        cityDebounceRef.current = setTimeout(async () => {
            setCityLoading(true);
            try {
                const data = await npCities(val);
                setCitySuggestions(data?.data || []);
            } catch { setCitySuggestions([]); } finally { setCityLoading(false); }
        }, 350);
    };

    const handleCitySelect = async (city) => {
        setSelectedCity(city);
        setShowCityModal(false);
        setSelectedWarehouse(null);
        setWarehouseInput('');
        setErrors({ ...errors, city: '' });
        await loadWarehouses(city.Ref, '');
    };

    const loadWarehouses = async (cityRef, query) => {
        if (!cityRef) return;
        setWarehouseLoading(true);
        setShowWarehouseSuggestions(false);
        try {
            const data = await npWarehouses(cityRef, query || '');
            const list = data?.data || [];
            if (list.length > 0) { setWarehouseSuggestions(list); setShowWarehouseSuggestions(true); }
            else { setWarehouseSuggestions([]); setShowWarehouseSuggestions(false); }
        } catch { setWarehouseSuggestions([]); } finally { setWarehouseLoading(false); }
    };

    const handleWarehouseInput = (e) => {
        const val = e.target.value;
        setWarehouseInput(val);
        setSelectedWarehouse(null);
        setErrors({ ...errors, warehouse: '' });
        if (warehouseDebounceRef.current) clearTimeout(warehouseDebounceRef.current);
        warehouseDebounceRef.current = setTimeout(() => loadWarehouses(selectedCity?.Ref, val), 350);
    };

    const handleWarehouseSelect = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setWarehouseInput(getWarehouseName(warehouse));
        setWarehouseSuggestions([]);
        setShowWarehouseSuggestions(false);
        setErrors({ ...errors, warehouse: '' });
    };

    const validate = () => {
        const e = {};
        if (!user) {
            if (!guestName.trim()) e.guestName = t('checkout_err_name');
            if (!guestEmail.trim()) e.guestEmail = t('checkout_err_email');
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) e.guestEmail = t('checkout_err_email_invalid');
        }
        if (!phone.trim()) e.phone = t('checkout_err_phone');
        else if (!/^\+?[\d\s\-()]{10,15}$/.test(phone.trim())) e.phone = t('checkout_err_phone_invalid');
        if (!selectedCity) e.city = t('checkout_err_city');
        if (!selectedWarehouse) e.warehouse = t('checkout_err_warehouse');
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        const items = cart.items.map(item => ({
            product: item.product._id || item.product.id || item.product,
            quantity: item.quantity,
            price: item.price,
        }));
        const address = {
            street: `Нова Пошта, ${getWarehouseName(selectedWarehouse)}`,
            city: getCityName(selectedCity),
            zip: selectedWarehouse?.PostalCodeUA || '00000',
            phone: phone.trim(),
        };
        const guestInfo = !user ? { name: guestName.trim(), email: guestEmail.trim() } : null;
        navigate('/payment', { state: { items, address, total, guestInfo } });
    };

    if (!cart?.items?.length) return null;

    return (
        <div className="page-container">
            {showCityModal && (
                <div className="checkout-modal-overlay" onMouseDown={() => setShowCityModal(false)}>
                    <div className="checkout-city-modal" onMouseDown={e => e.stopPropagation()}>
                        <div className="checkout-modal-header">
                            <h2 className="checkout-modal-title">{t('checkout_select_city')}</h2>
                            <button className="checkout-modal-close" onClick={() => setShowCityModal(false)}>✕</button>
                        </div>
                        <label className="checkout-modal-search-label">{t('checkout_city_label')}</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                ref={citySearchRef}
                                value={citySearchInput}
                                onChange={handleCitySearchInput}
                                placeholder={t('checkout_city_search_placeholder')}
                                className="checkout-modal-search-input"
                                autoComplete="off"
                            />
                            {cityLoading && <div className="checkout-modal-loader">{t('checkout_searching')}</div>}
                        </div>
                        {!cityLoading && citySearchInput.length >= 2 && citySuggestions.length === 0 && (
                            <div className="checkout-no-results">{t('checkout_no_cities')}</div>
                        )}
                        {citySuggestions.length > 0 && (
                            <div className="checkout-modal-suggestions">
                                {citySuggestions.map((city) => (
                                    <div key={city.Ref} className="checkout-modal-city-item" onClick={() => handleCitySelect(city)}>
                                        <div className="checkout-modal-city-name">{getCityName(city)}</div>
                                        {getCityRegion(city) && <div className="checkout-modal-city-region">{getCityRegion(city)} {t('checkout_region')}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button className="back-btn" onClick={() => navigate('/cart')}>{t('checkout_back')}</button>

            <div className="checkout-layout">
                <div>
                    <div className="checkout-card">
                        <h2 className="checkout-card-title">{t('checkout_delivery')}</h2>
                        <div className="checkout-delivery-badge">{t('checkout_nova_poshta')}</div>
                        {errors.submit && <div className="api-error-box">{errors.submit}</div>}

                        <form onSubmit={handleSubmit} noValidate>
                            {!user && (
                                <>
                                    <div className="checkout-guest-banner">
                                        {t('checkout_guest_banner')}
                                        <span className="checkout-guest-login-link" onClick={() => navigate('/login')}>{t('checkout_guest_sign_in')}</span>
                                        {t('checkout_guest_tracking')}
                                    </div>
                                    <Field label={t('checkout_full_name')} error={errors.guestName}>
                                        <input
                                            value={guestName}
                                            onChange={e => { setGuestName(e.target.value); setErrors({ ...errors, guestName: '' }); }}
                                            placeholder={t('checkout_full_name_placeholder')}
                                            className={`form-input${errors.guestName ? ' has-error' : ''}`}
                                        />
                                    </Field>
                                    <Field label={t('checkout_email')} error={errors.guestEmail}>
                                        <input
                                            value={guestEmail}
                                            type="email"
                                            onChange={e => { setGuestEmail(e.target.value); setErrors({ ...errors, guestEmail: '' }); }}
                                            placeholder={t('checkout_email_placeholder')}
                                            className={`form-input${errors.guestEmail ? ' has-error' : ''}`}
                                        />
                                    </Field>
                                </>
                            )}

                            <Field label={t('checkout_phone')} error={errors.phone}>
                                <input
                                    value={phone}
                                    onChange={e => { setPhone(e.target.value); setErrors({ ...errors, phone: '' }); }}
                                    placeholder={t('checkout_phone_placeholder')}
                                    className={`form-input${errors.phone ? ' has-error' : ''}`}
                                />
                            </Field>

                            <Field label={t('checkout_city')} error={errors.city}>
                                {selectedCity ? (
                                    <div className="checkout-selected-card">
                                        <div className="checkout-selected-info">
                                            <div>
                                                <div className="checkout-selected-name">{getCityName(selectedCity)}</div>
                                                {getCityRegion(selectedCity) && <div className="checkout-selected-sub">{getCityRegion(selectedCity)} {t('checkout_region')}</div>}
                                            </div>
                                        </div>
                                        <button type="button" className="checkout-change-btn"
                                                onClick={() => { setSelectedCity(null); setSelectedWarehouse(null); setWarehouseInput(''); setShowCityModal(true); }}>
                                            {t('checkout_change')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`checkout-city-trigger${errors.city ? ' has-error' : ''}`} onClick={() => setShowCityModal(true)}>
                                        <span className="checkout-city-trigger-text">{t('checkout_city_placeholder')}</span>
                                    </div>
                                )}
                            </Field>

                            {selectedCity && (
                                <Field label={t('checkout_warehouse')} error={errors.warehouse}>
                                    {selectedWarehouse ? (
                                        <div className="checkout-selected-card">
                                            <div className="checkout-selected-info">
                                                <div>
                                                    {getWarehouseNumber(selectedWarehouse) && <div className="checkout-selected-name">№{getWarehouseNumber(selectedWarehouse)}</div>}
                                                    <div className="checkout-selected-sub">{getWarehouseAddress(selectedWarehouse)}</div>
                                                </div>
                                            </div>
                                            <button type="button" className="checkout-change-btn"
                                                    onClick={() => { setSelectedWarehouse(null); setWarehouseInput(''); loadWarehouses(selectedCity?.Ref, ''); }}>
                                                {t('checkout_change')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative' }} ref={warehouseRef}>
                                            <input
                                                value={warehouseInput}
                                                onChange={handleWarehouseInput}
                                                onFocus={() => { if (warehouseSuggestions.length === 0) loadWarehouses(selectedCity?.Ref, ''); else setShowWarehouseSuggestions(true); }}
                                                placeholder={t('checkout_warehouse_placeholder')}
                                                className={`form-input${errors.warehouse ? ' has-error' : ''}`}
                                                autoComplete="off"
                                            />
                                            {warehouseLoading && <div className="checkout-inline-loader">{t('checkout_searching')}</div>}
                                            {showWarehouseSuggestions && warehouseSuggestions.length > 0 && (
                                                <div className="checkout-suggestions">
                                                    {warehouseSuggestions.map((wh) => (
                                                        <div key={wh.Ref} className="checkout-warehouse-item" onMouseDown={() => handleWarehouseSelect(wh)}>
                                                            {getWarehouseNumber(wh) && <span className="checkout-warehouse-num">№{getWarehouseNumber(wh)}</span>}
                                                            <span className="checkout-warehouse-addr">{getWarehouseAddress(wh)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {!warehouseLoading && warehouseSuggestions.length === 0 && (
                                                <div className="checkout-no-warehouses">{t('checkout_no_warehouses')}</div>
                                            )}
                                        </div>
                                    )}
                                </Field>
                            )}

                            <button type="submit" disabled={loading} className="checkout-submit-btn">
                                {loading ? t('checkout_placing') : t('checkout_place_order')}
                            </button>
                        </form>
                    </div>
                </div>

                <div>
                    <div className="checkout-card">
                        <h2 className="checkout-card-title">{t('checkout_summary')}</h2>
                        <div className="checkout-item-list">
                            {cart.items.map((item) => {
                                const productId = item.product?._id || item.product?.id || item.product;
                                const productName = item.product?.name || 'Product';
                                const productImage = item.product?.images?.[0] || null;
                                return (
                                    <div key={productId} className="checkout-summary-item">
                                        {productImage && <img src={productImage} alt={productName} className="checkout-summary-img" />}
                                        <div className="checkout-item-info">
                                            <div className="checkout-item-name">{productName}</div>
                                            <div className="checkout-item-qty">{t('checkout_quantity')} {item.quantity}</div>
                                        </div>
                                        <div className="checkout-item-price">{(item.price * item.quantity).toLocaleString()}₴</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="checkout-divider" />
                        <div className="checkout-total-row">
                            <span className="checkout-total-label">{t('checkout_total')}</span>
                            <span className="checkout-total-amount">{total.toLocaleString()}₴</span>
                        </div>
                        <div className="checkout-delivery-note">{t('checkout_delivery_note')}</div>
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

export default Checkout;