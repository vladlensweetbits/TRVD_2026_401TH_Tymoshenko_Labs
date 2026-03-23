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

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [toast, setToast] = useState('');

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
                showToast('❌ Не вдалось завантажити товар');
            } finally {
                setFetchLoading(false);
            }
        };
        load();
    }, [id]);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Назва обов'язкова";
        if (!form.description.trim()) e.description = "Опис обов'язковий";
        if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
            e.price = 'Введіть коректну ціну';
        if (!form.category) e.category = "Категорія обов'язкова";
        if (form.stock === '' || isNaN(Number(form.stock)) || Number(form.stock) < 0)
            e.stock = 'Введіть коректну кількість';
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
                images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
            };

            if (isEdit) {
                await productService.update(id, payload);
                showToast('✅ Товар оновлено');
                setTimeout(() => navigate(`/products/${id}`), 1200);
            } else {
                const res = await productService.create(payload);
                showToast('✅ Товар додано');
                setTimeout(() => navigate(`/products/${res.data._id}`), 1200);
            }
        } catch (err) {
            showToast('❌ ' + (err.response?.data?.message || 'Помилка збереження'));
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

            <button style={s.backBtn} onClick={() => navigate(isEdit ? `/products/${id}` : '/')}>
                ← Назад
            </button>

            <div style={s.card}>
                <h2 style={s.title}>{isEdit ? 'Редагувати товар' : 'Новий товар'}</h2>

                <form onSubmit={handleSubmit}>
                    <Field label="Назва товару" error={errors.name}>
                        <input style={{ ...s.input, ...(errors.name ? s.inputErr : {}) }}
                               name="name" value={form.name} onChange={handleChange}
                               placeholder="Наприклад: Intel Core i9-14900K" />
                    </Field>

                    <Field label="Категорія" error={errors.category}>
                        <select style={{ ...s.input, ...(errors.category ? s.inputErr : {}) }}
                                name="category" value={form.category} onChange={handleChange}>
                            <option value="">Оберіть категорію</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Field>

                    <div style={s.row}>
                        <Field label="Ціна (₴)" error={errors.price} style={{ flex: 1 }}>
                            <input style={{ ...s.input, ...(errors.price ? s.inputErr : {}) }}
                                   name="price" type="number" min="0" step="0.01"
                                   value={form.price} onChange={handleChange}
                                   placeholder="0.00" />
                        </Field>
                        <Field label="Кількість на складі" error={errors.stock} style={{ flex: 1 }}>
                            <input style={{ ...s.input, ...(errors.stock ? s.inputErr : {}) }}
                                   name="stock" type="number" min="0"
                                   value={form.stock} onChange={handleChange}
                                   placeholder="0" />
                        </Field>
                    </div>

                    <Field label="Опис" error={errors.description}>
                        <textarea style={{ ...s.input, ...s.textarea, ...(errors.description ? s.inputErr : {}) }}
                                  name="description" value={form.description} onChange={handleChange}
                                  placeholder="Детальний опис товару..." rows={4} />
                    </Field>

                    <Field label="Зображення (URL через кому)" error={errors.images}>
                        <input style={s.input}
                               name="images" value={form.images} onChange={handleChange}
                               placeholder="https://..., https://..." />
                    </Field>

                    <button type="submit" disabled={loading} style={s.submitBtn}>
                        {loading ? 'Збереження...' : isEdit ? 'Зберегти зміни' : 'Додати товар'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const Field = ({ label, error, children, style = {} }) => (
    <div style={{ marginBottom: '18px', ...style }}>
        <label style={{ display: 'block', color: '#ccc', fontSize: '13px', marginBottom: '6px' }}>{label}</label>
        {children}
        {error && <span style={{ color: '#e05555', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
);

const s = {
    page: { minHeight: '100vh', backgroundColor: '#0f0f1a', padding: '32px', color: '#fff' },
    center: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
    spinner: { width: '40px', height: '40px', border: '4px solid #2a2a4e', borderTop: '4px solid #4a9eff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    backBtn: { background: 'transparent', border: '1px solid #2a2a4e', color: '#888', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '24px' },
    card: { backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e', borderRadius: '16px', padding: '40px', maxWidth: '640px' },
    title: { fontSize: '22px', fontWeight: 'bold', color: '#fff', margin: '0 0 28px' },
    row: { display: 'flex', gap: '16px' },
    input: { width: '100%', padding: '10px 14px', backgroundColor: '#0f0f1a', border: '1px solid #2a2a4e', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    inputErr: { border: '1px solid #e05555' },
    textarea: { resize: 'vertical', fontFamily: 'inherit' },
    submitBtn: { width: '100%', padding: '12px', backgroundColor: '#4a9eff', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e', color: '#fff', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 1000, fontSize: '14px' },
};

export default ProductForm;
