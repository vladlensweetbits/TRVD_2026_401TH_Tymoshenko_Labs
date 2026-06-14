import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext';
import { useLanguage } from '../../store/context/LanguageContext';
import userService from '../../services/api/userService';
import orderService from '../../services/api/orderService';
import productService from '../../services/api/productService';

const ROLES = ['customer', 'employee', 'admin'];

const ROLE_COLORS = {
    admin:    { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
    employee: { bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' },
    customer: { bg: '#f0f4f8', color: '#6b7a8d', border: '#d1dce8' },
};

const Icons = {
    users: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1f73b7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    products: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
        </svg>
    ),
    orders: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#854d0e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
    ),
    revenue: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b21a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
    ),
    addProduct: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f73b7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
    ),
    catalogue: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f73b7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
    ),
    viewOrders: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f73b7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
        </svg>
    ),
};

const AdminPanel = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const { t } = useLanguage();

    const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
    const [statsLoading, setStatsLoading] = useState(true);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [updatingRole, setUpdatingRole] = useState(null);
    const [toast, setToast] = useState('');
    const [confirmModal, setConfirmModal] = useState(null);

    const searchDebounceRef = useRef(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    useEffect(() => {
        const loadStats = async () => {
            setStatsLoading(true);
            try {
                const [usersRes, productsRes, ordersRes] = await Promise.all([
                    userService.getAll(),
                    productService.getAll(),
                    orderService.getAll(),
                ]);
                const users = usersRes.data || [];
                const products = productsRes.data || [];
                const orders = ordersRes.data || [];
                const revenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
                setStats({ users: users.length, products: products.length, orders: orders.length, revenue });
            } catch {
                setStats({ users: 0, products: 0, orders: 0, revenue: 0 });
            } finally {
                setStatsLoading(false);
            }
        };
        loadStats();
    }, []);

    const handleUserSearch = (e) => {
        const val = e.target.value;
        setUserSearch(val);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        if (!val.trim()) { setSearchResults([]); return; }
        searchDebounceRef.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await userService.search(val);
                setSearchResults(res.data || []);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 350);
    };

    const requestRoleChange = (userId, userName, newRole) => {
        const isSelf = (currentUser?.id || currentUser?._id) === userId;
        if (isSelf) { showToast(t('admin_own_role')); return; }
        setConfirmModal({ userId, userName, newRole });
    };

    const confirmRoleChange = async () => {
        const { userId, newRole } = confirmModal;
        setConfirmModal(null);
        setUpdatingRole(userId);
        try {
            await userService.updateRole(userId, newRole);
            setSearchResults(prev => prev.map(u =>
                (u.id || u._id) === userId ? { ...u, role: newRole } : u
            ));
            showToast(`${t('admin_role_updated')} ${newRole}`);
        } catch {
            showToast(t('admin_role_fail'));
        } finally {
            setUpdatingRole(null);
        }
    };

    const statCards = [
        { label: t('admin_users'),    value: stats.users,                          color: '#1f73b7', icon: Icons.users    },
        { label: t('admin_products'), value: stats.products,                       color: '#16a34a', icon: Icons.products },
        { label: t('admin_orders'),   value: stats.orders,                         color: '#854d0e', icon: Icons.orders   },
        { label: t('admin_revenue'),  value: `${stats.revenue.toLocaleString()}₴`, color: '#6b21a8', icon: Icons.revenue  },
    ];

    return (
        <div className="admin-page">
            {toast && <div className="admin-toast">{toast}</div>}

            {confirmModal && (
                <div className="admin-overlay">
                    <div className="admin-modal">
                        <p className="admin-modal-text">
                            {t('admin_role_confirm')} <strong>{confirmModal.userName}</strong> {t('admin_role_to')} <strong>{confirmModal.newRole}</strong>?
                        </p>
                        <div className="admin-modal-btns">
                            <button
                                className="admin-no-btn"
                                onClick={() => setConfirmModal(null)}
                            >
                                {t('admin_no')}
                            </button>
                            <button
                                className="admin-yes-btn"
                                onClick={confirmRoleChange}
                            >
                                {t('admin_yes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-header">
                <h1 className="admin-title">{t('admin_title')}</h1>
            </div>

            <section className="admin-section">
                <h2 className="admin-section-title">{t('admin_overview')}</h2>
                {statsLoading ? (
                    <div className="admin-center">
                        <div className="admin-spinner" />
                    </div>
                ) : (
                    <div className="admin-stats-grid">
                        {statCards.map((card) => (
                            <div key={card.label} className="admin-stat-card">
                                <div className="admin-stat-icon">{card.icon}</div>
                                <div className="admin-stat-value" style={{ color: card.color }}>
                                    {card.value}
                                </div>
                                <div className="admin-stat-label">{card.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="admin-section">
                <h2 className="admin-section-title">{t('admin_role_management')}</h2>
                <div className="admin-search-card">
                    <input
                        value={userSearch}
                        onChange={handleUserSearch}
                        placeholder={t('admin_search_placeholder')}
                        className="admin-search-input"
                        autoComplete="off"
                    />
                    {searchLoading && (
                        <div className="admin-search-loader">{t('admin_searching')}</div>
                    )}
                    {!searchLoading && userSearch && searchResults.length === 0 && (
                        <div className="admin-no-results">{t('admin_no_users')}</div>
                    )}
                    {searchResults.length > 0 && (
                        <div className="admin-user-list">
                            {searchResults.map((user) => {
                                const userId = user.id || user._id;
                                const isSelf = (currentUser?.id || currentUser?._id) === userId;
                                const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.customer;
                                return (
                                    <div
                                        key={userId}
                                        className={`admin-user-row${isSelf ? ' admin-user-row-self' : ''}`}
                                    >
                                        <div className="admin-user-info">
                                            <div className="admin-user-name-row">
                                                <span className="admin-user-name">{user.name}</span>
                                                {isSelf && (
                                                    <span className="admin-you-badge">{t('admin_you')}</span>
                                                )}
                                            </div>
                                            <div className="admin-user-email">{user.email}</div>
                                        </div>

                                        <span
                                            className="admin-role-badge"
                                            style={{
                                                backgroundColor: roleStyle.bg,
                                                color: roleStyle.color,
                                                border: `1px solid ${roleStyle.border}`,
                                            }}
                                        >
                                            {user.role}
                                        </span>

                                        <div className="admin-role-buttons">
                                            {ROLES.map(role => (
                                                <button
                                                    key={role}
                                                    disabled={user.role === role || updatingRole === userId || isSelf}
                                                    className={[
                                                        'admin-role-btn',
                                                        user.role === role ? 'admin-role-btn-active' : '',
                                                        isSelf ? 'admin-role-btn-disabled' : '',
                                                    ].join(' ').trim()}
                                                    onClick={() => requestRoleChange(userId, user.name, role)}
                                                >
                                                    {updatingRole === userId ? '...' : role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <section className="admin-section">
                <h2 className="admin-section-title">{t('admin_quick_actions')}</h2>
                <div className="admin-actions-grid">
                    <button className="admin-action-card" onClick={() => navigate('/products/new')}>
                        <div className="admin-action-icon">{Icons.addProduct}</div>
                        <div className="admin-action-label">{t('admin_add_product')}</div>
                    </button>
                    <button className="admin-action-card" onClick={() => navigate('/')}>
                        <div className="admin-action-icon">{Icons.catalogue}</div>
                        <div className="admin-action-label">{t('admin_view_catalogue')}</div>
                    </button>
                    <button className="admin-action-card" onClick={() => navigate('/orders')}>
                        <div className="admin-action-icon">{Icons.viewOrders}</div>
                        <div className="admin-action-label">{t('admin_view_orders')}</div>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AdminPanel;