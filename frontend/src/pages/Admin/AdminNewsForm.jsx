import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaImage } from 'react-icons/fa';
import { newsAPI } from '../../utils/api';
import './AdminNews.css';

const AdminNewsForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEdit = !!slug;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    isPinned: false,
    isPublished: true
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsAPI.getBySlug(slug);
      const newsData = response.data.data;
      
      setFormData({
        title: newsData.title,
        content: newsData.content,
        summary: newsData.summary || '',
        isPinned: newsData.isPinned,
        isPublished: newsData.isPublished
      });
      
      if (newsData.coverImage) {
        setCoverPreview(`http://localhost:5000${newsData.coverImage}`);
      }
    } catch (error) {
      console.error('News fetch error:', error);
      alert('Haber yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchNews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      alert('Lütfen başlık ve içerik alanlarını doldurun!');
      return;
    }

    try {
      setSubmitLoading(true);
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      if (coverImage) {
        submitData.append('newsImage', coverImage);
      }

      if (isEdit) {
        await newsAPI.update(slug, submitData);
        alert('Haber başarıyla güncellendi!');
      } else {
        await newsAPI.create(submitData);
        alert('Haber başarıyla eklendi!');
      }

      navigate('/admin/news');
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
    <div className="admin-news-form">
      <div className="admin-page-header">
        <div>
          <h1>{isEdit ? 'Haber Düzenle' : 'Yeni Haber Ekle'}</h1>
          <p>{isEdit ? 'Haber bilgilerini güncelleyin' : 'Yeni bir haber ekleyin'}</p>
        </div>
        <button onClick={() => navigate('/admin/news')} className="btn btn-secondary">
          <FaArrowLeft /> Geri
        </button>
      </div>

      <form onSubmit={handleSubmit} className="news-form">
        <div className="form-grid">
          {/* Cover Image */}
          <div className="form-section cover-section">
            <label className="form-label">Kapak Resmi</label>
            <div className="cover-upload">
              {coverPreview ? (
                <div className="cover-preview">
                  <img src={coverPreview} alt="Preview" />
                </div>
              ) : (
                <div className="cover-placeholder">
                  <FaImage />
                  <span>Kapak Resmi</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
                id="newsImage"
              />
              <label htmlFor="newsImage" className="btn btn-secondary btn-sm">
                {coverPreview ? 'Resmi Değiştir' : 'Resim Seç'}
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Başlık *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Haber başlığı"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Özet</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                className="form-textarea"
                rows="2"
                placeholder="Kısa özet (opsiyonel)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">İçerik *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="form-textarea"
                rows="12"
                placeholder="Haber içeriği..."
                required
              />
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="isPinned"
                  name="isPinned"
                  checked={formData.isPinned}
                  onChange={handleInputChange}
                />
                <label htmlFor="isPinned">Üstte sabitle</label>
              </div>
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
        </div>
      </form>
    </div>
  );
};

export default AdminNewsForm;