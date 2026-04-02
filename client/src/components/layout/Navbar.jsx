import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';
import { useCart } from '../../store/context/CartContext.jsx';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const [logoutHovered, setLogoutHovered] = useState(false);
    const [registerHovered, setRegisterHovered] = useState(false);
    const [cartHovered, setCartHovered] = useState(false);
    const [adminHovered, setAdminHovered] = useState(false);
    const [ordersHovered, setOrdersHovered] = useState(false);
    const [loginHovered, setLoginHovered] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.left}>
                <Link to="/" style={styles.logoLink}>ComTech</Link>
            </div>

            <div style={styles.right}>
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <Link
                                to="/admin"
                                onMouseEnter={() => setAdminHovered(true)}
                                onMouseLeave={() => setAdminHovered(false)}
                                style={{ ...styles.navBtn, ...(adminHovered ? styles.navBtnHover : {}) }}
                            >
                                Admin Panel
                            </Link>
                        )}
                        <Link
                            to="/orders"
                            onMouseEnter={() => setOrdersHovered(true)}
                            onMouseLeave={() => setOrdersHovered(false)}
                            style={{ ...styles.navBtn, ...(ordersHovered ? styles.navBtnHover : {}) }}
                        >
                            My Orders
                        </Link>
                        <Link
                            to="/cart"
                            onMouseEnter={() => setCartHovered(true)}
                            onMouseLeave={() => setCartHovered(false)}
                            style={{ ...styles.navBtn, ...(cartHovered ? styles.navBtnHover : {}) }}
                        >
                            Cart
                            {itemCount > 0 && (
                                <span style={styles.cartBadge}>{itemCount}</span>
                            )}
                        </Link>
                        <span style={styles.username}>{user.name}</span>
                        <button
                            onClick={handleLogout}
                            onMouseEnter={() => setLogoutHovered(true)}
                            onMouseLeave={() => setLogoutHovered(false)}
                            style={{ ...styles.logoutBtn, ...(logoutHovered ? styles.logoutBtnHover : {}) }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            onMouseEnter={() => setLoginHovered(true)}
                            onMouseLeave={() => setLoginHovered(false)}
                            style={{ ...styles.navBtn, ...(loginHovered ? styles.navBtnHover : {}) }}
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            onMouseEnter={() => setRegisterHovered(true)}
                            onMouseLeave={() => setRegisterHovered(false)}
                            style={{ ...styles.registerBtn, ...(registerHovered ? styles.registerBtnHover : {}) }}
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 32px',
        height: '64px',
        backgroundColor: '#151a1e',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    left: { display: 'flex', alignItems: 'center' },
    logoLink: { color: '#ffffff', textDecoration: 'none', fontSize: '20px', fontWeight: '700' },
    right: { display: 'flex', alignItems: 'center', gap: '16px' },
    navBtn: {
        color: '#ffffff',
        textDecoration: 'none',
        fontSize: '14px',
        backgroundColor: 'transparent',
        border: '1px solid #ffffff',
        padding: '6px 16px',
        borderRadius: '6px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    navBtnHover: { backgroundColor: '#ffffff', color: '#151a1e' },
    cartBadge: {
        backgroundColor: '#dc2626',
        color: '#ffffff',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        fontSize: '11px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    username: { color: '#ffffff', fontSize: '14px', fontWeight: '600' },
    logoutBtn: {
        backgroundColor: 'transparent',
        border: '1px solid #ffffff',
        color: '#ffffff',
        padding: '6px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.2s ease, color 0.2s ease',
    },
    logoutBtnHover: { backgroundColor: '#ffffff', color: '#151a1e' },
    registerBtn: {
        backgroundColor: '#1f73b7',
        color: '#ffffff',
        padding: '7px 18px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'background-color 0.2s ease',
    },
    registerBtnHover: { backgroundColor: '#145082' },
};

export default Navbar;