import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';
import productService from '../../services/api/productService';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    useEffect(() => {
        const fetch = async () => {
            // FIX: Guard against 'undefined' or empty IDs
            if (!id || id === 'undefined') {
                setError('Невірний ідентифікатор товару');
                setLoading(false);
                return;
            }

            try {
                const res = await productService.getById(id);
                setProduct(res.data);
            } catch {
                setError('Товар не знайдено');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    const handleDelete = async () => {
        try {
            await productService.delete(id);
            showToast('✅ Товар видалено');
            setTimeout(() => navigate('/'), 1500);
        } catch {
            showToast('❌ Помилка видалення');
            setConfirmDelete(false);
        }
    };

    if (loading) return (
        <div style={s.page}>
            <div style={s.center}><div style={s.spinner} /></div>
        </div>
    );

    if (error || !product) return (
        <div style={s.page}>
            <div style={s.errorBox}>{error || 'Помилка завантаження'}</div>
            <button style={s.backBtn} onClick={() => navigate('/')}>← Назад</button>
        </div>
    );

    return (
        <div style={s.page}>
            {toast && <div style={s.toast}>{toast}</div>}

            {confirmDelete && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <p style={s.modalText}>Ви впевнені, що хочете видалити цей товар?</p>
                        <div style={s.modalBtns}>
                            <button style={s.cancelBtn} onClick={() => setConfirmDelete(false)}>Скасувати</button>
                            <button style={s.deleteBtn} onClick={handleDelete}>Видалити</button>
                        </div>
                    </div>
                </div>
            )}

            <button style={s.backBtn} onClick={() => navigate('/')}>← Каталог</button>

            <div style={s.card}>
                <div style={s.topRow}>
                    <span style={s.category}>{product.category}</span>
                    <span style={product.stock > 0 ? s.inStock : s.outStock}>
                        {product.stock > 0 ? `В наявності: ${product.stock} шт.` : 'Немає в наявності'}
                    </span>
                </div>

                <h1 style={s.name}>{product.name}</h1>
                <p style={s.price}>{product.price?.toLocaleString()} ₴</p>

                <div style={s.section}>
                    <h3 style={s.sectionTitle}>Опис</h3>
                    <p style={s.desc}>{product.description}</p>
                </div>

                {/* Safety check for specs */}
                {product.specs && (
                    <div style={s.section}>
                        <h3 style={s.sectionTitle}>Характеристики</h3>
                        <table style={s.table}>
                            <tbody>
                            {product.specs instanceof Map || Array.isArray(product.specs) ? (
                                Array.from(product.specs).map(([key, val]) => (
                                    <tr key={key}>
                                        <td style={s.tdKey}>{key}</td>
                                        <td style={s.tdVal}>{val}</td>
                                    </tr>
                                ))
                            ) : (
                                Object.entries(product.specs).map(([key, val]) => (
                                    <tr key={key}>
                                        <td style={s.tdKey}>{key}</td>
                                        <td style={s.tdVal}>{val}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {product.rating > 0 && (
                    <div style={s.section}>
                        <span style={s.rating}>⭐{product.rating.toFixed(1)} / 5</span>
                    </div>
                )}

                {user?.role === 'admin' && (
                    <div style={s.adminActions}>
                        <button style={s.editBtn} onClick={() => navigate(`/products/${id}/edit`)}>
                            Редагувати
                        </button>
                        <button style={s.deleteBtn} onClick={() => setConfirmDelete(true)}>
                            Видалити
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ... (s styles remain exactly the same as you provided)
const s = {
    page: { minHeight: '100vh', backgroundColor: '#0f0f1a', padding: '32px', color: '#fff' },
    center: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
    spinner: { width: '40px', height: '40px', border: '4px solid #2a2a4e', borderTop: '4px solid #4a9eff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    backBtn: { background: 'transparent', border: '1px solid #2a2a4e', color: '#888', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '24px' },
    card: { backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e', borderRadius: '16px', padding: '40px', maxWidth: '720px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    category: { fontSize: '12px', color: '#4a9eff', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' },
    inStock: { fontSize: '13px', color: '#4caf50' },
    outStock: { fontSize: '13px', color: '#e05555' },
    name: { fontSize: '28px', fontWeight: 'bold', margin: '0 0 12px', color: '#fff' },
    price: { fontSize: '24px', fontWeight: 'bold', color: '#4a9eff', margin: '0 0 24px' },
    section: { marginBottom: '24px' },
    sectionTitle: { fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' },
    desc: { color: '#ccc', lineHeight: '1.7', fontSize: '15px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tdKey: { padding: '8px 12px', color: '#888', fontSize: '14px', borderBottom: '1px solid #2a2a4e', width: '40%' },
    tdVal: { padding: '8px 12px', color: '#fff', fontSize: '14px', borderBottom: '1px solid #2a2a4e' },
    rating: { fontSize: '16px', color: '#ffd700' },
    adminActions: { display: 'flex', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #2a2a4e' },
    editBtn: { padding: '10px 24px', backgroundColor: '#2a2a4e', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    deleteBtn: { padding: '10px 24px', backgroundColor: '#e05555', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    errorBox: { backgroundColor: '#2d1515', border: '1px solid #e05555', color: '#e05555', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e', color: '#fff', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 1000, fontSize: '14px' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modal: { backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e', borderRadius: '12px', padding: '32px', maxWidth: '360px', width: '90%' },
    modalText: { color: '#fff', fontSize: '16px', marginBottom: '24px', textAlign: 'center' },
    modalBtns: { display: 'flex', gap: '12px', justifyContent: 'center' },
    cancelBtn: { padding: '10px 24px', backgroundColor: '#2a2a4e', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
};

export default ProductDetail;