import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBook } from 'react-icons/fa';
import { mangaAPI } from '../../utils/api';
import './AdminManga.css';

const AdminMangaList = () => {
  const [manga, setManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchManga();
  }, []);

  const fetchManga = async () => {
    try {
      const response = await mangaAPI.getAll({ limit: 100 });
      setManga(response.data.data);
    } catch (error) {
      console.error('Manga fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    try {
      await mangaAPI.delete(slug);
      setManga(manga.filter(m => m.slug !== slug));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi başarısız!');
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
    <div className="admin-manga-list">
      <div className="admin-page-header">
        <div>
          <h1>Manga Yönetimi</h1>
          <p>Tüm mangaları görüntüleyin, düzenleyin veya silin</p>
        </div>
        <Link to="/admin/manga/create" className="btn btn-primary">
          <FaPlus /> Yeni Manga Ekle
        </Link>
      </div>

      {manga.length === 0 ? (
        <div className="empty-state">
          <FaBook />
          <h3>Henüz manga eklenmemiş</h3>
          <p>Yeni bir manga eklemek için yukarıdaki butona tıklayın.</p>
        </div>
      ) : (
        <div className="manga-table-container">
          <table className="manga-table">
            <thead>
              <tr>
                <th>Kapak</th>
                <th>Başlık</th>
                <th>Yazar</th>
                <th>Durum</th>
                <th>Bölümler</th>
                <th>Görüntülenme</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {manga.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img 
                      src={`http://localhost:5000${item.coverImage}`} 
                      alt={item.title}
                      className="manga-table-cover"
                    />
                  </td>
                  <td>
                    <div className="manga-table-title">
                      <span className="title">{item.title}</span>
                      <span className="slug">/{item.slug}</span>
                    </div>
                  </td>
                  <td>{item.author}</td>
                  <td>
                    <span className={`status-badge status-${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/manga/${item.slug}/chapters`} className="chapter-link">
                      <FaBook /> {item.chapterCount || 0}
                    </Link>
                  </td>
                  <td>
                    <span className="view-count">
                      <FaEye /> {item.viewCount || 0}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link 
                        to={`/admin/manga/${item.slug}/edit`}
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
            <h3>Manga Sil</h3>
            <p>Bu mangayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm bölümler de silinecektir.</p>
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

export default AdminMangaList;