import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';
import { useCart } from '../../store/context/CartContext.jsx';
import { useLanguage } from '../../store/context/LanguageContext.jsx';

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
);

const Navbar = () => {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const { language, toggleLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMenuOpen(false);
    };

    const close = () => setMenuOpen(false);
    const showRoleBadge = user?.role === 'admin' || user?.role === 'employee';

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-logo" onClick={close}>ComTech</Link>
            </div>

            <div className="navbar-desktop">
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="nav-btn">{t('nav_admin')}</Link>
                        )}
                        <Link to="/orders" className="nav-btn">{t('nav_orders')}</Link>
                        <Link to="/cart" className="nav-btn">
                            {t('nav_cart')}
                            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                        </Link>
                        {showRoleBadge && <span className="role-badge">{user.role}</span>}
                        <span className="navbar-username">{user.name}</span>
                        <button onClick={handleLogout} className="nav-btn">{t('nav_logout')}</button>
                    </>
                ) : (
                    <>
                        <Link to="/cart" className="nav-btn">
                            {t('nav_cart')}
                            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                        </Link>
                        <Link to="/login" className="nav-btn">{t('nav_login')}</Link>
                        <Link to="/register" className="nav-btn register-btn">{t('nav_register')}</Link>
                    </>
                )}
                <button onClick={toggleLanguage} className="nav-btn">
                    {language === 'en' ? 'EN' : 'UA'}
                </button>
            </div>

            <div className="navbar-mobile-right">
                {user && (
                    <div className="navbar-tablet">
                        {user.role === 'admin' && (
                            <Link to="/admin" className="nav-btn" onClick={close}>{t('nav_admin')}</Link>
                        )}
                        <Link to="/orders" className="nav-btn" onClick={close}>{t('nav_orders')}</Link>
                    </div>
                )}

                <Link to="/cart" className="nav-cart-icon" onClick={close} aria-label="Cart">
                    <CartIcon />
                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </Link>

                <button onClick={toggleLanguage} className="nav-lang-mobile">
                    {language === 'en' ? 'EN' : 'UA'}
                </button>

                <button
                    className={`burger-btn${menuOpen ? ' burger-open' : ''}`}
                    onClick={() => setMenuOpen(p => !p)}
                    aria-label="Toggle menu"
                >
                    <span /><span /><span />
                </button>
            </div>

            {menuOpen && (
                <div className="mobile-menu">
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="mobile-item mobile-item-small" onClick={close}>
                                    {t('nav_admin')}
                                </Link>
                            )}
                            <Link to="/orders" className="mobile-item mobile-item-small" onClick={close}>
                                {t('nav_orders')}
                            </Link>

                            <div className="mobile-user-info">
                                {showRoleBadge && (
                                    <span className="mobile-role-badge">{user.role}</span>
                                )}
                                <span className="mobile-username">{user.name}</span>
                            </div>
                            <div className="mobile-divider" />
                            <button onClick={handleLogout} className="mobile-item mobile-logout">
                                {t('nav_logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mobile-item" onClick={close}>
                                {t('nav_login')}
                            </Link>
                            <Link to="/register" className="mobile-item" onClick={close}>
                                {t('nav_register')}
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;