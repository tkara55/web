import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaThumbtack } from 'react-icons/fa';
import { newsAPI } from '../../utils/api';
import './AdminNews.css';

const AdminNewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await newsAPI.getAll({ limit: 100 });
      setNews(response.data.data);
    } catch (error) {
      console.error('News fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    try {
      await newsAPI.delete(slug);
      setNews(news.filter(n => n.slug !== slug));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi başarısız!');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR');
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
    <div className="admin-news-list">
      <div className="admin-page-header">
        <div>
          <h1>Haber Yönetimi</h1>
          <p>Tüm haberleri görüntüleyin, düzenleyin veya silin</p>
        </div>
        <Link to="/admin/news/create" className="btn btn-primary">
          <FaPlus /> Yeni Haber Ekle
        </Link>
      </div>

      {news.length === 0 ? (
        <div className="empty-state">
          <h3>Henüz haber eklenmemiş</h3>
          <p>Yeni bir haber eklemek için yukarıdaki butona tıklayın.</p>
        </div>
      ) : (
        <div className="news-table-container">
          <table className="news-table">
            <thead>
              <tr>
                <th>Kapak</th>
                <th>Başlık</th>
                <th>Yazar</th>
                <th>Tarih</th>
                <th>Görüntülenme</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.coverImage ? (
                      <img 
                        src={`http://localhost:5000${item.coverImage}`} 
                        alt={item.title}
                        className="news-table-cover"
                      />
                    ) : (
                      <div className="news-table-no-image">
                        <FaEye />
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="news-table-title">
                      <span className="title">{item.title}</span>
                      <span className="slug">/{item.slug}</span>
                    </div>
                  </td>
                  <td>{item.author?.username || 'Admin'}</td>
                  <td>{formatDate(item.publishDate)}</td>
                  <td>
                    <span className="view-count">
                      <FaEye /> {item.viewCount || 0}
                    </span>
                  </td>
                  <td>
                    {item.isPinned && (
                      <span className="pinned-indicator">
                        <FaThumbtack /> Sabitlendi
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link 
                        to={`/admin/news/${item.slug}/edit`}
                        className="action-btn edit"
                        title="Düzenle"
                      >
                        <FaEdit />
                      </Link>
                      <button 
                        onClick={() => setDeleteConfirm(item.slug)}
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
            <h3>Haber Sil</h3>
            <p>Bu haberi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
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

export default AdminNewsList;