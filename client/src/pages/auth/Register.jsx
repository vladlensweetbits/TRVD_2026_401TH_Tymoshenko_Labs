import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';
import { useLanguage } from '../../store/context/LanguageContext';

const Register = () => {
    const { register } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const validate = () => {
        const e = {};
        if (!formData.name.trim()) e.name = t('register_err_name');
        if (!formData.email.trim()) e.email = t('register_err_email');
        else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = t('register_err_email');
        if (!formData.password) e.password = t('register_err_password');
        else if (formData.password.length < 6) e.password = t('register_err_password');
        if (formData.password !== formData.confirmPassword) e.confirmPassword = t('register_err_password');
        return e;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
        setLoading(true);
        setApiError('');
        try {
            await register({ name: formData.name, email: formData.email, password: formData.password });
            navigate('/login', { state: { registered: true } });
        } catch (error) {
            setApiError(error.response?.data?.message || t('register_fail'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">{t('register_title')}</h2>
                <p className="auth-subtitle">{t('register_subtitle')}</p>

                {apiError && <div className="api-error-box">{apiError}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <label className="form-label">{t('register_name')}</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={`form-input${errors.name ? ' has-error' : ''}`}
                        />
                        {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>

                    <div className="form-field">
                        <label className="form-label">{t('register_email')}</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@gmail.com"
                            className={`form-input${errors.email ? ' has-error' : ''}`}
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>

                    <div className="form-field">
                        <label className="form-label">{t('register_password')}</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={`form-input${errors.password ? ' has-error' : ''}`}
                        />
                        {errors.password && <span className="field-error">{errors.password}</span>}
                    </div>

                    <div className="form-field">
                        <label className="form-label">{t('register_password')} (confirm)</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={`form-input${errors.confirmPassword ? ' has-error' : ''}`}
                        />
                        {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                    </div>

                    <button type="submit" disabled={loading} className="primary-btn">
                        {loading ? t('register_loading') : t('register_btn')}
                    </button>
                </form>

                <p className="auth-footer">
                    {t('register_have_account')}{' '}
                    <Link to="/login" className="auth-footer-link">{t('register_login')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;