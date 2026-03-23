import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email обов\'язковий';
        if (!formData.password) newErrors.password = 'Пароль обов\'язковий';
        return newErrors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setApiError('');
        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (error) {
            setApiError(error.response?.data?.message || 'Невірний email або пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Вхід</h2>
                <p style={styles.subtitle}>Увійдіть до свого акаунту</p>

                {apiError && <div style={styles.apiError}>{apiError}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@gmail.com"
                            style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
                        />
                        {errors.email && <span style={styles.error}>{errors.email}</span>}
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Пароль</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Введіть пароль"
                            style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
                        />
                        {errors.password && <span style={styles.error}>{errors.password}</span>}
                    </div>

                    <button type="submit" disabled={loading} style={styles.btn}>
                        {loading ? 'Вхід...' : 'Увійти'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Ще немає акаунту?{' '}
                    <Link to="/register" style={styles.footerLink}>Зареєструватись</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f0f1a',
        padding: '20px',
    },
    card: {
        backgroundColor: '#1a1a2e',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '1px solid #2a2a4e',
    },
    title: { color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px' },
    subtitle: { color: '#888', fontSize: '14px', margin: '0 0 28px' },
    apiError: {
        backgroundColor: '#2d1515',
        border: '1px solid #e05555',
        color: '#e05555',
        padding: '10px 14px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
    },
    field: { marginBottom: '18px' },
    label: { display: 'block', color: '#ccc', fontSize: '13px', marginBottom: '6px' },
    input: {
        width: '100%',
        padding: '10px 14px',
        backgroundColor: '#0f0f1a',
        border: '1px solid #2a2a4e',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    inputError: { border: '1px solid #e05555' },
    error: { color: '#e05555', fontSize: '12px', marginTop: '4px', display: 'block' },
    btn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#4a9eff',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '8px',
    },
    footer: { color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '20px' },
    footerLink: { color: '#4a9eff', textDecoration: 'none' },
};

export default Login;