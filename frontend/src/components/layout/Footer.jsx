import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <FaBook />
              <span>MangaSite</span>
            </div>
            <p className="footer-description">
              En sevdiğiniz mangaları okuyun ve yeni seriler keşfedin.
            </p>
            
            {/* Social */}
            <div className="footer-social">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
                <FaDiscord />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-section">
            <h3 className="footer-section-title">Keşfet</h3>
            <div className="footer-links">
              <Link to="/">Ana Sayfa</Link>
              <Link to="/manga">Serilerimiz</Link>
              <Link to="/news">Duyurular</Link>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-section-title">Bilgi</h3>
            <div className="footer-links">
              <Link to="/sitemap">Site Haritası</Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="footer-disclaimer">
          <p>
            Bu web sitesindeki tüm çizgi romanlar yalnızca orijinal çizgi romanların önizlemeleridir, 
            birçok dil hatası, karakter adı ve hikaye satırı olabilir. Orijinal versiyon için, 
            şehrinizde mevcutsa lütfen çizgi romanı satın alın.
          </p>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© {currentYear} MangaSite. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;