import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaList, 
  FaSearchPlus, 
  FaSearchMinus,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import { mangaAPI } from '../utils/api';
import './ChapterReader.css';

const ChapterReader = () => {
  const { slug, chapterSlug } = useParams();
  const navigate = useNavigate();
  
  const [manga, setManga] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const readerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [slug, chapterSlug]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, chapter]);

  useEffect(() => {
    // Mouse hareketi ile kontrolleri göster
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (isFullscreen) {
          setShowControls(false);
        }
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isFullscreen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chapterRes, chaptersRes] = await Promise.all([
        mangaAPI.getChapter(slug, chapterSlug),
        mangaAPI.getChapters(slug)
      ]);
      
      const chapterData = chapterRes.data.data;
      setChapter(chapterData);
      setManga(chapterData.manga);
      setChapters(chaptersRes.data.data);
      setCurrentPage(0);
      setZoom(100);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentChapterIndex = () => {
    return chapters.findIndex(c => c.slug === chapterSlug);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (chapter && currentPage < chapter.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex > 0) {
      navigate(`/manga/${slug}/chapter/${chapters[currentIndex - 1].slug}`);
      window.scrollTo(0, 0);
    }
  };

  const handleNextChapter = () => {
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex < chapters.length - 1) {
      navigate(`/manga/${slug}/chapter/${chapters[currentIndex + 1].slug}`);
      window.scrollTo(0, 0);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="reader-loading">
        <div className="spinner"></div>
        <p>Bölüm yükleniyor...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="reader-error">
        <h2>Bölüm bulunamadı</h2>
        <Link to="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  const currentIndex = getCurrentChapterIndex();
  const hasPrev = currentPage > 0 || currentIndex > 0;
  const hasNext = currentPage < chapter.pages.length - 1 || currentIndex < chapters.length - 1;

  return (
    <div 
      className={`chapter-reader ${isFullscreen ? 'fullscreen' : ''}`}
      ref={readerRef}
    >
      {/* Header */}
      <div className={`reader-header ${showControls ? 'visible' : ''}`}>
        <div className="container">
          <div className="reader-nav">
            <Link to={`/manga/${slug}`} className="reader-back">
              <FaArrowLeft /> {manga?.title}
            </Link>
            
            <div className="reader-title">
              <span className="chapter-number">Bölüm {chapter.chapterNumber}</span>
              {chapter.title && (
                <span className="chapter-title-text">{chapter.title}</span>
              )}
            </div>

            <select 
              className="chapter-select"
              value={chapterSlug}
              onChange={(e) => {
                navigate(`/manga/${slug}/chapter/${e.target.value}`);
                setCurrentPage(0);
              }}
            >
              {chapters.map((ch) => (
                <option key={ch._id} value={ch.slug}>
                  Bölüm {ch.chapterNumber}
                  {ch.title ? ` - ${ch.title}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Page Display */}
      <div className="reader-page-container">
        {chapter.pages?.map((page, index) => (
          <div 
            key={index}
            className={`reader-page ${index === currentPage ? 'active' : ''}`}
            style={{
              display: index === currentPage ? 'flex' : 'none'
            }}
          >
            <img 
              src={`http://localhost:5000${page.imagePath}`}
              alt={`Sayfa ${page.pageNumber}`}
              style={{
                transform: `scale(${zoom / 100})`,
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        ))}
      </div>

      {/* Page Navigation Arrows */}
      {currentPage > 0 && (
        <button 
          className="page-arrow page-arrow-left"
          onClick={handlePrevPage}
        >
          <FaArrowLeft />
        </button>
      )}
      
      {currentPage < chapter.pages.length - 1 && (
        <button 
          className="page-arrow page-arrow-right"
          onClick={handleNextPage}
        >
          <FaArrowRight />
        </button>
      )}

      {/* Bottom Controls */}
      <div className={`reader-controls ${showControls ? 'visible' : ''}`}>
        <div className="container">
          {/* Progress Bar */}
          <div className="reader-progress">
            <div className="progress-info">
              <span>Sayfa {currentPage + 1} / {chapter.pages?.length || 0}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{
                  width: `${((currentPage + 1) / chapter.pages?.length) * 100}%`
                }}
              ></div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="reader-buttons">
            {/* Zoom Controls */}
            <div className="zoom-controls">
              <button 
                onClick={handleZoomOut}
                className="control-btn"
                disabled={zoom <= 50}
                title="Uzaklaştır"
              >
                <FaSearchMinus />
              </button>
              <button 
                onClick={handleResetZoom}
                className="control-btn zoom-display"
                title="Sıfırla"
              >
                {zoom}%
              </button>
              <button 
                onClick={handleZoomIn}
                className="control-btn"
                disabled={zoom >= 200}
                title="Yakınlaştır"
              >
                <FaSearchPlus />
              </button>
            </div>

            {/* Navigation */}
            <div className="nav-controls">
              <button
                onClick={() => {
                  if (currentPage === 0) {
                    handlePrevChapter();
                  } else {
                    handlePrevPage();
                  }
                }}
                disabled={!hasPrev}
                className="btn btn-secondary"
              >
                <FaArrowLeft /> {currentPage === 0 ? 'Önceki Bölüm' : 'Önceki Sayfa'}
              </button>

              <Link to={`/manga/${slug}`} className="btn btn-secondary">
                <FaList /> Bölümler
              </Link>

              <button
                onClick={() => {
                  if (currentPage === chapter.pages.length - 1) {
                    handleNextChapter();
                  } else {
                    handleNextPage();
                  }
                }}
                disabled={!hasNext}
                className="btn btn-primary"
              >
                {currentPage === chapter.pages.length - 1 ? 'Sonraki Bölüm' : 'Sonraki Sayfa'} <FaArrowRight />
              </button>
            </div>

            {/* Fullscreen */}
            <button 
              onClick={toggleFullscreen}
              className="control-btn fullscreen-btn"
              title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;