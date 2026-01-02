import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaEye, FaBook } from 'react-icons/fa';
import './MangaCard.css';

const MangaCard = ({ manga }) => {
  return (
    <Link to={`/manga/${manga.slug}`} className="manga-card">
      {/* Kapak Resmi */}
      <div className="manga-card-image">
        <img 
          src={`http://localhost:5000${manga.coverImage}`} 
          alt={manga.title}
        />
        <div className="manga-card-overlay">
          <button className="quick-read-btn">Hemen Oku</button>
        </div>
        
        {/* Status Badge */}
        <div className={`status-badge ${manga.status.toLowerCase().replace(' ', '-')}`}>
          {manga.status}
        </div>
      </div>

      {/* Manga Bilgileri */}
      <div className="manga-card-content">
        <h3 className="manga-card-title">{manga.title}</h3>
        
        {/* Bölüm Sayısı */}
        {manga.chapterCount > 0 && (
          <div className="manga-card-info">
            <FaBook className="info-icon" />
            <span>Bölüm {manga.chapterCount}</span>
          </div>
        )}

        {/* Alt Bilgiler */}
        <div className="manga-card-footer">
          {/* Rating */}
          {manga.rating > 0 && (
            <div className="manga-rating">
              <FaStar className="star-icon" />
              <span>{manga.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Görüntülenme */}
          <div className="manga-views">
            <FaEye className="view-icon" />
            <span>{manga.viewCount >= 1000 
              ? `${(manga.viewCount / 1000).toFixed(1)}K` 
              : manga.viewCount}
            </span>
          </div>
        </div>

        {/* İlk Tür */}
        {manga.genres && manga.genres.length > 0 && (
          <div className="manga-genre-tag">
            {manga.genres[0]}
          </div>
        )}
      </div>
    </Link>
  );
};

export default MangaCard;