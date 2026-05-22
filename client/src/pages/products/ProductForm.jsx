import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/api/productService';
import { useLanguage } from '../../store/context/LanguageContext';

const CATEGORIES = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case', 'Cooling'];

const emptyForm = { name: '', description: '', price: '', category: '', stock: '', images: '' };

const isValidUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch { return false; }
};

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [toast, setToast] = useState('');

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

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
            } catch { showToast(t('form_save_fail')); }
            finally { setFetchLoading(false); }
        };
        load();
    }, [id]);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = t('form_name') + ' is required';
        if (!form.description.trim()) e.description = t('form_description') + ' is required';
        if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = t('form_price') + ' is invalid';
        if (!form.category) e.category = t('form_category') + ' is required';
        if (form.stock === '' || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = t('form_stock') + ' is invalid';
        if (!form.images.trim()) {
            e.images = 'At least one image URL is required';
        } else {
            const urls = form.images.split(',').map(u => u.trim()).filter(Boolean);
            if (urls.length === 0) e.images = 'At least one image URL is required';
            else if (urls.filter(u => !isValidUrl(u)).length > 0) e.images = t('form_invalid_image');
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
                showToast(t('form_save_success'));
                setTimeout(() => navigate(`/products/${id}`), 1200);
            } else {
                const res = await productService.create(payload);
                showToast(t('form_save_success'));
                setTimeout(() => navigate(`/products/${res.data.data.id}`), 1200);
            }
        } catch (err) {
            showToast(err.response?.data?.message || t('form_save_fail'));
        } finally { setLoading(false); }
    };

    if (fetchLoading) return (
        <div className="form-page-wrapper">
            <div className="center-loader"><div className="shared-spinner" /></div>
        </div>
    );

    return (
        <div className="form-page-wrapper">
            {toast && <div className="shared-toast">{toast}</div>}

            <button className="back-btn" onClick={() => navigate(isEdit ? `/products/${id}` : '/')}>
                {t('form_back')}
            </button>

            <div className="form-page-card">
                <h2 className="form-page-title">{isEdit ? t('form_edit_title') : t('form_add_title')}</h2>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <label className="form-label">{t('form_name')}</label>
                        <input
                            className={`form-input${errors.name ? ' has-error' : ''}`}
                            name="name" value={form.name} onChange={handleChange}
                            placeholder="e.g. Intel Core i9-14900K"
                        />
                        {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>

                    <div className="form-field">
                        <label className="form-label">{t('form_category')}</label>
                        <select
                            className={`form-input${errors.category ? ' has-error' : ''}`}
                            name="category" value={form.category} onChange={handleChange}
                        >
                            <option value="">Select a category</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.category && <span className="field-error">{errors.category}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-field" style={{ flex: 1 }}>
                            <label className="form-label">{t('form_price')}</label>
                            <input
                                className={`form-input${errors.price ? ' has-error' : ''}`}
                                name="price" type="number" min="0" step="0.01"
                                value={form.price} onChange={handleChange} placeholder="0.00"
                            />
                            {errors.price && <span className="field-error">{errors.price}</span>}
                        </div>
                        <div className="form-field" style={{ flex: 1 }}>
                            <label className="form-label">{t('form_stock')}</label>
                            <input
                                className={`form-input${errors.stock ? ' has-error' : ''}`}
                                name="stock" type="number" min="0"
                                value={form.stock} onChange={handleChange} placeholder="0"
                            />
                            {errors.stock && <span className="field-error">{errors.stock}</span>}
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="form-label">{t('form_description')}</label>
                        <textarea
                            className={`form-input form-textarea${errors.description ? ' has-error' : ''}`}
                            name="description" value={form.description} onChange={handleChange}
                            placeholder="Detailed product description..." rows={4}
                        />
                        {errors.description && <span className="field-error">{errors.description}</span>}
                    </div>

                    <div className="form-field">
                        <label className="form-label">{t('form_images')}</label>
                        <input
                            className={`form-input${errors.images ? ' has-error' : ''}`}
                            name="images" value={form.images} onChange={handleChange}
                            placeholder={t('form_image_placeholder')}
                        />
                        {errors.images && <span className="field-error">{errors.images}</span>}
                    </div>

                    <button type="submit" disabled={loading} className="form-submit-btn">
                        {loading ? t('form_saving') : t('form_save')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;