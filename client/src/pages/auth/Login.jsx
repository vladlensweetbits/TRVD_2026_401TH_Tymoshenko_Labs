import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const registeredSuccess = location.state?.registered === true;

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [btnHovered, setBtnHovered] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        return newErrors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
        setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

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
            setApiError(error.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Sign In</h2>
                <p style={styles.subtitle}>Welcome back to ComTech</p>

                {registeredSuccess && (
                    <div style={styles.successMessage}>
                        Your account has been created successfully. Now you can sign in.
                    </div>
                )}

                {apiError && (
                    <div style={styles.apiError}>{apiError}</div>
                )}

                <form onSubmit={handleSubmit} noValidate>
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
                        <label style={styles.label}>Password</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
                        />
                        {errors.password && <span style={styles.error}>{errors.password}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        onMouseEnter={() => setBtnHovered(true)}
                        onMouseLeave={() => setBtnHovered(false)}
                        style={{ ...styles.btn, ...(btnHovered && !loading ? styles.btnHover : {}) }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don&apos;t have an account?{' '}
                    <Link to="/register" style={styles.footerLink}>Register</Link>
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
        backgroundColor: '#f0f4f8',
        padding: '20px',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #e0e7ef',
    },
    title: { color: '#040d15', fontSize: '26px', fontWeight: '700', margin: '0 0 6px' },
    subtitle: { color: '#6b7a8d', fontSize: '14px', margin: '0 0 28px' },
    successMessage: {
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        color: '#16a34a',
        padding: '10px 14px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
    },
    apiError: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        color: '#dc2626',
        padding: '10px 14px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
    },
    field: { marginBottom: '18px' },
    label: { display: 'block', color: '#040d15', fontSize: '13px', fontWeight: '500', marginBottom: '6px' },
    input: {
        width: '100%', padding: '10px 14px',
        backgroundColor: '#f8fafc', border: '1px solid #d1dce8',
        borderRadius: '8px', color: '#040d15', fontSize: '14px',
        outline: 'none', boxSizing: 'border-box',
    },
    inputError: { border: '1px solid #dc2626' },
    error: { color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' },
    btn: {
        width: '100%', padding: '12px',
        backgroundColor: '#1f73b7', color: '#ffffff',
        border: 'none', borderRadius: '8px',
        fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px',
        transition: 'background-color 0.2s ease',
    },
    btnHover: { backgroundColor: '#185d99' },
    footer: { color: '#6b7a8d', fontSize: '13px', textAlign: 'center', marginTop: '20px' },
    footerLink: { color: '#1f73b7', textDecoration: 'none', fontWeight: '600' },
};

export default Login;