import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaHome, FaNewspaper, FaUser, FaSignOutAlt, FaCog, FaSearch } from 'react-icons/fa';
import { authAPI, mangaAPI } from '../../utils/api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      // Önce local storage'ı temizle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setShowUserMenu(false);
      
      // Sonra backend'e logout isteği gönder (başarısız olsa bile sorun değil)
      try {
        await authAPI.logout();
      } catch (error) {
        // Logout hatası olsa bile kullanıcıyı çıkar
        console.log('Logout request failed, but user logged out locally');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Hata olsa bile kullanıcıyı ana sayfaya yönlendir
      navigate('/');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await mangaAPI.getAll({ search: query, limit: 5 });
      setSearchResults(response.data.data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSelect = (slug) => {
    navigate(`/manga/${slug}`);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-content container">
        <Link to="/" className="navbar-logo">
          <FaBook className="logo-icon" />
          <span>MangaSite</span>
        </Link>

        <ul className="navbar-links">
          <li>
            <Link to="/" className="nav-link">
              <FaHome />
              <span>Ana Sayfa</span>
            </Link>
          </li>
          <li>
            <Link to="/manga" className="nav-link">
              <FaBook />
              <span>Serilerimiz</span>
            </Link>
          </li>
          <li>
            <Link to="/news" className="nav-link">
              <FaNewspaper />
              <span>Duyurular</span>
            </Link>
          </li>
        </ul>

        <div className="navbar-search">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Manga ara..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="search-input"
            />
          </div>

          {showSearchResults && (
            <>
              <div 
                className="search-overlay"
                onClick={() => setShowSearchResults(false)}
              ></div>
              <div className="search-results">
                {searchLoading ? (
                  <div className="search-loading">Aranıyor...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((manga) => (
                    <button
                      key={manga._id}
                      onClick={() => handleSearchSelect(manga.slug)}
                      className="search-result-item"
                    >
                      <img 
                        src={`http://localhost:5000${manga.coverImage}`}
                        alt={manga.title}
                        className="search-result-cover"
                      />
                      <div className="search-result-info">
                        <span className="search-result-title">{manga.title}</span>
                        <span className="search-result-meta">
                          {manga.author} • {manga.genres?.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="search-no-results">Sonuç bulunamadı</div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <button 
                className="user-profile"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FaUser />
                <span>{user.username}</span>
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="user-menu-overlay"
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <span className="user-dropdown-name">{user.username}</span>
                      <span className="user-dropdown-email">{user.email}</span>
                      <span className={`user-role-badge ${user.role}`}>{user.role}</span>
                    </div>

                    <div className="user-dropdown-divider"></div>

                    {(user.role === 'admin' || user.role === 'moderator') && (
                      <>
                        <Link 
                          to="/admin" 
                          className="user-dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaCog />
                          <span>Admin Panel</span>
                        </Link>
                        <div className="user-dropdown-divider"></div>
                      </>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="user-dropdown-item logout"
                    >
                      <FaSignOutAlt />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary">
                Giriş Yap
              </Link>
              <Link to="/register" className="btn btn-primary">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;