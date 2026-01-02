import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaArrowLeft } from 'react-icons/fa';
import { mangaAPI } from '../../utils/api';
import './AdminChapter.css';

const AdminChapterList = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      const [mangaRes, chaptersRes] = await Promise.all([
        mangaAPI.getBySlug(slug),
        mangaAPI.getChapters(slug)
      ]);
      
      setManga(mangaRes.data.data);
      setChapters(chaptersRes.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chapterSlug) => {
    try {
      await mangaAPI.deleteChapter(slug, chapterSlug);
      setChapters(chapters.filter(c => c.slug !== chapterSlug));
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
    <div className="admin-chapter-list">
      <div className="admin-page-header">
        <div>
          <button onClick={() => navigate('/admin/manga')} className="back-link">
            <FaArrowLeft /> Manga Listesi
          </button>
          <h1>{manga?.title} - Bölümler</h1>
          <p>Bölümleri görüntüleyin, düzenleyin veya yeni bölüm ekleyin</p>
        </div>
        <Link to={`/admin/manga/${slug}/chapters/create`} className="btn btn-primary">
          <FaPlus /> Yeni Bölüm Ekle
        </Link>
      </div>

      {chapters.length === 0 ? (
        <div className="empty-state">
          <h3>Henüz bölüm eklenmemiş</h3>
          <p>Bu manga için yeni bir bölüm eklemek için yukarıdaki butona tıklayın.</p>
        </div>
      ) : (
        <div className="chapter-table-container">
          <table className="chapter-table">
            <thead>
              <tr>
                <th>Bölüm No</th>
                <th>Başlık</th>
                <th>Sayfa Sayısı</th>
                <th>Görüntülenme</th>
                <th>Tarih</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter) => (
                <tr key={chapter._id}>
                  <td>
                    <span className="chapter-number">Bölüm {chapter.chapterNumber}</span>
                  </td>
                  <td>
                    <div className="chapter-title-cell">
                      <span className="title">{chapter.title || '-'}</span>
                      <span className="slug">/{chapter.slug}</span>
                    </div>
                  </td>
                  <td>{chapter.pages?.length || 0} sayfa</td>
                  <td>
                    <span className="view-count">
                      <FaEye /> {chapter.viewCount || 0}
                    </span>
                  </td>
                  <td>
                    {new Date(chapter.publishDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link 
                        to={`/admin/manga/${slug}/chapters/${chapter.slug}/edit`}
                        className="action-btn edit"
                        title="Düzenle"
                      >
                        <FaEdit />
                      </Link>
                      <button 
                        onClick={() => setDeleteConfirm(chapter.slug)}
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
            <h3>Bölüm Sil</h3>
            <p>Bu bölümü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
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

export default AdminChapterList;