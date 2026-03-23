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
            <div style={styles.logo}>
                <Link to="/" style={styles.logoLink}>ComTech</Link>
            </div>

            <div style={styles.links}>
                <Link to="/" style={styles.link}>Каталог</Link>

                {user ? (
                    <>
                        <Link to="/orders" style={styles.link}>Мої замовлення</Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" style={styles.link}>Адмін-панель</Link>
                        )}
                        <span style={styles.username}>{user.name}</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Вихід
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Вхід</Link>
                        <Link to="/register" style={styles.registerBtn}>Реєстрація</Link>
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
        backgroundColor: '#1a1a2e',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    logo: { fontSize: '20px', fontWeight: 'bold' },
    logoLink: { color: '#ddecf8', textDecoration: 'none' },
    links: { display: 'flex', alignItems: 'center', gap: '24px' },
    link: { color: '#ccc', textDecoration: 'none', fontSize: '14px' },
    username: { color: '##ddecf8', fontSize: '14px', fontWeight: 'bold' },
    logoutBtn: {
        background: 'transparent',
        border: '1px solid #e05555',
        color: '#e05555',
        padding: '6px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    registerBtn: {
        background: '#4a9eff',
        color: 'white',
        padding: '6px 16px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '14px',
    },
};

export default Navbar;