import React from 'react';
import './CategoryFilter.css';

const categories = [
  { id: 'all', name: 'Tüm Seriler',},
  { id: 'Aksiyon', name: 'Aksiyon',},
  { id: 'Macera', name: 'Macera',},
  { id: 'Komedi', name: 'Komedi',},
  { id: 'Drama', name: 'Drama',},
  { id: 'Fantastik', name: 'Fantastik',},
  { id: 'Korku', name: 'Korku',},
  { id: 'Romantik', name: 'Romantik',},
  { id: 'Bilim Kurgu', name: 'Bilim Kurgu',},
  { id: 'Slice of Life', name: 'Slice of Life',},
  { id: 'Spor', name: 'Spor',},
  { id: 'Gerilim', name: 'Gerilim',}
];

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  return (
    <section className="category-filter">
      <div className="container">
        <h2 className="section-title">Bugün Popüler</h2>
        
        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;