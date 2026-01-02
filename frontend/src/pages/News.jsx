import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaEye, FaUser, FaThumbtack } from 'react-icons/fa';
import { newsAPI } from '../utils/api';
import './News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'Duyuru', name: 'Duyuru' },
    { id: 'Haber', name: 'Haber' },
    { id: 'Güncelleme', name: 'Güncelleme' },
    { id: 'Etkinlik', name: 'Etkinlik' },
    { id: 'Genel', name: 'Genel' }
  ];

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsAPI.getAll({ limit: 50 });
      setNews(response.data.data);
    } catch (error) {
      console.error('News fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="news-page">
      <div className="container">
        {/* Header */}
        <div className="news-header">
          <h1>Haberler & Duyurular</h1>
          <p>Sitemizdeki en son haberler ve duyurular</p>
        </div>

        {/* Category Filter */}
        <div className="news-categories">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="news-loading">
            <div className="spinner"></div>
            <p>Haberler yükleniyor...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="news-empty">
            <h3>Haber bulunamadı</h3>
            <p>Bu kategoride henüz haber bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="news-grid">
            {news.map((item) => (
              <article key={item._id} className={`news-card ${item.isPinned ? 'pinned' : ''}`}>
                {item.isPinned && (
                  <div className="pinned-badge">
                    <FaThumbtack /> Sabitlendi
                  </div>
                )}

                {item.coverImage && (
                  <Link to={`/news/${item.slug}`} className="news-card-image">
                    <img 
                      src={`http://localhost:5000${item.coverImage}`} 
                      alt={item.title}
                    />
                  </Link>
                )}

                <div className="news-card-content">
                  <span className={`news-category category-${item.category.toLowerCase()}`}>
                    {item.category}
                  </span>

                  <Link to={`/news/${item.slug}`}>
                    <h2 className="news-card-title">{item.title}</h2>
                  </Link>

                  <p className="news-card-summary">
                    {item.summary || item.content.substring(0, 150)}...
                  </p>

                  <div className="news-card-footer">
                    <div className="news-meta">
                      <span className="news-author">
                        <FaUser /> {item.author?.username || 'Admin'}
                      </span>
                      <span className="news-date">
                        <FaCalendar /> {formatDate(item.publishDate)}
                      </span>
                      <span className="news-views">
                        <FaEye /> {item.viewCount || 0}
                      </span>
                    </div>

                    <Link to={`/news/${item.slug}`} className="read-more-btn">
                      Devamını Oku →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;