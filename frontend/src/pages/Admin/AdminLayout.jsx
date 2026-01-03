import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaBook, 
  FaNewspaper, 
  FaUsers, 
  FaChartLine,
  FaSignOutAlt 
} from 'react-icons/fa';
import { authAPI } from '../../utils/api';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { path: '/admin', icon: <FaChartLine />, label: 'Dashboard', exact: true },
    { path: '/admin/manga', icon: <FaBook />, label: 'Manga Yönetimi' },
    { path: '/admin/news', icon: <FaNewspaper />, label: 'Haberler' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Kullanıcılar' }
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
        </div>

        <nav className="admin-nav">
          <Link to="/" className="admin-nav-item admin-nav-site">
            <FaHome />
            <span>Siteye Dön</span>
          </Link>

          <div className="admin-nav-divider"></div>

          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="admin-nav-divider"></div>

          <button onClick={handleLogout} className="admin-nav-item admin-nav-logout">
            <FaSignOutAlt />
            <span>Çıkış Yap</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;