import React, { useState, useEffect } from 'react';
import HeroSlider from '../components/home/HeroSlider';
import CategoryFilter from '../components/home/CategoryFilter';
import MangaGrid from '../components/home/MangaGrid';
import { mangaAPI } from '../utils/api';
import './Home.css';

const Home = () => {
  const [featuredManga, setFeaturedManga] = useState([]);
  const [allManga, setAllManga] = useState([]);
  const [filteredManga, setFilteredManga] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManga();
  }, []);

  useEffect(() => {
    filterMangaByCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, allManga]);

  const fetchManga = async () => {
    try {
      setLoading(true);

      // Featured mangalar (slider için) - en popüler 5 manga
      const featuredResponse = await mangaAPI.getAll({ 
        sort: 'popular', 
        limit: 5 
      });
      
      // Her manga için bölüm sayısını al
      const featuredWithChapters = await Promise.all(
        featuredResponse.data.data.map(async (manga) => {
          try {
            const chaptersResponse = await mangaAPI.getChapters(manga.slug);
            return {
              ...manga,
              chapterCount: chaptersResponse.data.count || 0
            };
          } catch (error) {
            console.error(`Error fetching chapters for ${manga.slug}:`, error);
            return {
              ...manga,
              chapterCount: 0
            };
          }
        })
      );
      
      setFeaturedManga(featuredWithChapters);

      // Tüm mangalar
      const allResponse = await mangaAPI.getAll({ 
        sort: 'createdAt',
        limit: 24 
      });
      setAllManga(allResponse.data.data);
      setFilteredManga(allResponse.data.data);

    } catch (error) {
      console.error('Manga fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMangaByCategory = () => {
    if (activeCategory === 'all') {
      setFilteredManga(allManga);
    } else {
      const filtered = allManga.filter(manga => 
        manga.genres && manga.genres.includes(activeCategory)
      );
      setFilteredManga(filtered);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  return (
    <div className="home-page">
      {/* Hero Slider */}
      <HeroSlider manga={featuredManga} />

      {/* Main Content */}
      <div className="home-content">
        <div className="container">
          <CategoryFilter 
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
          
          <MangaGrid 
            manga={filteredManga}
            loading={loading}
            title={activeCategory === 'all' 
              ? 'Son Çıkan Seriler' 
              : `${activeCategory} Kategorisi`
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Home;