import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import MangaCard from '../components/manga/MangaCard';
import { mangaAPI } from '../utils/api';
import './MangaList.css';

const MangaList = () => {
  const [manga, setManga] = useState([]);
  const [filteredManga, setFilteredManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  const genres = [
    'Tümü',
    'Aksiyon',
    'Macera',
    'Komedi',
    'Drama',
    'Fantastik',
    'Korku',
    'Romantik',
    'Bilim Kurgu',
    'Slice of Life',
    'Spor',
    'Gerilim'
  ];

  const statuses = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'Devam Ediyor', label: 'Devam Ediyor' },
    { value: 'Tamamlandı', label: 'Tamamlandı' },
    { value: 'Askıda', label: 'Askıda' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'En Yeni' },
    { value: 'popular', label: 'En Popüler' },
    { value: 'rating', label: 'En Yüksek Puan' },
    { value: 'title', label: 'A-Z' }
  ];

  useEffect(() => {
    fetchManga();
  }, []);

  useEffect(() => {
    filterAndSortManga();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manga, searchQuery, selectedGenre, selectedStatus, sortBy]);

  const fetchManga = async () => {
    try {
      setLoading(true);
      const response = await mangaAPI.getAll({ limit: 100 });
      setManga(response.data.data);
      setFilteredManga(response.data.data);
    } catch (error) {
      console.error('Manga fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortManga = () => {
    let filtered = [...manga];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Genre filter
    if (selectedGenre !== 'all' && selectedGenre !== 'Tümü') {
      filtered = filtered.filter(m =>
        m.genres && m.genres.includes(selectedGenre)
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(m => m.status === selectedStatus);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredManga(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="manga-list-page">
      <div className="container">
        {/* Header */}
        <div className="manga-list-header">
          <div>
            <h1>Tüm Serilerimiz</h1>
            <p>{filteredManga.length} manga bulundu</p>
          </div>
        </div>

        {/* Filters */}
        <div className="manga-filters">
          {/* Search Bar */}
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Manga ara..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          {/* Filter Controls */}
          <div className="filter-controls">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="filter-select"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="filter-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Genre Tags */}
        <div className="genre-filter">
          {genres.map((genre) => (
            <button
              key={genre}
              className={`genre-tag ${
                selectedGenre === genre || (genre === 'Tümü' && selectedGenre === 'all')
                  ? 'active'
                  : ''
              }`}
              onClick={() => handleGenreChange(genre === 'Tümü' ? 'all' : genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Manga Grid */}
        {loading ? (
          <div className="manga-list-loading">
            <div className="spinner"></div>
            <p>Mangalar yükleniyor...</p>
          </div>
        ) : filteredManga.length === 0 ? (
          <div className="manga-list-empty">
            <h3>Manga bulunamadı</h3>
            <p>Arama kriterlerinize uygun manga bulunamadı.</p>
          </div>
        ) : (
          <div className="manga-grid">
            {filteredManga.map((item) => (
              <MangaCard key={item._id} manga={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MangaList;