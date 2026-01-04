import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserPlus, Users as UsersIcon, Eye, EyeOff, X, Loader2 } from 'lucide-react';
import { usersAPI } from '@/lib/api';
import { useNotification } from '../context/NotificationContext';

const Users = () => {
    const { notify } = useNotification();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'customer',
        isActive: true
    });

    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter]);

    useEffect(() => {
        if (editingUser) {
            setFormData({
                name: editingUser.name,
                email: editingUser.email,
                password: '', // Don't show password
                phone: editingUser.phone || '',
                role: editingUser.role,
                isActive: editingUser.isActive
            });
        } else {
            resetForm();
        }
    }, [editingUser]);

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            role: 'customer',
            isActive: true
        });
    };

    const fetchUsers = async () => {
        try {
            const res = await usersAPI.getAll({ search, role: roleFilter });
            setUsers(res.data.data.users || []);
        } catch (error) {
            console.error('Failed to fetch:', error);
            notify('error', 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await usersAPI.toggle(id);
            fetchUsers();
            notify('success', 'User status updated');
        } catch (error) {
            notify('error', error.response?.data?.message || 'Failed to toggle');
        }
    };

    const handleDelete = async (user) => {
        if (user.role === 'superadmin') {
            notify('error', 'Cannot delete Super Admin');
            return;
        }
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await usersAPI.delete(user._id);
            fetchUsers();
            notify('success', 'User deleted successfully');
        } catch (error) {
            notify('error', error.response?.data?.message || 'Failed to delete');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            if (editingUser) {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await usersAPI.update(editingUser._id, updateData);
                notify('success', 'User updated successfully');
            } else {
                await usersAPI.create(formData);
                notify('success', 'User created successfully');
            }
            setShowModal(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Failed to save user:', error);
            notify('error', error.response?.data?.message || 'Failed to save user');
        } finally {
            setSubmitLoading(false);
        }
    };

    const roleColors = {
        customer: 'bg-gray-500/20 text-gray-400',
        admin: 'bg-blue-500/20 text-blue-400',
        superadmin: 'bg-purple-500/20 text-purple-400',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="text-muted-foreground">Manage user accounts</p>
                </div>
                <button
                    onClick={() => { setEditingUser(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-silver text-black font-medium hover:shadow-lg transition-all"
                >
                    <UserPlus className="w-4 h-4" /> Add User
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full h-10 pl-9 pr-4 rounded-lg bg-background/50 border border-border focus:border-neon-silver/50 focus:outline-none"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-10 px-4 rounded-lg bg-background/50 border border-border focus:outline-none"
                >
                    <option value="">All Roles</option>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                </select>
            </div>

            <div className="glass-card rounded-xl overflow-hidden neon-border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium">User</th>
                                <th className="text-left px-4 py-3 text-sm font-medium">Role</th>
                                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                                <th className="text-left px-4 py-3 text-sm font-medium">Joined</th>
                                <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neon-silver/20 flex items-center justify-center text-sm font-medium">
                                                    {user.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${roleColors[user.role] || ''}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.role !== 'superadmin' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggle(user._id)}
                                                            className="p-2 rounded-lg hover:bg-white/5"
                                                            title={user.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditingUser(user); setShowModal(true); }}
                                                            className="p-2 rounded-lg hover:bg-white/5 text-blue-400"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {user.role === 'superadmin' && (
                                                    <span className="text-xs text-muted-foreground italic px-2">Protected</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div
                        className="bg-background rounded-xl w-full max-w-lg overflow-hidden border border-border shadow-2xl animate-in fade-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
                            <h2 className="text-xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-10 px-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-10 px-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{editingUser ? 'New Password (leave blank to keep)' : 'Password'}</label>
                                <input
                                    required={!editingUser}
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full h-10 px-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full h-10 px-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none"
                                    placeholder="+1 234 567 890"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full h-10 px-4 rounded-lg bg-muted/50 border border-border focus:border-neon-silver focus:outline-none text-foreground"
                                >
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                    {/* Superadmin cannot be created here usually, or restricted */}
                                </select>
                                <p className="text-xs text-muted-foreground">Admin users have access to this panel.</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="px-4 py-2 rounded-lg bg-neon-silver text-black font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
                                >
                                    {submitLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
