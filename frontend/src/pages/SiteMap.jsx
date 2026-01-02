import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaBook, 
  FaNewspaper, 
  FaImages, 
  FaUser, 
  FaInfoCircle,
  FaChevronRight 
} from 'react-icons/fa';
import { mangaAPI, newsAPI } from '../utils/api';
import './SiteMap.css';

const SiteMap = () => {
  const [manga, setManga] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mangaRes, newsRes] = await Promise.all([
        mangaAPI.getAll({ limit: 50 }),
        newsAPI.getAll({ limit: 20 })
      ]);
      
      setManga(mangaRes.data.data);
      setNews(newsRes.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      icon: <FaHome />,
      title: 'Ana Sayfa',
      links: [
        { to: '/', label: 'Ana Sayfa' }
      ]
    },
    {
      icon: <FaBook />,
      title: 'Manga',
      links: [
        { to: '/', label: 'Tüm Mangalar' },
        ...manga.map(m => ({
          to: `/manga/${m.slug}`,
          label: m.title
        }))
      ]
    },
    {
      icon: <FaNewspaper />,
      title: 'Haberler',
      links: [
        { to: '/news', label: 'Tüm Haberler' },
        ...news.map(n => ({
          to: `/news/${n.slug}`,
          label: n.title
        }))
      ]
    },
    {
      icon: <FaImages />,
      title: 'Galeri',
      links: [
        { to: '/gallery', label: 'Resim Galerisi' }
      ]
    },
    {
      icon: <FaUser />,
      title: 'Kullanıcı',
      links: [
        { to: '/login', label: 'Giriş Yap' },
        { to: '/register', label: 'Kayıt Ol' }
      ]
    },
    {
      icon: <FaInfoCircle />,
      title: 'Diğer',
      links: [
        { to: '/sitemap', label: 'Site Haritası' }
      ]
    }
  ];

  return (
    <div className="sitemap-page">
      <div className="container">
        <div className="sitemap-header">
          <h1>Site Haritası</h1>
          <p>Sitemizdeki tüm sayfaları buradan görüntüleyebilirsiniz</p>
        </div>

        {loading ? (
          <div className="sitemap-loading">
            <div className="spinner"></div>
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="sitemap-grid">
            {sections.map((section, index) => (
              <div key={index} className="sitemap-section">
                <div className="sitemap-section-header">
                  <span className="sitemap-icon">{section.icon}</span>
                  <h2>{section.title}</h2>
                </div>
                
                <ul className="sitemap-links">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link to={link.to} className="sitemap-link">
                        <FaChevronRight />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="sitemap-footer">
          <p>Toplam {manga.length} manga, {news.length} haber bulunmaktadır.</p>
        </div>
      </div>
    </div>
  );
};

export default SiteMap;