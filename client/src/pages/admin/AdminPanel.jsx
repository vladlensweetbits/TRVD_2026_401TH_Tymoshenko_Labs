import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/context/AuthContext';
import userService from '../../services/api/userService';
import orderService from '../../services/api/orderService';
import productService from '../../services/api/productService';

const ROLES = ['customer', 'employee', 'admin'];

const ROLE_COLORS = {
    admin:    { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
    employee: { bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' },
    customer: { bg: '#f0f4f8', color: '#6b7a8d', border: '#d1dce8' },
};

const AdminPanel = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

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
        if (isSelf) {
            showToast('You cannot change your own role');
            return;
        }
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
            showToast(`Role updated to ${newRole}`);
        } catch {
            showToast('Failed to update role');
        } finally {
            setUpdatingRole(null);
        }
    };

    const statCards = [
        { label: 'Total Users', value: stats.users, color: '#1f73b7', icon: '👥' },
        { label: 'Total Products', value: stats.products, color: '#16a34a', icon: '📦' },
        { label: 'Total Orders', value: stats.orders, color: '#854d0e', icon: '🛒' },
        { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, color: '#6b21a8', icon: '💰' },
    ];

    return (
        <div style={s.page}>
            {toast && <div style={s.toast}>{toast}</div>}

            {confirmModal && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <p style={s.modalText}>
                            Are you sure you want to change <strong>{confirmModal.userName}</strong>'s role to <strong>{confirmModal.newRole}</strong>?
                        </p>
                        <div style={s.modalBtns}>
                            <button
                                onMouseEnter={() => setConfirmNoHovered(true)}
                                onMouseLeave={() => setConfirmNoHovered(false)}
                                style={{ ...s.noBtn, ...(confirmNoHovered ? s.noBtnHover : {}) }}
                                onClick={() => setConfirmModal(null)}
                            >
                                No
                            </button>
                            <button
                                onMouseEnter={() => setConfirmYesHovered(true)}
                                onMouseLeave={() => setConfirmYesHovered(false)}
                                style={{ ...s.yesBtn, ...(confirmYesHovered ? s.yesBtnHover : {}) }}
                                onClick={confirmRoleChange}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={s.header}>
                <h1 style={s.title}>Admin Panel</h1>
            </div>

            <section style={s.section}>
                <h2 style={s.sectionTitle}>Overview</h2>
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
                <h2 style={s.sectionTitle}>User Role Management</h2>
                <div style={s.searchCard}>
                    <input
                        value={userSearch}
                        onChange={handleUserSearch}
                        placeholder="Search users by name or email..."
                        style={s.searchInput}
                        autoComplete="off"
                    />
                    {searchLoading && <div style={s.searchLoader}>Searching...</div>}

                    {!searchLoading && userSearch && searchResults.length === 0 && (
                        <div style={s.noResults}>No users found.</div>
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
                                                {isSelf && <span style={s.youBadge}>You</span>}
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
                                                    style={{
                                                        ...s.roleBtn,
                                                        ...(user.role === role ? s.roleBtnActive : {}),
                                                        ...(isSelf ? s.roleBtnDisabled : {}),
                                                    }}
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
                <h2 style={s.sectionTitle}>Quick Actions</h2>
                <div style={s.actionsGrid}>
                    <button style={s.actionCard} onClick={() => navigate('/products/new')}>
                        <div style={s.actionIcon}>➕</div>
                        <div style={s.actionLabel}>Add Product</div>
                    </button>
                    <button style={s.actionCard} onClick={() => navigate('/')}>
                        <div style={s.actionIcon}>📋</div>
                        <div style={s.actionLabel}>View Catalogue</div>
                    </button>
                    <button style={s.actionCard} onClick={() => navigate('/orders')}>
                        <div style={s.actionIcon}>📦</div>
                        <div style={s.actionLabel}>View Orders</div>
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
    statIcon: { fontSize: '32px', marginBottom: '12px' },
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
    actionIcon: { fontSize: '28px', marginBottom: '10px' },
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