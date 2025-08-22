import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  User,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Pin,
  BookOpen,
  Award,
  Users,
  Globe,
  FileText,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  EyeOff,
  Eye
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

const ActualitesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [readMore, setReadMore] = useState({});
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);

  // Catégories d'actualités
  const categories = [
    { id: 'all', name: 'Toutes les actualités', icon: <Globe size={16} /> },
    { id: 'evenements', name: 'Événements', icon: <Calendar size={16} /> },
    { id: 'resultats', name: 'Résultats', icon: <Award size={16} /> },
    { id: 'pedagogie', name: 'Pédagogie', icon: <BookOpen size={16} /> },
    { id: 'communaute', name: 'Communauté', icon: <Users size={16} /> },
    { id: 'partenariats', name: 'Partenariats', icon: <Award size={16} /> }
  ];

  // Fonction pour récupérer les actualités depuis l'API
  const fetchActualites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (sortBy) {
        params.append('sortBy', sortBy);
      }

      const response = await fetch(`http://localhost:5000/api/actualites?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setActualites(data);
      } else if (data && Array.isArray(data.actualites)) {
        setActualites(data.actualites);
      } else {
        setActualites([]);
      }
      
      setCurrentPage(1);
    } catch (err) {
      console.error('Erreur lors du chargement des actualités:', err);
      setError(err.message);
      setActualites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActualites();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchActualites();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchTerm, sortBy]);

  const newsPerPage = 5;
  const safeActualites = Array.isArray(actualites) ? actualites : [];
  const totalPages = Math.ceil(safeActualites.length / newsPerPage);
  const currentNews = safeActualites.slice(
    (currentPage - 1) * newsPerPage,
    currentPage * newsPerPage
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const toggleReadMore = (id) => {
    setReadMore(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'article': return <FileText size={18} />;
      case 'event': return <Calendar size={18} />;
      case 'announcement': return <Globe size={18} />;
      case 'achievement': return <Award size={18} />;
      case 'project': return <BookOpen size={18} />;
      default: return <FileText size={18} />;
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'Inter, sans-serif'
    },
    // Hero Section identique à CyclesPage
    heroSection: {
      position: 'relative',
      width: '100%',
      height: '70vh',
      backgroundImage: 'url("/images/education-cycles.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textAlign: 'center',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 1,
    },
    heroContent: {
      position: 'relative',
      zIndex: 2,
    },
    heroTitle: {
      fontSize: 'clamp(32px, 5vw, 48px)',
      fontWeight: 'bold',
      margin: 0,
      color: 'white'
    },
    heroSubtitle: {
      fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
      opacity: 0.9,
      maxWidth: '700px',
      margin: '0 auto',
      lineHeight: '1.6'
    },
    heroAbout: {
      backgroundImage: 'url("images/istockphoto-492964174-612x612.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '300px',
      position: 'relative',
      color: 'white',
      display: 'flex',
      alignItems: 'flex-end',
    },
    textBottom: {
      position: 'relative',
      zIndex: 2,
      paddingLeft: '60px',
      paddingBottom: '30px',
    },
    heroBreadcrumb: {
      fontSize: '16px',
      color: 'white',
      margin: '5px 0 0 0',
    },
    homeLink: {
      textDecoration: 'none',
      color: '#ff4d4d',
    },
    // Nouveau style pour le bouton toggle amélioré
    toggleContainer: {
      display: 'flex',
      justifyContent: 'center',
      padding: '1rem 0',
      backgroundColor: '#f9fafb',
      position: 'sticky',
      top: '72px', // Ajusté selon la hauteur de votre navbar
      zIndex: 20
    },
    toggleButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.875rem 1.5rem',
      backgroundColor: 'white',
      color: '#1e293b',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: '600',
      minWidth: '220px',
      maxWidth: '300px',
      width: 'fit-content',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      position: 'relative',
      overflow: 'hidden'
    },
    toggleButtonContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flex: 1
    },
    toggleIcon: {
      color: '#6b21a8',
      transition: 'transform 0.3s ease'
    },
    toggleArrow: {
      color: '#6b21a8',
      transition: 'transform 0.3s ease',
      flexShrink: 0
    },
    // Section des contrôles responsive
    controlsSection: {
      backgroundColor: 'white',
      padding: showControls ? '1.5rem 0' : '0',
      borderBottom: showControls ? '1px solid #e2e8f0' : 'none',
      boxShadow: showControls ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      maxHeight: showControls ? '400px' : '0',
      opacity: showControls ? 1 : 0
    },
    controlsContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem',
      transform: showControls ? 'translateY(0)' : 'translateY(-20px)',
      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    categoriesBar: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    categoryButton: (isActive) => ({
      padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1.5rem)',
      border: isActive ? '2px solid #6b21a8' : '2px solid #e2e8f0',
      borderRadius: '12px',
      backgroundColor: isActive ? '#6b21a8' : 'white',
      color: isActive ? 'white' : '#64748b',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '500',
      whiteSpace: 'nowrap'
    }),
    filtersRow: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    },
    filterGroup: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    select: {
      padding: '0.75rem 1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      backgroundColor: 'white',
      cursor: 'pointer',
      color: '#475569',
      minWidth: '150px'
    },
    searchInput: {
      padding: '0.75rem 1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      minWidth: '200px',
      width: '100%',
      maxWidth: '300px',
      outline: 'none',
      color: '#475569'
    },
    // Contenu principal responsive
    mainContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)',
      position: 'relative',
      zIndex: 1
    },
    statsBar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 'clamp(1rem, 3vw, 2rem)',
      marginBottom: 'clamp(2rem, 4vw, 3rem)',
      padding: 'clamp(1rem, 3vw, 2rem)',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    statItem: {
      textAlign: 'center',
      minWidth: '120px'
    },
    statNumber: {
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      fontWeight: 'bold',
      color: '#6b21a8',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      color: '#64748b',
      fontWeight: '500'
    },
    newsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(1.5rem, 3vw, 2rem)'
    },
    newsItem: {
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    pinnedBadge: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
      fontWeight: '600',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    newsHeader: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: 'clamp(1rem, 3vw, 2rem)',
      alignItems: 'flex-start'
    },
    newsImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      borderRadius: '12px',
      order: -1
    },
    newsContent: {
      flex: 1,
      width: '100%'
    },
    newsMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(0.75rem, 2vw, 1.5rem)',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      color: '#64748b',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      whiteSpace: 'nowrap'
    },
    newsTitle: {
      fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '1rem',
      lineHeight: '1.4'
    },
    newsExcerpt: {
      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
      color: '#475569',
      lineHeight: '1.6',
      marginBottom: '1rem'
    },
    newsFullContent: {
      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
      color: '#475569',
      lineHeight: '1.7',
      marginBottom: '1.5rem',
      paddingLeft: 'clamp(1rem, 3vw, 2rem)',
      paddingRight: 'clamp(1rem, 3vw, 2rem)',
      paddingBottom: '1rem'
    },
    newsTags: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: '1rem',
      flexWrap: 'wrap'
    },
    tag: {
      backgroundColor: '#f1f5f9',
      color: '#475569',
      padding: '0.4rem 0.8rem',
      borderRadius: '20px',
      fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
      fontWeight: '500',
      border: '1px solid #e2e8f0'
    },
    readMoreButton: {
      color: '#6b21a8',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 'clamp(0.9rem, 2vw, 1rem)',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0',
      marginTop: '1rem'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: 'clamp(2rem, 4vw, 3rem)',
      flexWrap: 'wrap'
    },
    pageButton: (isActive) => ({
      padding: '0.75rem 1rem',
      border: '2px solid',
      borderColor: isActive ? '#6b21a8' : '#e2e8f0',
      borderRadius: '8px',
      backgroundColor: isActive ? '#6b21a8' : 'white',
      color: isActive ? 'white' : '#64748b',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
    }),
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 'clamp(2rem, 4vw, 4rem)',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e2e8f0'
    },
    errorContainer: {
      textAlign: 'center',
      padding: 'clamp(2rem, 4vw, 4rem)',
      color: '#dc2626',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #fecaca'
    }
  };

  // Styles CSS responsifs améliorés
  const responsiveStyles = `
    @media (min-width: 640px) {
      .categories-bar {
        justify-content: flex-start !important;
        gap: 1rem !important;
      }
      
      .search-input {
        min-width: 250px !important;
      }
      
      .news-header {
        flex-direction: row !important;
        gap: 2rem !important;
      }
      
      .news-image {
        width: 200px !important;
        height: 150px !important;
        order: 0 !important;
      }
      
      .text-bottom {
        padding-left: 60px !important;
        padding-bottom: 30px !important;
      }
    }
    
    @media (min-width: 768px) {
      .controls-section {
        padding: ${showControls ? '2rem 0' : '0'} !important;
      }
      
      .controls-container {
        padding: 0 1.5rem !important;
      }
      
      .categories-bar {
        margin-bottom: 1.5rem !important;
      }
      
      .search-input {
        min-width: 300px !important;
      }
      
      .toggle-button:hover {
        border-color: #6b21a8 !important;
        box-shadow: 0 4px 20px rgba(107, 33, 168, 0.15) !important;
        transform: translateY(-1px) !important;
      }
      
      .toggle-button:hover .toggle-arrow {
        transform: ${showControls ? 'rotate(180deg) scale(1.1)' : 'scale(1.1)'} !important;
      }
    }
    
    @media (min-width: 1024px) {
      .pagination {
        gap: 1rem !important;
      }
      
      .toggle-button {
        min-width: 240px !important;
      }
    }
    
    @media (max-width: 640px) {
      .filters-row {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 1rem !important;
      }
      
      .filter-group {
        width: 100% !important;
        justify-content: center !important;
      }
      
      .search-input {
        min-width: auto !important;
        width: 100% !important;
      }
      
      .categories-bar {
        gap: 0.5rem !important;
      }
      
      .pinned-badge {
        position: static !important;
        align-self: flex-start !important;
        margin-bottom: 1rem !important;
      }
      
      .news-meta {
        gap: 0.75rem !important;
      }
      
      .meta-item {
        font-size: 0.8rem !important;
      }
      
      .text-bottom {
        padding-left: 20px !important;
        padding-bottom: 30px !important;
      }
      
      .hero-title {
        font-size: 2rem !important;
      }
      
      .hero-breadcrumb {
        font-size: 14px !important;
      }
      
      .toggle-button {
        min-width: 200px !important;
        max-width: 280px !important;
        font-size: 0.9rem !important;
      }
    }
    
    .fade-in {
      animation: fadeIn 0.8s ease-out both;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Animation pour la flèche du toggle */
    .toggle-arrow-rotate {
      transform: rotate(180deg);
    }
    
    /* Animation pour l'icône du toggle */
    .toggle-icon-pulse {
      animation: pulse 0.3s ease-in-out;
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }
  `;

  return (
    <div style={styles.container} className="fade-in">
      <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />
      
      <Navbar />
      
      {/* Hero Section identique à CyclesPage */}
      <section style={styles.heroAbout}>
        <div style={styles.overlay}></div>
        <div style={styles.textBottom} className="text-bottom">
          <h2 style={styles.heroTitle} className="hero-title">Actualités</h2>
          <p style={styles.heroBreadcrumb} className="hero-breadcrumb">
            <a href="/" style={styles.homeLink}>Accueil</a>&nbsp;&gt;&nbsp;
            <span style={{ color: 'white' }}>Actualités</span>
          </p>
        </div>
      </section>

      {/* Nouveau bouton Toggle amélioré */}
      <div style={styles.toggleContainer}>
        <button
          style={styles.toggleButton}
          className="toggle-button"
          onClick={() => setShowControls(!showControls)}
        >
          <div style={styles.toggleButtonContent}>
            <Filter 
              size={18} 
              style={styles.toggleIcon}
              className={showControls ? 'toggle-icon-pulse' : ''}
            />
            <span>Filtres et recherche</span>
          </div>
          <ChevronDown 
            size={20} 
            style={{
              ...styles.toggleArrow,
              transform: showControls ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
            className="toggle-arrow"
          />
        </button>
      </div>

      {/* Controls Section */}
      <section style={styles.controlsSection} className="controls-section">
        <div style={styles.controlsContainer} className="controls-container">
          {/* Categories Bar */}
          <div style={styles.categoriesBar} className="categories-bar">
            {categories.map(category => (
              <button
                key={category.id}
                style={styles.categoryButton(selectedCategory === category.id)}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Filters Row */}
          <div style={styles.filtersRow} className="filters-row">
            <div style={styles.filterGroup} className="filter-group">
              <select 
                style={styles.select}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Plus récentes</option>
              </select>
            </div>

            <div style={styles.filterGroup} className="filter-group">
              <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                <Search 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#64748b'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Rechercher une actualité..."
                  style={{...styles.searchInput, paddingLeft: '45px'}}
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Loading State */}
        {loading && (
          <div style={styles.loadingContainer}>
            <Loader2 size={32} className="animate-spin" style={{ marginRight: '1rem', color: '#6b21a8' }} />
            <span style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: '#64748b' }}>Chargement des actualités...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={styles.errorContainer}>
            <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', marginBottom: '0.5rem' }}>Erreur lors du chargement</p>
            <p style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', opacity: 0.7 }}>{error}</p>
            <button
              onClick={fetchActualites}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: 'clamp(0.9rem, 2vw, 0.95rem)'
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* News List */}
        {!loading && !error && (
          <>
            {currentNews.length > 0 ? (
              <div style={styles.newsList}>
                {currentNews.map(news => (
                  <article 
                    key={news._id} 
                    style={styles.newsItem}
                    onMouseEnter={(e) => {
                      if (window.innerWidth > 768) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (window.innerWidth > 768) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                  >
                    {news.isPinned && (
                      <div style={styles.pinnedBadge} className="pinned-badge">
                        <Pin size={14} />
                        <span>Actualité importante</span>
                      </div>
                    )}
                    
                    <div style={styles.newsHeader} className="news-header">
                      {news.image && (
                        <img 
                          src={`http://localhost:5000${news.image}`} 
                          alt={news.title}
                          style={styles.newsImage}
                          className="news-image"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600';
                          }}
                        />
                      )}
                      
                      <div style={styles.newsContent}>
                        <div style={styles.newsMeta} className="news-meta">
                          <div style={styles.metaItem} className="meta-item">
                            {getTypeIcon(news.type)}
                            <span>{categories.find(cat => cat.id === news.category)?.name}</span>
                          </div>
                          <div style={styles.metaItem} className="meta-item">
                            <Calendar size={16} />
                            <span>{formatDate(news.date)}</span>
                          </div>
                          <div style={styles.metaItem} className="meta-item">
                            <User size={16} />
                            <span>{news.author}</span>
                          </div>
                        </div>
                        
                        <h2 style={styles.newsTitle}>{news.title}</h2>
                        
                        <p style={styles.newsExcerpt}>{news.excerpt}</p>
                        
                        {news.tags && news.tags.length > 0 && (
                          <div style={styles.newsTags}>
                            {news.tags.map((tag, index) => (
                              <span key={index} style={styles.tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <button
                          style={styles.readMoreButton}
                          onClick={() => toggleReadMore(news._id)}
                        >
                          <span>{readMore[news._id] ? 'Voir moins' : 'Lire la suite'}</span>
                          {readMore[news._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    {readMore[news._id] && (
                      <div style={styles.newsFullContent}>
                        {news.content.split('\n').map((paragraph, index) => (
                          <p key={index} style={{marginBottom: '1rem'}}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(2rem, 4vw, 4rem)',
                color: '#64748b',
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <Globe size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>Aucune actualité trouvée pour les critères sélectionnés.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination} className="pagination">
                <button
                  style={styles.pageButton(false)}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    style={styles.pageButton(currentPage === page)}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  style={styles.pageButton(false)}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default ActualitesPage;