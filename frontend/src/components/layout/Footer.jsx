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
          </div>

          {/* Links */}
          <div className="footer-links-wrapper">
            <Link to="/">Ana Sayfa</Link>
            <Link to="/">Serilerimiz</Link>
            <Link to="/news">Duyurular</Link>
            <Link to="/gallery">Galeri</Link>
            <Link to="/sitemap">Site Haritası</Link>
          </div>

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

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© {currentYear} MangaSite. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;