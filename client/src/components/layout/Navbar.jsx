import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext.jsx';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.left}>
                <Link to="/" style={styles.logoLink}>ComTech</Link>
                <div style={styles.links}>
                    {user && <Link to="/orders" style={styles.link}>My Orders</Link>}
                    {user?.role === 'admin' && (
                        <Link to="/admin" style={styles.link}>Admin Panel</Link>
                    )}
                </div>
            </div>

            <div style={styles.right}>
                {user ? (
                    <>
                        <span style={styles.username}>{user.name}</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/register" style={styles.registerBtn}>Register</Link>
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
    left: { display: 'flex', alignItems: 'center', gap: '32px' },
    logoLink: { color: '#ffffff', textDecoration: 'none', fontSize: '20px', fontWeight: '700' },
    links: { display: 'flex', alignItems: 'center', gap: '24px' },
    link: { color: '#ffffff', textDecoration: 'none', fontSize: '14px' },
    right: { display: 'flex', alignItems: 'center', gap: '20px' },
    username: { color: '#ffffff', fontSize: '14px', fontWeight: '600' },
    logoutBtn: {
        background: 'transparent',
        border: '1px solid #ffffff',
        color: '#ffffff',
        padding: '6px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    registerBtn: {
        backgroundColor: '#1f73b7',
        color: '#ffffff',
        padding: '7px 18px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600',
    },
};

export default Navbar;