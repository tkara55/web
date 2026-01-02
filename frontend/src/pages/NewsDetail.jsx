import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCalendar, FaEye, FaUser, FaArrowLeft } from 'react-icons/fa';
import { newsAPI } from '../utils/api';
import './NewsDetail.css';

const NewsDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      const response = await newsAPI.getBySlug(slug);
      setNews(response.data.data);
      
      // İlgili haberleri getir
      const relatedResponse = await newsAPI.getAll({ limit: 3 });
      setRelatedNews(relatedResponse.data.data.filter(n => n.slug !== slug).slice(0, 3));
    } catch (error) {
      console.error('News detail fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsDetail();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="news-detail-loading">
        <div className="spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="news-detail-error">
        <h2>Haber bulunamadı</h2>
        <Link to="/news" className="btn btn-primary">Haberlere Dön</Link>
      </div>
    );
  }

  return (
    <div className="news-detail-page">
      <div className="container">
        {/* Back Button */}
        <button onClick={() => navigate('/news')} className="back-btn">
          <FaArrowLeft /> Haberlere Dön
        </button>

        {/* News Article */}
        <article className="news-detail-article">
          {/* Title */}
          <h1 className="news-detail-title">{news.title}</h1>

          {/* Meta Info */}
          <div className="news-detail-meta">
            <span className="meta-item">
              <FaUser /> {news.author?.username || 'Admin'}
            </span>
            <span className="meta-item">
              <FaCalendar /> {formatDate(news.publishDate)}
            </span>
            <span className="meta-item">
              <FaEye /> {news.viewCount || 0} görüntülenme
            </span>
          </div>

          {/* Cover Image */}
          {news.coverImage && (
            <div className="news-detail-cover">
              <img 
                src={`http://localhost:5000${news.coverImage}`} 
                alt={news.title}
              />
            </div>
          )}

          {/* Content */}
          <div className="news-detail-content">
            {news.content.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </article>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="related-news-section">
            <h2 className="section-title">İlgili Haberler</h2>
            <div className="related-news-grid">
              {relatedNews.map((item) => (
                <Link 
                  key={item._id} 
                  to={`/news/${item.slug}`}
                  className="related-news-card"
                >
                  {item.coverImage && (
                    <div className="related-news-image">
                      <img 
                        src={`http://localhost:5000${item.coverImage}`} 
                        alt={item.title}
                      />
                    </div>
                  )}
                  <div className="related-news-content">
                    <h3>{item.title}</h3>
                    <p className="related-news-date">
                      <FaCalendar /> {formatDate(item.publishDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;