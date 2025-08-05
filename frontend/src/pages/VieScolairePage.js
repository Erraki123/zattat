import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  Users,
  BookOpen,
  Award,
  Camera,
  MapPin,
  Filter,
  Search,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Baby,
  GraduationCap,
  School,
  Activity,
  Dumbbell,
  Palette,
  Microscope,
  Bus,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import SocialFAB from '../components/SocialFAB';

const VieScolairePage = () => {
  // États pour les filtres
  const [selectedCycle, setSelectedCycle] = useState('college');
  const [selectedYear, setSelectedYear] = useState('2024/2025');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // États pour les images
  const [imageIndexes, setImageIndexes] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  
  // États pour les données dynamiques
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // État pour le délai de recherche
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Configuration statique
  const cycles = [
    { id: 'creche', name: 'Crèche & Préscolaire', icon: <Baby size={20} />, color: '#FF6B6B' },
    { id: 'primaire', name: 'École Primaire', icon: <School size={20} />, color: '#4ECDC4' },
    { id: 'college', name: 'Collège', icon: <BookOpen size={20} />, color: '#45B7D1' },
    { id: 'lycee', name: 'Lycée', icon: <GraduationCap size={20} />, color: '#96CEB4' }
  ];

  const years = ['2025/2026','2024/2025', '2023/2024', '2022/2023'];

  const categories = [
    { id: 'all', name: 'Toutes les activités', icon: <Activity size={16} /> },
    { id: 'sport', name: 'Sport', icon: <Dumbbell size={16} /> },
    { id: 'culture', name: 'Culture', icon: <BookOpen size={16} /> },
    { id: 'science', name: 'Sciences', icon: <Microscope size={16} /> },
    { id: 'art', name: 'Arts', icon: <Palette size={16} /> },
    { id: 'sortie', name: 'Sorties', icon: <Bus size={16} /> },
    { id: 'ceremonie', name: 'Cérémonies', icon: <Trophy size={16} /> }
  ];

  // Fonction pour charger les activités depuis l'API
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        cycle: selectedCycle,
        year: selectedYear,
        page: currentPage.toString(),
        limit: '6'
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`http://localhost:5000/api/vie-scolaire?${params}`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setActivities(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
      
    } catch (err) {
      console.error('Erreur lors du chargement des activités:', err);
      setError(err.message || 'Erreur lors du chargement des données');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger une activité spécifique
  const fetchActivityDetails = async (activityId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/vie-scolaire/${activityId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const activity = await response.json();
      return activity;
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
      return null;
    }
  };

  // Charger les données au montage et lors des changements de filtres
  useEffect(() => {
    fetchActivities();
  }, [selectedCycle, selectedYear, selectedCategory, currentPage]);

  // Effet pour la recherche avec délai
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchActivities();
      }
    }, 500);
    
    setSearchTimeout(timeout);
    
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

  // Fonction pour naviguer dans les images de la grille
  const nextImage = (activityId) => {
    setImageIndexes(prev => {
      const activity = activities.find(act => act._id === activityId);
      if (!activity || !activity.images || activity.images.length === 0) return prev;
      
      const currentIndex = prev[activityId] || 0;
      const nextIndex = (currentIndex + 1) % activity.images.length;
      return { ...prev, [activityId]: nextIndex };
    });
  };

  const prevImage = (activityId) => {
    setImageIndexes(prev => {
      const activity = activities.find(act => act._id === activityId);
      if (!activity || !activity.images || activity.images.length === 0) return prev;
      
      const currentIndex = prev[activityId] || 0;
      const prevIndex = currentIndex === 0 ? activity.images.length - 1 : currentIndex - 1;
      return { ...prev, [activityId]: prevIndex };
    });
  };

  // Fonctions pour naviguer dans les images du modal
  const nextModalImage = () => {
    if (selectedActivity && selectedActivity.images && selectedActivity.images.length > 0) {
      setModalImageIndex((prev) => (prev + 1) % selectedActivity.images.length);
    }
  };

  const prevModalImage = () => {
    if (selectedActivity && selectedActivity.images && selectedActivity.images.length > 0) {
      setModalImageIndex((prev) => prev === 0 ? selectedActivity.images.length - 1 : prev - 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Fonction pour obtenir les couleurs des badges de catégories (dans les photos)
  const getCategoryColor = (category) => {
    const colors = {
      sport: 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)', // Rouge-violet
      culture: 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)', // Rouge-violet
      science: 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)', // Rouge-violet
      art: 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)', // Rouge-violet
      sortie: 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)', // Rouge-violet
      ceremonie: 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)' // Rouge-violet
    };
    return colors[category] || 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)';
  };

  // Fonction pour obtenir les couleurs des boutons "Voir les détails"
  const getButtonColor = (category) => {
    return 'white'; // Fond blanc pour tous les boutons
  };

  // Fonction pour obtenir la couleur du texte des boutons
  const getButtonTextColor = (category) => {
    return '#1f2937'; // Texte noir pour tous les boutons
  };

  const openModal = async (activity) => {
    // Charger les détails complets de l'activité
    const fullActivity = await fetchActivityDetails(activity._id);
    if (fullActivity) {
      setSelectedActivity(fullActivity);
      setModalImageIndex(0);
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    setSelectedActivity(null);
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Gestionnaire de changement de filtres
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'cycle') {
      setSelectedCycle(value);
    } else if (filterType === 'year') {
      setSelectedYear(value);
    } else if (filterType === 'category') {
      setSelectedCategory(value);
    }
    setCurrentPage(1); // Reset à la première page
  };

  // Gestionnaire de changement de page
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

 return (
  <div style={{
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    animation: 'fadeInPage 1s ease-out'
  }}>

      <Navbar />

      <section style={{
        backgroundImage: 'url("/images/school-life-banner.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '300px',
        position: 'relative',
        color: 'white',
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
        }}>
          <div style={{
            padding: '30px',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 'bold',
              margin: 0,
              color: 'white',
            }}>Vie Scolaire</h1>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'white',
              margin: '5px 0 0 0',
            }}>
              <a href="/" style={{
                textDecoration: 'none',
                color: '#ff4d4d',
              }}>Accueil</a>&nbsp;&gt;&nbsp;
              <span style={{ color: 'white' }}>Vie Scolaire</span>
            </p>
          </div>
        </div>
      </section>

      {/* Controls Section */}
      <section style={{
        backgroundColor: 'white',
        padding: '2rem 0',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          {/* Cycle Navigation */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {cycles.map(cycle => (
              <button
                key={cycle.id}
                style={{
                  padding: 'clamp(0.5rem, 2vw, 0.875rem) clamp(1rem, 3vw, 1.75rem)',
                  border: selectedCycle === cycle.id ? '2px solid #1e40af' : '2px solid #e2e8f0',
                  borderRadius: '12px',
                  background: 'white',
                  color: selectedCycle === cycle.id ? '#1e40af' : '#4b5563',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: selectedCycle === cycle.id ? '0 4px 12px rgba(30, 64, 175, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                  minWidth: 'fit-content'
                }}
                onClick={() => handleFilterChange('cycle', cycle.id)}
                onMouseEnter={(e) => {
                  if (selectedCycle !== cycle.id) {
                    e.target.style.borderColor = '#1e40af';
                    e.target.style.color = '#1e40af';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCycle !== cycle.id) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.color = '#4b5563';
                  }
                }}
              >
                {cycle.icon}
                <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>
                  {cycle.name}
                </span>
              </button>
            ))}
          </div>

          {/* Filters Row */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              flex: '1'
            }}>
              <select 
                style={{
                  padding: '0.75rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  minWidth: '120px',
                  maxWidth: '100%'
                }}
                value={selectedYear}
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select 
                style={{
                  padding: '0.75rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  minWidth: '150px',
                  maxWidth: '100%'
                }}
                value={selectedCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '280px',
              minWidth: '200px'
            }}>
              <Search 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} 
              />
              <input
                type="text"
                placeholder="Rechercher une activité..."
                style={{
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  width: '100%',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#e60039'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2rem, 5vw, 3rem) 1rem'
      }}>
        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <Loader2 size={32} style={{ marginRight: '1rem', color: '#e60039', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '1.1rem', color: '#4b5563' }}>Chargement des activités...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textAlign: 'center'
          }}>
            <AlertCircle size={48} style={{ marginBottom: '1rem', color: '#dc2626' }} />
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#dc2626',
              marginBottom: '0.5rem'
            }}>
              Erreur de chargement
            </h3>
            <p style={{
              fontSize: '0.95rem',
              color: '#6b7280',
              marginBottom: '1.5rem'
            }}>
              {error}
            </p>
            <button
              onClick={fetchActivities}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={16} />
              Réessayer
            </button>
          </div>
        )}

        {/* Activities Grid */}
        {!loading && !error && activities.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 350px), 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2rem)',
            marginBottom: '3rem'
          }}>
            {activities.map(activity => {
              const currentImageIndex = imageIndexes[activity._id] || 0;
              const hasImages = activity.images && activity.images.length > 0;
              
              return (
                <div 
                  key={activity._id} 
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    border: '1px solid #f1f5f9'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
                  }}
                >
                  {/* Image Carousel */}
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    {hasImages ? (
                      <>
                        <img
                          src={`http://localhost:5000${activity.images[currentImageIndex]}`}
                          alt={activity.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#f3f4f6',
                          display: 'none',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9ca3af'
                        }}>
                          <Camera size={48} />
                        </div>
                        
                        {/* Navigation buttons */}
                        {activity.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                prevImage(activity._id);
                              }}
                              style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: 'white'
                              }}
                            >
                              <ChevronLeft size={20} />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                nextImage(activity._id);
                              }}
                              style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: 'white'
                              }}
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}
                        
                        {/* Image indicators */}
                        {activity.images.length > 1 && (
                          <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '6px'
                          }}>
                            {activity.images.map((_, index) => (
                              <div
                                key={index}
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                                  transition: 'all 0.3s ease'
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af'
                      }}>
                        <Camera size={48} />
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 'clamp(1.5rem, 3vw, 2rem)' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <h3 style={{
                        fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '0.5rem',
                        lineHeight: '1.3',
                        flex: '1',
                        minWidth: '0'
                      }}>
                        {activity.title}
                      </h3>
                      
                      <span 
                        style={{
                          padding: '0.375rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: getCategoryColor(activity.category),
                          color: 'white',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {categories.find(cat => cat.id === activity.category)?.name || activity.category}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                        color: '#6b7280'
                      }}>
                        <Calendar size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
                        <span>{formatDate(activity.date)}</span>
                      </div>
                      
                      {activity.time && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                          color: '#6b7280'
                        }}>
                          <Clock size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
                          <span>{activity.time}</span>
                        </div>
                      )}
                      
                      {activity.participants && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                          color: '#6b7280'
                        }}>
                          <Users size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
                          <span>{activity.participants} participants</span>
                        </div>
                      )}
                      
                      {activity.lieu && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                          color: '#6b7280'
                        }}>
                          <MapPin size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
                          <span>{activity.lieu}</span>
                        </div>
                      )}
                    </div>

                    <p style={{
                      fontSize: 'clamp(0.9rem, 2vw, 0.95rem)',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      marginBottom: '1.5rem'
                    }}>
                      {activity.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid #f1f5f9',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div style={{
                        fontSize: 'clamp(0.8rem, 2vw, 0.85rem)',
                        color: '#9ca3af',
                        fontWeight: '500'
                      }}>
                        {hasImages ? activity.images.length : 0} photo{hasImages && activity.images.length > 1 ? 's' : ''}
                      </div>
                      
                      <button
                        onClick={() => openModal(activity)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                          background: getButtonColor(activity.category),
                          color: getButtonTextColor(activity.category),
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                          e.target.style.borderColor = '#3b82f6';
                          e.target.style.color = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.color = '#1f2937';
                        }}
                      >
                        <Eye size={16} />
                        <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>
                          Voir les détails
                        </span>
                        <span style={{ display: window.innerWidth >= 480 ? 'none' : 'inline' }}>
                          Détails
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && activities.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(3rem, 8vw, 4rem) 2rem',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <BookOpen size={64} style={{ 
              marginBottom: '1.5rem', 
              opacity: 0.3,
              color: '#9ca3af'
            }} />
            <h3 style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.25rem)',
              fontWeight: '600',
              color: '#4b5563',
              marginBottom: '0.5rem'
            }}>
              Aucune activité trouvée
            </h3>
            <p style={{
              fontSize: 'clamp(0.9rem, 2.5vw, 0.95rem)',
              color: '#9ca3af'
            }}>
              Aucune activité ne correspond aux critères sélectionnés.
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '3rem',
            flexWrap: 'wrap'
          }}>
            <button
              style={{
                padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                border: currentPage === 1 ? '2px solid #e2e8f0' : '2px solid transparent',
                borderRadius: '10px',
                background: currentPage === 1 ? '#f8fafc' : 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)',
                color: currentPage === 1 ? '#9ca3af' : 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ArrowLeft size={18} />
            </button>
            
            {Array.from({ length: Math.min(totalPages, window.innerWidth < 768 ? 5 : 7) }, (_, i) => {
              let page;
              const maxVisible = window.innerWidth < 768 ? 5 : 7;
              if (totalPages <= maxVisible) {
                page = i + 1;
              } else if (currentPage <= Math.floor(maxVisible/2) + 1) {
                page = i + 1;
              } else if (currentPage >= totalPages - Math.floor(maxVisible/2)) {
                page = totalPages - maxVisible + 1 + i;
              } else {
                page = currentPage - Math.floor(maxVisible/2) + i;
              }
              
              return (
                <button
                  key={page}
                  style={{
                    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
                    border: '2px solid',
                    borderColor: currentPage === page ? 'transparent' : '#e2e8f0',
                    borderRadius: '10px',
                    background: currentPage === page ? 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)' : 'white',
                    color: currentPage === page ? 'white' : '#4b5563',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: '600',
                    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                    minWidth: 'clamp(35px, 8vw, 45px)'
                  }}
                  onClick={() => handlePageChange(page)}
                  onMouseEnter={(e) => {
                    if (currentPage !== page) {
                      e.target.style.borderColor = '#e60039';
                      e.target.style.color = '#e60039';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== page) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.color = '#4b5563';
                    }
                  }}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              style={{
                padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                border: currentPage === totalPages ? '2px solid #e2e8f0' : '2px solid transparent',
                borderRadius: '10px',
                background: currentPage === totalPages ? '#f8fafc' : 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)',
                color: currentPage === totalPages ? '#9ca3af' : 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && selectedActivity && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'clamp(1rem, 4vw, 2rem)'
        }}
        onClick={closeModal}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              borderBottom: '1px solid #e2e8f0',
              padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1.5rem, 4vw, 2rem)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: '20px 20px 0 0',
              zIndex: 10
            }}>
              <h2 style={{
                fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0,
                paddingRight: '1rem'
              }}>
                {selectedActivity.title}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Image Gallery */}
            {selectedActivity.images && selectedActivity.images.length > 0 && (
              <div style={{ 
                position: 'relative', 
                height: 'clamp(250px, 50vw, 400px)', 
                overflow: 'hidden' 
              }}>
                <img 
                  src={`http://localhost:5000${selectedActivity.images[modalImageIndex]}`} 
                  alt={selectedActivity.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f3f4f6',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af'
                }}>
                  <Camera size={48} />
                </div>
                
                {/* Navigation buttons */}
                {selectedActivity.images.length > 1 && (
                  <>
                    <button
                      onClick={prevModalImage}
                      style={{
                        position: 'absolute',
                        left: 'clamp(10px, 3vw, 20px)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 'clamp(40px, 8vw, 50px)',
                        height: 'clamp(40px, 8vw, 50px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.9)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.7)'}
                    >
                      <ChevronLeft size={window.innerWidth < 768 ? 20 : 24} />
                    </button>
                    
                    <button
                      onClick={nextModalImage}
                      style={{
                        position: 'absolute',
                        right: 'clamp(10px, 3vw, 20px)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 'clamp(40px, 8vw, 50px)',
                        height: 'clamp(40px, 8vw, 50px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.9)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.7)'}
                    >
                      <ChevronRight size={window.innerWidth < 768 ? 20 : 24} />
                    </button>
                  </>
                )}
                
                {/* Image counter */}
                <div style={{
                  position: 'absolute',
                  bottom: 'clamp(10px, 3vw, 20px)',
                  right: 'clamp(10px, 3vw, 20px)',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                  fontWeight: '600'
                }}>
                  {modalImageIndex + 1} / {selectedActivity.images.length}
                </div>
              </div>
            )}

            {/* Modal Content */}
            <div style={{ padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
              {/* Category Badge */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span 
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '25px',
                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                    fontWeight: '600',
                    background: getCategoryColor(selectedActivity.category),
                    color: 'white'
                  }}
                >
                  {categories.find(cat => cat.id === selectedActivity.category)?.name || selectedActivity.category}
                </span>
              </div>

              {/* Activity Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: 'clamp(1rem, 3vw, 1.5rem)',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: 'clamp(0.75rem, 2vw, 1rem)',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px'
                }}>
                  <Calendar size={20} style={{ color: '#e60039', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.875rem)', color: '#6b7280', fontWeight: '500' }}>Date</div>
                    <div style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: '#1f2937', fontWeight: '600' }}>
                      {formatDate(selectedActivity.date)}
                    </div>
                  </div>
                </div>

                {selectedActivity.time && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px'
                  }}>
                    <Clock size={20} style={{ color: '#e60039', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.875rem)', color: '#6b7280', fontWeight: '500' }}>Horaire</div>
                      <div style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: '#1f2937', fontWeight: '600' }}>
                        {selectedActivity.time}
                      </div>
                    </div>
                  </div>
                )}

                {selectedActivity.participants && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px'
                  }}>
                    <Users size={20} style={{ color: '#e60039', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.875rem)', color: '#6b7280', fontWeight: '500' }}>Participants</div>
                      <div style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: '#1f2937', fontWeight: '600' }}>
                        {selectedActivity.participants} élèves
                      </div>
                    </div>
                  </div>
                )}

                {selectedActivity.lieu && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: 'clamp(0.75rem, 2vw, 1rem)',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px'
                  }}>
                    <MapPin size={20} style={{ color: '#e60039', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.875rem)', color: '#6b7280', fontWeight: '500' }}>Lieu</div>
                      <div style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: '#1f2937', fontWeight: '600' }}>
                        {selectedActivity.lieu}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedActivity.fullDescription && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: 'clamp(1rem, 3vw, 1.1rem)',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '1rem'
                  }}>
                    Description détaillée
                  </h3>
                  <p style={{
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    color: '#4b5563',
                    lineHeight: '1.7'
                  }}>
                    {selectedActivity.fullDescription}
                  </p>
                </div>
              )}

              {/* Additional Details */}
              {(selectedActivity.organisateur || selectedActivity.materiel) && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                  gap: 'clamp(1rem, 3vw, 1.5rem)'
                }}>
                  {selectedActivity.organisateur && (
                    <div>
                      <h4 style={{
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.75rem'
                      }}>
                        Organisateur
                      </h4>
                      <p style={{
                        fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                        color: '#6b7280'
                      }}>
                        {selectedActivity.organisateur}
                      </p>
                    </div>
                  )}

                  {selectedActivity.materiel && (
                    <div>
                      <h4 style={{
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.75rem'
                      }}>
                        Matériel utilisé
                      </h4>
                      <p style={{
                        fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                        color: '#6b7280'
                      }}>
                        {selectedActivity.materiel}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <ScrollToTop />
      <SocialFAB />

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .cycle-name {
            display: none;
          }
        }
        
        @media (max-width: 480px) {
          .details-text {
            display: none;
          }
        }
          @keyframes fadeInPage {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

      `}</style>
    </div>
  );
};

export default VieScolairePage;