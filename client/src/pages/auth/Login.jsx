import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext';
import { useLanguage } from '../../store/context/LanguageContext';

const Login = () => {
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const registeredSuccess = location.state?.registered === true;

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const validate = () => {
        const e = {};
        if (!formData.email.trim()) e.email = t('login_err_email');
        if (!formData.password) e.password = t('login_err_password');
        return e;
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
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
        setLoading(true);
        setApiError('');
        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (error) {
            setApiError(error.response?.data?.message || t('login_fail'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">{t('login_title')}</h2>
                <p className="auth-subtitle">{t('login_subtitle')}</p>

                {registeredSuccess && (
                    <div className="auth-success-msg">
                        {t('register_btn')} — {t('login_btn')}
                    </div>
                )}
                {apiError && <div className="api-error-box">{apiError}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <label className="form-label">{t('login_email')}</label>
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
                        <label className="form-label">{t('login_password')}</label>
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

                    <button type="submit" disabled={loading} className="primary-btn">
                        {loading ? t('login_loading') : t('login_btn')}
                    </button>
                </form>

                <p className="auth-footer">
                    {t('login_no_account')}{' '}
                    <Link to="/register" className="auth-footer-link">{t('login_register')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;