import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/api/productService';

const CATEGORIES = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'Cooling'];

const emptyForm = {
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: '',
};

const isValidUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [toast, setToast] = useState('');
    const [backHovered, setBackHovered] = useState(false);
    const [submitHovered, setSubmitHovered] = useState(false);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    useEffect(() => {
        if (!isEdit) return;
        const load = async () => {
            try {
                const res = await productService.getById(id);
                const p = res.data;
                setForm({
                    name: p.name || '',
                    description: p.description || '',
                    price: p.price ?? '',
                    category: p.category || '',
                    stock: p.stock ?? '',
                    images: (p.images || []).join(', '),
                });
            } catch {
                showToast('Failed to load product');
            } finally {
                setFetchLoading(false);
            }
        };
        load();
    }, [id]);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.description.trim()) e.description = 'Description is required';
        if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
            e.price = 'Enter a valid price';
        if (!form.category) e.category = 'Category is required';
        if (form.stock === '' || isNaN(Number(form.stock)) || Number(form.stock) < 0)
            e.stock = 'Enter a valid quantity';

        if (!form.images.trim()) {
            e.images = 'At least one image URL is required';
        } else {
            const urls = form.images.split(',').map(u => u.trim()).filter(Boolean);
            if (urls.length === 0) {
                e.images = 'At least one image URL is required';
            } else {
                const invalidUrls = urls.filter(u => !isValidUrl(u));
                if (invalidUrls.length > 0) {
                    e.images = `Invalid URL`;
                }
            }
        }

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
            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                price: Number(form.price),
                category: form.category,
                stock: Number(form.stock),
                images: form.images.split(',').map(s => s.trim()).filter(Boolean),
            };

            if (isEdit) {
                await productService.update(id, payload);
                showToast('Product updated successfully');
                setTimeout(() => navigate(`/products/${id}`), 1200);
            } else {
                const res = await productService.create(payload);
                showToast('Product added successfully');
                setTimeout(() => navigate(`/products/${res.data.data.id}`), 1200);
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return (
        <div style={s.page}><div style={s.center}><div style={s.spinner} /></div></div>
    );

    return (
        <div style={s.page}>
            {toast && <div style={s.toast}>{toast}</div>}

            <button
                onMouseEnter={() => setBackHovered(true)}
                onMouseLeave={() => setBackHovered(false)}
                style={{ ...s.backBtn, ...(backHovered ? s.backBtnHover : {}) }}
                onClick={() => navigate(isEdit ? `/products/${id}` : '/')}
            >
                Back
            </button>

            <div style={s.card}>
                <h2 style={s.title}>{isEdit ? 'Edit Product' : 'New Product'}</h2>

                <form onSubmit={handleSubmit} noValidate>
                    <Field label="Product Name" error={errors.name}>
                        <input
                            style={{ ...s.input, ...(errors.name ? s.inputErr : {}) }}
                            name="name" value={form.name} onChange={handleChange}
                            placeholder="e.g. Intel Core i9-14900K"
                        />
                    </Field>

                    <Field label="Category" error={errors.category}>
                        <select
                            style={{ ...s.input, ...(errors.category ? s.inputErr : {}) }}
                            name="category" value={form.category} onChange={handleChange}
                        >
                            <option value="">Select a category</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Field>

                    <div style={s.row}>
                        <Field label="Price ($)" error={errors.price} style={{ flex: 1 }}>
                            <input
                                style={{ ...s.input, ...(errors.price ? s.inputErr : {}) }}
                                name="price" type="number" min="0" step="0.01"
                                value={form.price} onChange={handleChange}
                                placeholder="0.00"
                            />
                        </Field>
                        <Field label="Stock Quantity" error={errors.stock} style={{ flex: 1 }}>
                            <input
                                style={{ ...s.input, ...(errors.stock ? s.inputErr : {}) }}
                                name="stock" type="number" min="0"
                                value={form.stock} onChange={handleChange}
                                placeholder="0"
                            />
                        </Field>
                    </div>

                    <Field label="Description" error={errors.description}>
                        <textarea
                            style={{ ...s.input, ...s.textarea, ...(errors.description ? s.inputErr : {}) }}
                            name="description" value={form.description} onChange={handleChange}
                            placeholder="Detailed product description..." rows={4}
                        />
                    </Field>

                    <Field label="Images (URLs separated by comma)" error={errors.images}>
                        <input
                            style={{ ...s.input, ...(errors.images ? s.inputErr : {}) }}
                            name="images" value={form.images} onChange={handleChange}
                            placeholder="https://..., https://..."
                        />
                    </Field>

                    <button
                        type="submit"
                        disabled={loading}
                        onMouseEnter={() => setSubmitHovered(true)}
                        onMouseLeave={() => setSubmitHovered(false)}
                        style={{ ...s.submitBtn, ...(submitHovered && !loading ? s.submitBtnHover : {}) }}
                    >
                        {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const Field = ({ label, error, children, style = {} }) => (
    <div style={{ marginBottom: '18px', ...style }}>
        <label style={{ display: 'block', color: '#040d15', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
            {label}
        </label>
        {children}
        {error && <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
);

const s = {
    page: { minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '32px', color: '#040d15' },
    center: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
    spinner: { width: '40px', height: '40px', border: '4px solid #d1dce8', borderTop: '4px solid #1f73b7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    backBtn: { background: 'transparent', border: '1px solid #d1dce8', color: '#6b7a8d', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', transition: 'all 0.2s ease' },
    backBtnHover: { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' },
    card: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '16px', padding: '40px', maxWidth: '640px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
    title: { fontSize: '22px', fontWeight: '700', color: '#040d15', margin: '0 0 28px' },
    row: { display: 'flex', gap: '16px' },
    input: { width: '100%', padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #d1dce8', borderRadius: '8px', color: '#040d15', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    inputErr: { border: '1px solid #dc2626' },
    textarea: { resize: 'vertical', fontFamily: 'inherit' },
    submitBtn: { width: '100%', padding: '12px', backgroundColor: '#1f73b7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', transition: 'background-color 0.2s ease' },
    submitBtnHover: { backgroundColor: '#185d99' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e7ef', color: '#040d15', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 1000, fontSize: '14px' },
};

export default ProductForm;