import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaUserShield, FaUser, FaCrown } from 'react-icons/fa';
import { adminAPI } from '../../utils/api';
import './AdminUsers.css';

const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedRole !== 'all') params.role = selectedRole;
      if (searchQuery) params.search = searchQuery;
      
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Users fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      setDeleteConfirm(null);
      alert('Kullanıcı başarıyla silindi!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi başarısız: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(users.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      ));
      setEditUser(null);
      alert('Kullanıcı rolü güncellendi!');
    } catch (error) {
      console.error('Role update error:', error);
      alert('Rol güncelleme başarısız: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const user = users.find(u => u._id === userId);
      await adminAPI.updateUser(userId, {
        username: user.username,
        email: user.email,
        isActive: !currentStatus
      });
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isActive: !currentStatus } : u
      ));
      alert(`Kullanıcı ${!currentStatus ? 'aktif' : 'pasif'} edildi!`);
    } catch (error) {
      console.error('Toggle active error:', error);
      alert('İşlem başarısız: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <FaCrown />;
      case 'moderator': return <FaUserShield />;
      default: return <FaUser />;
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'admin': return 'Admin';
      case 'moderator': return 'Moderatör';
      default: return 'Kullanıcı';
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="admin-users-list">
      <div className="admin-page-header">
        <div>
          <h1>Kullanıcı Yönetimi</h1>
          <p>Tüm kullanıcıları görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Filters */}
      <div className="users-filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tüm Roller</option>
          <option value="user">Kullanıcı</option>
          <option value="moderator">Moderatör</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="empty-state">
          <FaUser />
          <h3>Kullanıcı bulunamadı</h3>
          <p>Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Kayıt Tarihi</th>
                <th>Son Giriş</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {getRoleIcon(user.role)}
                      </div>
                      <span className="user-name">{user.username}</span>
                    </div>
                  </td>
                  <td>
                    <span className="user-email">{user.email}</span>
                  </td>
                  <td>
                    {editUser === user._id ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="role-select"
                        autoFocus
                        onBlur={() => setEditUser(null)}
                      >
                        <option value="user">Kullanıcı</option>
                        <option value="moderator">Moderatör</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span 
                        className={`role-badge role-${user.role}`}
                        onClick={() => setEditUser(user._id)}
                        style={{ cursor: 'pointer' }}
                        title="Rolü değiştirmek için tıklayın"
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(user._id, user.isActive)}
                      className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}
                    >
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td>
                    <span className="date-text">{formatDate(user.createdAt)}</span>
                  </td>
                  <td>
                    <span className="date-text">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Hiç giriş yapmadı'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        onClick={() => setDeleteConfirm(user._id)}
                        className="action-btn delete"
                        title="Sil"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Kullanıcı Sil</h3>
            <p>Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="modal-actions">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                İptal
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirm)}
                className="btn btn-danger"
              >
                <FaTrash /> Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersList;