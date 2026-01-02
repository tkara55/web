import React, { useState, useEffect } from 'react';
import { FaBook, FaUsers, FaNewspaper, FaImages, FaEye, FaUserClock } from 'react-icons/fa';
import { adminAPI, statsAPI } from '../../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [siteStats, setSiteStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, siteStatsRes] = await Promise.all([
        adminAPI.getDashboard(),
        statsAPI.getSiteStats()
      ]);
      
      setStats(dashboardRes.data.data);
      setSiteStats(siteStatsRes.data.data);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
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

  const statCards = [
    {
      icon: <FaBook />,
      label: 'Toplam Manga',
      value: stats?.stats?.manga || 0,
      color: '#8b5cf6'
    },
    {
      icon: <FaBook />,
      label: 'Toplam Bölüm',
      value: stats?.stats?.chapters || 0,
      color: '#ec4899'
    },
    {
      icon: <FaUsers />,
      label: 'Toplam Kullanıcı',
      value: stats?.stats?.users || 0,
      color: '#3b82f6'
    },
    {
      icon: <FaNewspaper />,
      label: 'Haberler',
      value: stats?.stats?.news || 0,
      color: '#f59e0b'
    },
    {
      icon: <FaImages />,
      label: 'Galeri Resimleri',
      value: stats?.stats?.gallery || 0,
      color: '#10b981'
    },
    {
      icon: <FaEye />,
      label: 'Toplam Ziyaretçi',
      value: siteStats?.totalVisitors || 0,
      color: '#ef4444'
    },
    {
      icon: <FaUserClock />,
      label: 'Online Kullanıcı',
      value: siteStats?.onlineUsers || 0,
      color: '#06b6d4'
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>Hoş geldiniz! İşte sitenizin genel durumu.</p>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Son Kullanıcılar</h2>
          <div className="recent-list">
            {stats?.recentUsers?.length > 0 ? (
              stats.recentUsers.map((user) => (
                <div key={user._id} className="recent-item">
                  <div className="recent-item-info">
                    <span className="recent-item-name">{user.username}</span>
                    <span className="recent-item-meta">{user.email}</span>
                  </div>
                  <span className="recent-item-badge">{user.role}</span>
                </div>
              ))
            ) : (
              <p className="no-data">Henüz kullanıcı yok.</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Popüler Mangalar</h2>
          <div className="recent-list">
            {stats?.popularManga?.length > 0 ? (
              stats.popularManga.map((manga) => (
                <div key={manga._id} className="recent-item">
                  <div className="recent-item-info">
                    <span className="recent-item-name">{manga.title}</span>
                    <span className="recent-item-meta">
                      <FaEye /> {manga.viewCount} görüntülenme
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">Henüz manga yok.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;