import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/context/CartContext';
import { useAuth } from '../../store/context/AuthContext';
import orderService from '../../services/api/orderService';

const npCities = async (query) => {
    const res = await fetch('http://localhost:5000/api/novaposhta/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    return res.json();
};

const npWarehouses = async (cityRef, query) => {
    const res = await fetch('http://localhost:5000/api/novaposhta/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [phone, setPhone] = useState('');
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
    const [submitHovered, setSubmitHovered] = useState(false);
    const [backHovered, setBackHovered] = useState(false);

    const warehouseRef = useRef(null);
    const cityDebounceRef = useRef(null);
    const warehouseDebounceRef = useRef(null);
    const citySearchRef = useRef(null);

    const total = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

    useEffect(() => {
        if (!cart?.items?.length) {
            navigate('/cart');
        }
    }, [cart]);

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
                const list = data?.data || [];
                setCitySuggestions(list);
            } catch {
                setCitySuggestions([]);
            } finally {
                setCityLoading(false);
            }
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
            if (list.length > 0) {
                setWarehouseSuggestions(list);
                setShowWarehouseSuggestions(true);
            } else {
                setWarehouseSuggestions([]);
                setShowWarehouseSuggestions(false);
            }
        } catch {
            setWarehouseSuggestions([]);
        } finally {
            setWarehouseLoading(false);
        }
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
        if (!phone.trim()) e.phone = 'Phone number is required';
        else if (!/^\+?[\d\s\-()]{10,15}$/.test(phone.trim())) e.phone = 'Enter a valid phone number';
        if (!selectedCity) e.city = 'Please select a city';
        if (!selectedWarehouse) e.warehouse = 'Please select a Nova Poshta warehouse';
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

        navigate('/payment', { state: { items, address, total } });
    };

    if (!cart?.items?.length) return null;

    return (
        <div style={s.page}>
            {showCityModal && (
                <div style={s.modalOverlay} onMouseDown={() => setShowCityModal(false)}>
                    <div style={s.cityModal} onMouseDown={e => e.stopPropagation()}>
                        <div style={s.modalHeader}>
                            <h2 style={s.modalTitle}>Select your city</h2>
                            <button style={s.modalClose} onClick={() => setShowCityModal(false)}>✕</button>
                        </div>

                        <label style={s.modalSearchLabel}>Enter city or village name</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                ref={citySearchRef}
                                value={citySearchInput}
                                onChange={handleCitySearchInput}
                                placeholder="e.g. Полтава, Київ, Котюжини..."
                                style={s.modalSearchInput}
                                autoComplete="off"
                            />
                            {cityLoading && <div style={s.modalLoader}>Searching...</div>}
                        </div>

                        {!cityLoading && citySearchInput.length >= 2 && citySuggestions.length === 0 && (
                            <div style={s.noResults}>No cities found. Try a different name.</div>
                        )}

                        {citySuggestions.length > 0 && (
                            <div style={s.modalSuggestions}>
                                {citySuggestions.map((city) => (
                                    <div
                                        key={city.Ref}
                                        style={s.modalSuggestionItem}
                                        onClick={() => handleCitySelect(city)}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                                    >
                                        <div style={s.modalCityName}>{getCityName(city)}</div>
                                        {getCityRegion(city) && (
                                            <div style={s.modalCityRegion}>{getCityRegion(city)} region</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                        <div style={s.deliveryBadge}>Nova Poshta</div>

                        {errors.submit && <div style={s.errorBox}>{errors.submit}</div>}

                        <form onSubmit={handleSubmit} noValidate>
                            <Field label="Phone Number" error={errors.phone}>
                                <input
                                    value={phone}
                                    onChange={e => { setPhone(e.target.value); setErrors({ ...errors, phone: '' }); }}
                                    placeholder="+380 XX XXX XX XX"
                                    style={{ ...s.input, ...(errors.phone ? s.inputErr : {}) }}
                                />
                            </Field>

                            <Field label="City or Village" error={errors.city}>
                                {selectedCity ? (
                                    <div style={s.selectedCard}>
                                        <div style={s.selectedInfo}>
                                            <span style={s.selectedPin}>📍</span>
                                            <div>
                                                <div style={s.selectedName}>{getCityName(selectedCity)}</div>
                                                {getCityRegion(selectedCity) && (
                                                    <div style={s.selectedSub}>{getCityRegion(selectedCity)} region</div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            style={s.changeBtn}
                                            onClick={() => {
                                                setSelectedCity(null);
                                                setSelectedWarehouse(null);
                                                setWarehouseInput('');
                                                setShowCityModal(true);
                                            }}
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        style={{ ...s.cityPickerTrigger, ...(errors.city ? s.inputErr : {}) }}
                                        onClick={() => setShowCityModal(true)}
                                    >
                                        <span style={s.cityPickerText}>Select city or village...</span>
                                    </div>
                                )}
                            </Field>

                            {selectedCity && (
                                <Field label="Nova Poshta Warehouse" error={errors.warehouse}>
                                    {selectedWarehouse ? (
                                        <div style={s.selectedCard}>
                                            <div style={s.selectedInfo}>
                                                <span style={s.selectedPin}>🏢</span>
                                                <div>
                                                    {getWarehouseNumber(selectedWarehouse) && (
                                                        <div style={s.selectedName}>№{getWarehouseNumber(selectedWarehouse)}</div>
                                                    )}
                                                    <div style={s.selectedSub}>{getWarehouseAddress(selectedWarehouse)}</div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                style={s.changeBtn}
                                                onClick={() => {
                                                    setSelectedWarehouse(null);
                                                    setWarehouseInput('');
                                                    loadWarehouses(selectedCity?.Ref, '');
                                                }}
                                            >
                                                Change
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative' }} ref={warehouseRef}>
                                            <input
                                                value={warehouseInput}
                                                onChange={handleWarehouseInput}
                                                onFocus={() => {
                                                    if (warehouseSuggestions.length === 0) loadWarehouses(selectedCity?.Ref, '');
                                                    else setShowWarehouseSuggestions(true);
                                                }}
                                                placeholder="Search by number or address..."
                                                style={{ ...s.input, ...(errors.warehouse ? s.inputErr : {}) }}
                                                autoComplete="off"
                                            />
                                            {warehouseLoading && <div style={s.loader}>Searching...</div>}
                                            {showWarehouseSuggestions && warehouseSuggestions.length > 0 && (
                                                <div style={s.suggestions}>
                                                    {warehouseSuggestions.map((wh) => (
                                                        <div
                                                            key={wh.Ref}
                                                            style={s.warehouseItem}
                                                            onMouseDown={() => handleWarehouseSelect(wh)}
                                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                                                        >
                                                            {getWarehouseNumber(wh) && (
                                                                <span style={s.warehouseNumber}>№{getWarehouseNumber(wh)}</span>
                                                            )}
                                                            <span style={s.warehouseAddress}>{getWarehouseAddress(wh)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {!warehouseLoading && warehouseSuggestions.length === 0 && (
                                                <div style={s.noWarehouses}>No warehouses found in this city</div>
                                            )}
                                        </div>
                                    )}
                                </Field>
                            )}

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
                                            <div style={s.itemQty}>Quantity: {item.quantity}</div>
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
    cardTitle: { fontSize: '20px', fontWeight: '700', color: '#040d15', margin: '0 0 16px' },
    deliveryBadge: { display: 'inline-block', backgroundColor: '#fff3cd', border: '1px solid #ffc107', color: '#856404', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '20px' },
    errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
    input: { width: '100%', padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #d1dce8', borderRadius: '8px', color: '#040d15', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    inputErr: { border: '1px solid #dc2626' },
    cityPickerTrigger: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #d1dce8', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7a8d' },
    cityPickerPin: { fontSize: '16px' },
    cityPickerText: { flex: 1 },
    selectedCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#f0f7ff', border: '1px solid #bdd7ee', borderRadius: '8px' },
    selectedInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
    selectedPin: { fontSize: '18px' },
    selectedName: { fontSize: '14px', fontWeight: '600', color: '#040d15' },
    selectedSub: { fontSize: '12px', color: '#6b7a8d', marginTop: '2px' },
    changeBtn: { background: 'none', border: 'none', color: '#1f73b7', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: '4px 8px' },
    loader: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#6b7a8d' },
    suggestions: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#ffffff', border: '1px solid #d1dce8', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '220px', overflowY: 'auto', marginTop: '4px' },
    warehouseItem: { padding: '10px 14px', cursor: 'pointer', backgroundColor: '#ffffff', display: 'flex', gap: '12px', alignItems: 'flex-start' },
    warehouseNumber: { fontSize: '13px', fontWeight: '700', color: '#1f73b7', whiteSpace: 'nowrap' },
    warehouseAddress: { fontSize: '13px', color: '#040d15', lineHeight: '1.4' },
    noWarehouses: { fontSize: '13px', color: '#6b7a8d', padding: '10px 0', textAlign: 'center' },
    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    cityModal: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    modalTitle: { fontSize: '22px', fontWeight: '700', color: '#040d15', margin: 0 },
    modalClose: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b7a8d', padding: '4px 8px' },
    modalSearchLabel: { display: 'block', fontSize: '13px', color: '#6b7a8d', marginBottom: '8px' },
    modalSearchInput: { width: '100%', padding: '12px 14px', border: '1px solid #1f73b7', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#040d15' },
    modalLoader: { fontSize: '12px', color: '#6b7a8d', marginTop: '8px', textAlign: 'center' },
    noResults: { fontSize: '13px', color: '#6b7a8d', padding: '16px 0', textAlign: 'center' },
    modalSuggestions: { marginTop: '8px', border: '1px solid #e0e7ef', borderRadius: '8px', overflow: 'hidden' },
    modalSuggestionItem: { padding: '12px 14px', cursor: 'pointer', backgroundColor: '#ffffff', borderBottom: '1px solid #f0f4f8', transition: 'background-color 0.15s ease' },
    modalCityName: { fontSize: '14px', fontWeight: '600', color: '#040d15', marginBottom: '2px' },
    modalCityRegion: { fontSize: '12px', color: '#6b7a8d' },
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