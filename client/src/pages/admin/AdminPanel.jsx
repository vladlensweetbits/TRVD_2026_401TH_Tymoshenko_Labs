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
    const [confirmYesHovered, setConfirmYesHovered] = useState(false);
    const [confirmNoHovered, setConfirmNoHovered] = useState(false);

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
        { label: t('admin_users'), value: stats.users, color: '#1f73b7', icon: Icons.users },
        { label: t('admin_products'), value: stats.products, color: '#16a34a', icon: Icons.products },
        { label: t('admin_orders'), value: stats.orders, color: '#854d0e', icon: Icons.orders },
        { label: t('admin_revenue'), value: `${stats.revenue.toLocaleString()}₴`, color: '#6b21a8', icon: Icons.revenue },
    ];

    return (
        <div style={s.page}>
            {toast && <div style={s.toast}>{toast}</div>}

            {confirmModal && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <p style={s.modalText}>
                            {t('admin_role_confirm')} <strong>{confirmModal.userName}</strong> {t('admin_role_to')} <strong>{confirmModal.newRole}</strong>?
                        </p>
                        <div style={s.modalBtns}>
                            <button
                                onMouseEnter={() => setConfirmNoHovered(true)}
                                onMouseLeave={() => setConfirmNoHovered(false)}
                                style={{ ...s.noBtn, ...(confirmNoHovered ? s.noBtnHover : {}) }}
                                onClick={() => setConfirmModal(null)}
                            >
                                {t('admin_no')}
                            </button>
                            <button
                                onMouseEnter={() => setConfirmYesHovered(true)}
                                onMouseLeave={() => setConfirmYesHovered(false)}
                                style={{ ...s.yesBtn, ...(confirmYesHovered ? s.yesBtnHover : {}) }}
                                onClick={confirmRoleChange}
                            >
                                {t('admin_yes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={s.header}>
                <h1 style={s.title}>{t('admin_title')}</h1>
            </div>

            <section style={s.section}>
                <h2 style={s.sectionTitle}>{t('admin_overview')}</h2>
                {statsLoading ? (
                    <div style={s.center}><div style={s.spinner} /></div>
                ) : (
                    <div style={s.statsGrid}>
                        {statCards.map((card) => (
                            <div key={card.label} style={s.statCard}>
                                <div style={s.statIcon}>{card.icon}</div>
                                <div style={{ ...s.statValue, color: card.color }}>{card.value}</div>
                                <div style={s.statLabel}>{card.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section style={s.section}>
                <h2 style={s.sectionTitle}>{t('admin_role_management')}</h2>
                <div style={s.searchCard}>
                    <input
                        value={userSearch}
                        onChange={handleUserSearch}
                        placeholder={t('admin_search_placeholder')}
                        style={s.searchInput}
                        autoComplete="off"
                    />
                    {searchLoading && <div style={s.searchLoader}>{t('admin_searching')}</div>}
                    {!searchLoading && userSearch && searchResults.length === 0 && (
                        <div style={s.noResults}>{t('admin_no_users')}</div>
                    )}
                    {searchResults.length > 0 && (
                        <div style={s.userList}>
                            {searchResults.map((user) => {
                                const userId = user.id || user._id;
                                const isSelf = (currentUser?.id || currentUser?._id) === userId;
                                const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.customer;
                                return (
                                    <div key={userId} style={{ ...s.userRow, ...(isSelf ? s.userRowSelf : {}) }}>
                                        <div style={s.userInfo}>
                                            <div style={s.userNameRow}>
                                                <span style={s.userName}>{user.name}</span>
                                                {isSelf && <span style={s.youBadge}>{t('admin_you')}</span>}
                                            </div>
                                            <div style={s.userEmail}>{user.email}</div>
                                        </div>
                                        <span style={{ ...s.roleBadge, backgroundColor: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}>
                                            {user.role}
                                        </span>
                                        <div style={s.roleButtons}>
                                            {ROLES.map(role => (
                                                <button
                                                    key={role}
                                                    disabled={user.role === role || updatingRole === userId || isSelf}
                                                    style={{ ...s.roleBtn, ...(user.role === role ? s.roleBtnActive : {}), ...(isSelf ? s.roleBtnDisabled : {}) }}
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

            <section style={s.section}>
                <h2 style={s.sectionTitle}>{t('admin_quick_actions')}</h2>
                <div style={s.actionsGrid}>
                    <button style={s.actionCard} onClick={() => navigate('/products/new')}>
                        <div style={s.actionIcon}>{Icons.addProduct}</div>
                        <div style={s.actionLabel}>{t('admin_add_product')}</div>
                    </button>
                    <button style={s.actionCard} onClick={() => navigate('/')}>
                        <div style={s.actionIcon}>{Icons.catalogue}</div>
                        <div style={s.actionLabel}>{t('admin_view_catalogue')}</div>
                    </button>
                    <button style={s.actionCard} onClick={() => navigate('/orders')}>
                        <div style={s.actionIcon}>{Icons.viewOrders}</div>
                        <div style={s.actionLabel}>{t('admin_view_orders')}</div>
                    </button>
                </div>
            </section>
        </div>
    );
};

const s = {
    page: { minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '32px', color: '#040d15' },
    header: { marginBottom: '32px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#040d15', margin: 0 },
    section: { marginBottom: '36px' },
    sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#040d15', margin: '0 0 16px' },
    center: { display: 'flex', justifyContent: 'center', padding: '40px 0' },
    spinner: { width: '36px', height: '36px', border: '4px solid #d1dce8', borderTop: '4px solid #1f73b7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
    statCard: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    statIcon: { marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: '28px', fontWeight: '700', marginBottom: '6px' },
    statLabel: { fontSize: '13px', color: '#6b7a8d', fontWeight: '500' },
    searchCard: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    searchInput: { width: '100%', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #d1dce8', borderRadius: '8px', color: '#040d15', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    searchLoader: { fontSize: '13px', color: '#6b7a8d', padding: '12px 0' },
    noResults: { fontSize: '13px', color: '#6b7a8d', padding: '16px 0', textAlign: 'center' },
    userList: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
    userRow: { display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e0e7ef', flexWrap: 'wrap' },
    userRowSelf: { backgroundColor: '#fffbeb', border: '1px solid #fde68a' },
    userInfo: { flex: 1, minWidth: '160px' },
    userNameRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    userName: { fontSize: '14px', fontWeight: '600', color: '#040d15' },
    youBadge: { fontSize: '11px', fontWeight: '700', backgroundColor: '#fde68a', color: '#854d0e', padding: '2px 8px', borderRadius: '20px', border: '1px solid #fbbf24' },
    userEmail: { fontSize: '12px', color: '#6b7a8d', marginTop: '2px' },
    roleBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' },
    roleButtons: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    roleBtn: { padding: '5px 12px', backgroundColor: '#f0f4f8', border: '1px solid #d1dce8', color: '#040d15', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s ease' },
    roleBtnActive: { backgroundColor: '#1f73b7', border: '1px solid #1f73b7', color: '#ffffff', cursor: 'default' },
    roleBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
    actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' },
    actionCard: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s ease' },
    actionIcon: { marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    actionLabel: { fontSize: '13px', fontWeight: '600', color: '#040d15' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#ffffff', border: '1px solid #e0e7ef', color: '#040d15', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 1000, fontSize: '14px' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
    modal: { backgroundColor: '#ffffff', border: '1px solid #e0e7ef', borderRadius: '12px', padding: '32px', maxWidth: '400px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
    modalText: { color: '#040d15', fontSize: '15px', marginBottom: '24px', textAlign: 'center', lineHeight: '1.6' },
    modalBtns: { display: 'flex', gap: '12px', justifyContent: 'center' },
    noBtn: { padding: '10px 32px', backgroundColor: '#f0f4f8', border: '1px solid #d1dce8', color: '#040d15', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s ease' },
    noBtnHover: { backgroundColor: '#e2e8f0', borderColor: '#94a3b8' },
    yesBtn: { padding: '10px 32px', backgroundColor: '#1f73b7', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'background-color 0.2s ease' },
    yesBtnHover: { backgroundColor: '#145082' },
};

export default AdminPanel;