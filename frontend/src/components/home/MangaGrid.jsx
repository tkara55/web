import React from 'react';
import MangaCard from '../manga/MangaCard';
import './MangaGrid.css';

const MangaGrid = ({ manga = [], loading = false, title = "Son Çıkan Seriler" }) => {
  if (loading) {
    return (
      <section className="manga-grid-section">
        <div className="container">
          <h2 className="section-title">{title}</h2>
          <div className="loading">
            <div className="spinner"></div>
            <p>Mangalar yükleniyor...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!manga || manga.length === 0) {
    return (
      <section className="manga-grid-section">
        <div className="container">
          <h2 className="section-title">{title}</h2>
          <div className="no-manga">
            <p>Henüz manga bulunmuyor.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="manga-grid-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">
            Toplam {manga.length} manga bulundu
          </p>
        </div>

        <div className="manga-grid">
          {manga.map((item) => (
            <MangaCard key={item._id} manga={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MangaGrid;