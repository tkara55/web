import React from 'react';
import './CategoryFilter.css';

const categories = [
  { id: 'all', name: 'Tüm Seriler', icon: '📚' },
  { id: 'Aksiyon', name: 'Aksiyon', icon: '⚔️' },
  { id: 'Aşın Güçlü', name: 'Aşırı Güçlü', icon: '💪' },
  { id: 'Bilim Kurgu', name: 'Bilim Kurgu', icon: '🚀' },
  { id: 'Büyü', name: 'Büyü', icon: '🔮' },
  { id: 'Canavar', name: 'Canavar', icon: '👹' },
  { id: 'Dahi Mc', name: 'Dahi Mc', icon: '🧠' },
  { id: 'Dedektif', name: 'Dedektif', icon: '🔍' },
  { id: 'Doğaüstü', name: 'Doğaüstü', icon: '👻' },
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