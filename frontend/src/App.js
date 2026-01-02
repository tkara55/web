import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import MangaDetail from './components/manga/MangaDetail';
import ChapterReader from './pages/ChapterReader';
import SiteMap from './pages/SiteMap';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminMangaList from './pages/Admin/AdminMangaList';
import AdminMangaForm from './pages/Admin/AdminMangaForm';
import AdminChapterList from './pages/Admin/AdminChapterList';
import AdminChapterForm from './pages/Admin/AdminChapterForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes with Navbar */}
          <Route path="/" element={
            <>
              <Navbar />
              <main className="main-content">
                <Home />
              </main>
              <Footer />
            </>
          } />
          
          <Route path="/manga/:slug" element={
            <>
              <Navbar />
              <main className="main-content">
                <MangaDetail />
              </main>
              <Footer />
            </>
          } />

          <Route path="/manga/:slug/chapter/:chapterSlug" element={
            <>
              <Navbar />
              <main className="main-content">
                <ChapterReader />
              </main>
            </>
          } />

          <Route path="/sitemap" element={
            <>
              <Navbar />
              <main className="main-content">
                <SiteMap />
              </main>
              <Footer />
            </>
          } />

          {/* Auth Routes - No Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes - No Navbar */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="manga" element={<AdminMangaList />} />
            <Route path="manga/create" element={<AdminMangaForm />} />
            <Route path="manga/:slug/edit" element={<AdminMangaForm />} />
            <Route path="manga/:slug/chapters" element={<AdminChapterList />} />
            <Route path="manga/:slug/chapters/create" element={<AdminChapterForm />} />
            <Route path="manga/:slug/chapters/:chapterSlug/edit" element={<AdminChapterForm />} />
          </Route>
          
          {/* Diğer route'lar sonra eklenecek */}
          {/* <Route path="/manga/:slug/chapters/:chapterSlug" element={<ChapterReader />} />
          <Route path="/news" element={<News />} />
          <Route path="/gallery" element={<Gallery />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;