import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaImages, FaTimes } from 'react-icons/fa';
import { mangaAPI } from '../../utils/api';
import './AdminChapter.css';

const AdminChapterForm = () => {
  const { slug, chapterSlug } = useParams();
  const navigate = useNavigate();
  const isEdit = !!chapterSlug;

  const [manga, setManga] = useState(null);
  const [formData, setFormData] = useState({
    chapterNumber: '',
    title: ''
  });
  const [pages, setPages] = useState([]);
  const [pagePreviews, setPagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchManga();
    if (isEdit) {
      fetchChapter();
    }
  }, [slug, chapterSlug]);

  const fetchManga = async () => {
    try {
      const response = await mangaAPI.getBySlug(slug);
      setManga(response.data.data);
    } catch (error) {
      console.error('Manga fetch error:', error);
    }
  };

  const fetchChapter = async () => {
    try {
      setLoading(true);
      const response = await mangaAPI.getChapter(slug, chapterSlug);
      const chapter = response.data.data;
      
      setFormData({
        chapterNumber: chapter.chapterNumber,
        title: chapter.title || ''
      });
      
      // Mevcut sayfa önizlemelerini göster
      if (chapter.pages) {
        const previews = chapter.pages.map(page => 
          `http://localhost:5000${page.imagePath}`
        );
        setPagePreviews(previews);
      }
    } catch (error) {
      console.error('Chapter fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePagesChange = (e) => {
    const files = Array.from(e.target.files);
    setPages(files);
    
    // Önizlemeleri oluştur
    const previews = files.map(file => URL.createObjectURL(file));
    setPagePreviews(previews);
  };

  const removePagePreview = (index) => {
    const newPages = pages.filter((_, i) => i !== index);
    const newPreviews = pagePreviews.filter((_, i) => i !== index);
    setPages(newPages);
    setPagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.chapterNumber) {
      alert('Lütfen bölüm numarasını girin!');
      return;
    }

    if (!isEdit && pages.length === 0) {
      alert('Lütfen en az bir sayfa seçin!');
      return;
    }

    try {
      setSubmitLoading(true);
      const submitData = new FormData();
      
      submitData.append('chapterNumber', formData.chapterNumber);
      if (formData.title) {
        submitData.append('title', formData.title);
      }

      // Sayfaları ekle
      pages.forEach((page) => {
        submitData.append('pages', page);
      });

      if (isEdit) {
        await mangaAPI.updateChapter(slug, chapterSlug, submitData);
        alert('Bölüm başarıyla güncellendi!');
      } else {
        await mangaAPI.createChapter(slug, submitData);
        alert('Bölüm başarıyla eklendi!');
      }

      navigate(`/admin/manga/${slug}/chapters`);
    } catch (error) {
      console.error('Submit error:', error);
      alert('İşlem başarısız: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitLoading(false);
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
    <div className="admin-chapter-form">
      <div className="admin-page-header">
        <div>
          <button 
            onClick={() => navigate(`/admin/manga/${slug}/chapters`)} 
            className="back-link"
          >
            <FaArrowLeft /> {manga?.title}
          </button>
          <h1>{isEdit ? 'Bölüm Düzenle' : 'Yeni Bölüm Ekle'}</h1>
          <p>{isEdit ? 'Bölüm bilgilerini güncelleyin' : 'Yeni bir bölüm ekleyin'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="chapter-form">
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bölüm Numarası *</label>
              <input
                type="number"
                name="chapterNumber"
                value={formData.chapterNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="1"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bölüm Başlığı (Opsiyonel)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Başlangıç"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FaImages /> Manga Sayfaları {!isEdit && '*'}
            </label>
            <div className="pages-upload">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePagesChange}
                className="file-input"
                id="pages"
              />
              <label htmlFor="pages" className="btn btn-secondary">
                {pagePreviews.length > 0 ? 'Sayfaları Değiştir' : 'Sayfaları Seç'}
              </label>
              <span className="upload-hint">
                {pagePreviews.length > 0 
                  ? `${pagePreviews.length} sayfa seçildi` 
                  : 'Birden fazla resim seçebilirsiniz'}
              </span>
            </div>

            {/* Page Previews */}
            {pagePreviews.length > 0 && (
              <div className="page-previews">
                {pagePreviews.map((preview, index) => (
                  <div key={index} className="page-preview-item">
                    <img src={preview} alt={`Sayfa ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removePagePreview(index)}
                      className="remove-page-btn"
                    >
                      <FaTimes />
                    </button>
                    <span className="page-number">Sayfa {index + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            disabled={submitLoading}
          >
            {submitLoading ? 'Kaydediliyor...' : (
              <>
                <FaSave /> {isEdit ? 'Güncelle' : 'Kaydet'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminChapterForm;