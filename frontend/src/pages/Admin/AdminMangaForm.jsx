import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaImage } from 'react-icons/fa';
import { mangaAPI } from '../../utils/api';
import './AdminManga.css';

const AdminMangaForm = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEdit = !!slug;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    artist: '',
    releaseYear: new Date().getFullYear(),
    status: 'Devam Ediyor',
    genres: []
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const genreOptions = [
    'Aksiyon', 'Macera', 'Komedi', 'Drama', 'Fantastik', 
    'Korku', 'Romantik', 'Bilim Kurgu', 'Slice of Life', 
    'Spor', 'Gerilim'
  ];

  const statusOptions = ['Devam Ediyor', 'Tamamlandı', 'Askıda'];

  useEffect(() => {
    if (isEdit) {
      fetchManga();
    }
  }, [slug]);

  const fetchManga = async () => {
    try {
      setLoading(true);
      const response = await mangaAPI.getBySlug(slug);
      const manga = response.data.data;
      
      setFormData({
        title: manga.title,
        description: manga.description,
        author: manga.author,
        artist: manga.artist || '',
        releaseYear: manga.releaseYear || new Date().getFullYear(),
        status: manga.status,
        genres: manga.genres || []
      });
      
      setCoverPreview(`http://localhost:5000${manga.coverImage}`);
    } catch (error) {
      console.error('Manga fetch error:', error);
      alert('Manga yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
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
    
    if (!formData.title || !formData.description || !formData.author) {
      alert('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    if (!isEdit && !coverImage) {
      alert('Lütfen bir kapak resmi seçin!');
      return;
    }

    try {
      setSubmitLoading(true);
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'genres') {
          // Her genre'yi ayrı ayrı ekle
          formData[key].forEach(genre => {
            submitData.append('genres[]', genre);
          });
        } else {
          submitData.append(key, formData[key]);
        }
      });

      if (coverImage) {
        submitData.append('coverImage', coverImage);
      }

      if (isEdit) {
        await mangaAPI.update(slug, submitData);
        alert('Manga başarıyla güncellendi!');
      } else {
        await mangaAPI.create(submitData);
        alert('Manga başarıyla eklendi!');
      }

      navigate('/admin/manga');
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
    <div className="admin-manga-form">
      <div className="admin-page-header">
        <div>
          <h1>{isEdit ? 'Manga Düzenle' : 'Yeni Manga Ekle'}</h1>
          <p>{isEdit ? 'Manga bilgilerini güncelleyin' : 'Yeni bir manga ekleyin'}</p>
        </div>
        <button onClick={() => navigate('/admin/manga')} className="btn btn-secondary">
          <FaArrowLeft /> Geri
        </button>
      </div>

      <form onSubmit={handleSubmit} className="manga-form">
        <div className="form-grid">
          {/* Cover Image */}
          <div className="form-section cover-section">
            <label className="form-label">Kapak Resmi *</label>
            <div className="cover-upload">
              {coverPreview ? (
                <img src={coverPreview} alt="Preview" className="cover-preview" />
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
                id="coverImage"
              />
              <label htmlFor="coverImage" className="btn btn-secondary btn-sm">
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
                placeholder="Tokyo Ghoul"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Açıklama *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows="4"
                placeholder="Manga hakkında kısa bir açıklama..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Yazar *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Sui Ishida"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Çizer</label>
                <input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Sui Ishida"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Yayın Yılı</label>
                <input
                  type="number"
                  name="releaseYear"
                  value={formData.releaseYear}
                  onChange={handleInputChange}
                  className="form-input"
                  min="1900"
                  max={new Date().getFullYear() + 5}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Durum *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Türler</label>
              <div className="genre-grid">
                {genreOptions.map(genre => (
                  <label key={genre} className="genre-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.genres.includes(genre)}
                      onChange={() => handleGenreToggle(genre)}
                    />
                    <span>{genre}</span>
                  </label>
                ))}
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

export default AdminMangaForm;