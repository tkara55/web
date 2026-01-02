import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaHome, FaList } from 'react-icons/fa';
import { mangaAPI } from '../utils/api';
import './ChapterReader.css';

const ChapterReader = () => {
  const { slug, chapterSlug } = useParams();
  const navigate = useNavigate();
  
  const [manga, setManga] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug, chapterSlug]);

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
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentChapterIndex = () => {
    return chapters.findIndex(c => c.slug === chapterSlug);
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
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < chapters.length - 1;

  return (
    <div className="chapter-reader">
      {/* Header */}
      <div className="reader-header">
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
              onChange={(e) => navigate(`/manga/${slug}/chapter/${e.target.value}`)}
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

      {/* Pages */}
      <div className="reader-pages">
        {chapter.pages?.map((page, index) => (
          <div key={index} className="reader-page">
            <img 
              src={`http://localhost:5000${page.imagePath}`}
              alt={`Sayfa ${page.pageNumber}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="reader-footer">
        <div className="container">
          <div className="reader-controls">
            <button
              onClick={handlePrevChapter}
              disabled={!hasPrev}
              className="btn btn-secondary"
            >
              <FaArrowLeft /> Önceki Bölüm
            </button>

            <Link to={`/manga/${slug}`} className="btn btn-secondary">
              <FaList /> Bölümler
            </Link>

            <button
              onClick={handleNextChapter}
              disabled={!hasNext}
              className="btn btn-primary"
            >
              Sonraki Bölüm <FaArrowRight />
            </button>
          </div>

          {hasNext && (
            <div className="next-chapter-info">
              <span>Sonraki:</span>
              <strong>
                Bölüm {chapters[currentIndex + 1].chapterNumber}
                {chapters[currentIndex + 1].title && ` - ${chapters[currentIndex + 1].title}`}
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;