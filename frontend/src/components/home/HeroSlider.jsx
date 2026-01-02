import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import './HeroSlider.css';

const HeroSlider = ({ manga = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = useCallback(() => {
    if (isAnimating || manga.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % manga.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, manga.length]);

  const handlePrev = useCallback(() => {
    if (isAnimating || manga.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + manga.length) % manga.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, manga.length]);

  const handleDotClick = useCallback((index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, currentIndex]);

  // Otomatik kaydırma - 5 saniyede bir
  useEffect(() => {
    if (manga.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % manga.length);
    }, 5000); // 5 saniye

    return () => clearInterval(interval);
  }, [manga.length]);

  if (!manga || manga.length === 0) {
    return (
      <div className="hero-slider">
        <div className="hero-loading">
          <div className="spinner"></div>
          <p>Mangalar yükleniyor...</p>
        </div>
      </div>
    );
  }

  const currentManga = manga[currentIndex];

  return (
    <div className="hero-slider">
      <div className="hero-background" key={`bg-${currentIndex}`}>
        <img 
          src={`http://localhost:5000${currentManga.coverImage}`} 
          alt={currentManga.title}
          className="hero-bg-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />
        <div className="hero-overlay"></div>
      </div>

      <div className="container">
        <div className="hero-content" key={`content-${currentIndex}`}>
          {/* Sol taraf - Bilgiler */}
          <div className="hero-info">
            <div className="hero-chapter-badge">
              Bölüm: {currentManga.chapterCount || 0}
            </div>
            
            <h1 className="hero-title">{currentManga.title}</h1>
            
            <p className="hero-description">
              {currentManga.description?.substring(0, 200)}...
            </p>

            {/* Türler */}
            <div className="hero-genres">
              {currentManga.genres?.slice(0, 5).map((genre, idx) => (
                <span key={idx} className="genre-tag">{genre}</span>
              ))}
            </div>

            {/* Rating */}
            {currentManga.rating > 0 && (
              <div className="hero-rating">
                <FaStar className="star-icon" />
                <span>{currentManga.rating.toFixed(1)}</span>
              </div>
            )}

            {/* CTA Button */}
            <Link 
              to={`/manga/${currentManga.slug}`} 
              className="btn btn-yellow hero-cta"
            >
              Okumaya Başla →
            </Link>
          </div>

          {/* Sağ taraf - Kapak Resmi */}
          <div className="hero-image">
            <img 
              src={`http://localhost:5000${currentManga.coverImage}`} 
              alt={currentManga.title}
              className="manga-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        className="hero-arrow hero-arrow-left" 
        onClick={handlePrev}
        disabled={isAnimating}
      >
        <FaChevronLeft />
      </button>
      <button 
        className="hero-arrow hero-arrow-right" 
        onClick={handleNext}
        disabled={isAnimating}
      >
        <FaChevronRight />
      </button>

      {/* Dots Navigation */}
      <div className="hero-dots">
        {manga.map((_, index) => (
          <button
            key={index}
            className={`hero-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
            disabled={isAnimating}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;