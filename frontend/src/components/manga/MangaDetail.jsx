import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaBook, FaEye, FaClock, FaUser } from 'react-icons/fa';
import { mangaAPI } from '../../utils/api';
import './MangaDetail.css';

const MangaDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMangaDetail();
    fetchChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchMangaDetail = async () => {
    try {
      const response = await mangaAPI.getBySlug(slug);
      setManga(response.data.data);
    } catch (error) {
      console.error('Manga detay hatası:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await mangaAPI.getChapters(slug);
      setChapters(response.data.data);
    } catch (error) {
      console.error('Bölümler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterClick = (chapterSlug) => {
    navigate(`/manga/${slug}/chapter/${chapterSlug}`);
  };

  if (loading) {
    return (
      <div className="manga-detail-loading">
        <div className="spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="manga-detail-error">
        <h2>Manga bulunamadı</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="manga-detail-page">
      {/* Hero Section */}
      <div className="manga-detail-hero">
        <div className="manga-detail-bg">
          <img 
            src={`http://localhost:5000${manga.coverImage}`} 
            alt={manga.title}
          />
          <div className="manga-detail-overlay"></div>
        </div>

        <div className="container">
          <div className="manga-detail-header">
            {/* Cover */}
            <div className="manga-detail-cover">
              <img 
                src={`http://localhost:5000${manga.coverImage}`} 
                alt={manga.title}
              />
            </div>

            {/* Info */}
            <div className="manga-detail-info">
              <h1 className="manga-detail-title">{manga.title}</h1>
              
              <div className="manga-detail-meta">
                {manga.rating > 0 && (
                  <div className="manga-meta-item">
                    <FaStar />
                    <span>{manga.rating.toFixed(1)}</span>
                  </div>
                )}
                
                <div className="manga-meta-item">
                  <FaBook />
                  <span>{chapters.length} Bölüm</span>
                </div>

                <div className="manga-meta-item">
                  <FaEye />
                  <span>{manga.viewCount || 0} Görüntülenme</span>
                </div>

                <div className="manga-meta-item">
                  <FaClock />
                  <span className={`status status-${manga.status.toLowerCase().replace(' ', '-')}`}>
                    {manga.status}
                  </span>
                </div>
              </div>

              {/* Genres */}
              <div className="manga-detail-genres">
                {manga.genres?.map((genre, idx) => (
                  <span key={idx} className="genre-badge">{genre}</span>
                ))}
              </div>

              {/* Description */}
              <p className="manga-detail-description">{manga.description}</p>

              {/* Author/Artist */}
              <div className="manga-detail-credits">
                <div className="credit-item">
                  <FaUser />
                  <div>
                    <span className="credit-label">Yazar:</span>
                    <span className="credit-value">{manga.author}</span>
                  </div>
                </div>
                {manga.artist && (
                  <div className="credit-item">
                    <FaUser />
                    <div>
                      <span className="credit-label">Çizer:</span>
                      <span className="credit-value">{manga.artist}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Read Button */}
              {chapters.length > 0 && (
                <button 
                  className="btn btn-primary btn-lg manga-read-btn"
                  onClick={() => handleChapterClick(chapters[0].slug)}
                >
                  Okumaya Başla
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="manga-chapters-section">
        <div className="container">
          <h2 className="section-title">Bölümler</h2>
          
          {chapters.length === 0 ? (
            <div className="no-chapters">
              <p>Henüz bölüm eklenmemiş.</p>
            </div>
          ) : (
            <div className="chapters-list">
              {chapters.map((chapter) => (
                <div 
                  key={chapter._id} 
                  className="chapter-item"
                  onClick={() => handleChapterClick(chapter.slug)}
                >
                  <div className="chapter-info">
                    <span className="chapter-number">Bölüm {chapter.chapterNumber}</span>
                    {chapter.title && (
                      <span className="chapter-title">{chapter.title}</span>
                    )}
                  </div>
                  
                  <div className="chapter-meta">
                    <span className="chapter-date">
                      {new Date(chapter.publishDate).toLocaleDateString('tr-TR')}
                    </span>
                    <span className="chapter-views">
                      <FaEye /> {chapter.viewCount || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;