import React from 'react';
import { 
  Baby,
  BookOpen,
  GraduationCap,
  Users,
  ArrowRight
} from 'lucide-react';

// Import components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import SocialFAB from '../components/SocialFAB';

const CyclesPage = () => {
  const cycles = [
    {
      id: 'creche',
      icon: 'icons/playtime.png',
      title: 'Crèche & Préscolaire',
      description: 'Un environnement sécurisé et stimulant pour les premiers apprentissages.',
      features: [
        'Développement de la motricité',
        'Éveil artistique et créatif',
        'Socialisation et autonomie',
        'Apprentissage ludique des bases'
      ],
      backgroundImage: 'images/child-315049_640.jpg',
      color: '#FF6B6B',
      route: '/CrechePrescolaire'
    },
    {
      id: 'primaire',
      icon: 'icons/children.png',
      title: 'École Primaire',
      description: 'Acquisition des fondamentaux avec une pédagogie moderne et bienveillante.',
      features: [
        'Maîtrise de la lecture et écriture',
        'Mathématiques et sciences',
        'Langues étrangères',
        'Activités sportives et culturelles'
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      color: '#4ECDC4',
      route: '/ecole-primaire'
    },
    {
      id: 'college',
      icon: 'icons/student.png',
      title: 'Collège',
      description: 'Construction de la personnalité et approfondissement des connaissances.',
      features: [
        'Programme national enrichi',
        'Orientation personnalisée',
        'Projets interdisciplinaires',
        'Préparation au lycée'
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      color: '#45B7D1',
      route: '/college'
    },
    {
      id: 'lycee',
      icon: 'icons/classmates.png',
      title: 'Lycée',
      description: 'Excellence académique et préparation aux études supérieures.',
      features: [
        'Filières scientifiques et littéraires',
        'Préparation au baccalauréat',
        'Orientation post-bac',
        'Développement du leadership'
      ],
      backgroundImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      color: '#96CEB4',
      route: '/lycee'
    }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    },
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
      backgroundImage: 'url("images/education-cycles.png")',
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

    cyclesSection: {
      width: '100vw',
      background: '#f8f9fa',
      display: 'flex',
      alignItems: 'stretch',
      minHeight: '70vh'
    },
    cyclesRow: {
      display: 'flex',
      flexWrap: 'wrap',
      width: '100%'
    },
    cycleCard: {
      width: '25%',
      padding: '40px 20px',
      minHeight: '65vh',
      position: 'relative',
      backgroundColor: 'white',
      borderRight: '1px solid #eee',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cycleCardLast: {
      borderRight: 'none'
    },
    cardContent: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      width: '100%'
    },
    cycleIcon: {
      width: '65px',
      height: '65px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '15px',
      backgroundColor: 'transparent',
      borderRadius: '50%',
      padding: '10px',
      transition: 'all 0.3s ease'
    },
    cycleTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '5px',
      transition: 'all 0.3s ease'
    },
    cycleSubtitle: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '10px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    divider: {
      width: '40px',
      height: '2px',
      backgroundColor: ' #4c1781',
      marginBottom: '20px'
    },
    cycleDescription: {
      fontSize: '14px',
      color: '#666',
      textAlign: 'center',
      marginBottom: '20px',
      lineHeight: '1.5',
      maxWidth: '240px',
      transition: 'all 0.3s ease'
    },
    featuresList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      textAlign: 'left',
      fontSize: '15px',
      lineHeight: '1.8',
      maxWidth: '240px',
      fontWeight: '600',
      flexGrow: 1,
      color: '#333',
      transition: 'all 0.3s ease'
    },
    featureItem: {
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px'
    },
    featureBullet: {
      width: '6px',
      height: '6px',
      backgroundColor: ' #4c1781',
      borderRadius: '50%',
      marginTop: '8px',
      flexShrink: 0
    },
    cycleButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'white',
      color: 'black',
      padding: '14px 24px',
      borderRadius: '50px',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      marginTop: 'auto',
      marginBottom: '10px',
      border: '2px solid black',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      cursor: 'pointer'
    }
  };

  const responsiveStyles = `
    @media (max-width: 992px) {
      .cycle-card {
        width: 50% !important;
        min-height: 75vh !important;
      }
    }

    @media (max-width: 576px) {
      .cycles-row {
        flex-direction: column !important;
      }

      .cycle-card {
        width: 100% !important;
        min-height: auto !important;
        padding: 30px 20px !important;
      }

      .cycle-icon {
        width: 55px !important;
        height: 55px !important;
      }

      .cycle-title {
        font-size: 18px !important;
      }

      .features-list {
        font-size: 14px !important;
        text-align: center !important;
      }

      .cycle-button {
        font-size: 13px !important;
        padding: 12px 18px !important;
      }

      .text-bottom {
        padding-left: 20px !important;
      }

      .hero-title {
        font-size: 2rem !important;
      }

      .hero-breadcrumb {
        font-size: 14px !important;
      }
    }

    .cycle-card::before {
      content: "";
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 0;
    }

    .cycle-card::after {
      content: "";
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1;
    }

    .cycle-card:hover::before {
      opacity: 1;
    }

    .cycle-card:hover::after {
      opacity: 1;
    }

    .cycle-card:hover .cycle-icon {
      transform: scale(1.1);
    }

    .cycle-card:hover .cycle-title {
      transform: scale(1.1);
      font-weight: 800;
      color: #fff !important;
    }

    .cycle-card:hover .cycle-subtitle {
      color: #fff !important;
      font-weight: 700;
    }

    .cycle-card:hover .cycle-description {
      color: #fff !important;
      font-weight: 600;
    }

    .cycle-card:hover .features-list {
      transform: scale(1.05);
      font-weight: 600;
      color: #fff !important;
    }

    .cycle-card:hover .cycle-button {
      background: white !important;
      border: 2px solid white !important;
      color: #333 !important;
    }

    .cycle-button svg {
      transition: transform 0.3s ease;
    }

    .cycle-button:hover svg {
      transform: translateX(3px);
    }

    .cycle-creche::before {
      background-image: url('/images/child-315049_640.jpg');
    }

    .cycle-creche::after {
      background-color: #FF6B6BCC;
    }

    .cycle-primaire::before {
      background-image: url('/images/istockphoto-1194312917-612x612.jpg');
    }

    .cycle-primaire::after {
      background-color: #4ECDC4CC;
    }
    
    .cycle-college::before {
      background-image: url('/images/istockphoto-2184618859-612x612.jpg');
    }

    .cycle-college::after {
      background-color: #45B7D1CC;
    }

    .cycle-lycee::before {
      background-image: url('/images/graduation-4502796_640.jpg');
    }

    .cycle-lycee::after {
      background-color: #96CEB4CC;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .cycle-card {
      animation: fadeInUp 0.8s ease forwards;
      opacity: 0;
    }

    .cycle-card:nth-child(1) {
      animation-delay: 0.2s;
    }
    .cycle-card:nth-child(2) {
      animation-delay: 0.4s;
    }
    .cycle-card:nth-child(3) {
      animation-delay: 0.6s;
    }
    .cycle-card:nth-child(4) {
      animation-delay: 0.8s;
    }
  `;

  // Fonction de navigation corrigée
  const handleCardClick = (cycle) => {
    // Navigation réelle vers la route
    window.location.href = cycle.route;
  };

  // Fonction pour gérer le clic sur le bouton "Découvrir"
  const handleDiscoverClick = (e, cycle) => {
    e.stopPropagation(); // Empêche la propagation vers le parent
    window.location.href = cycle.route;
  };

  return (
    <div style={styles.container}>
      <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />
      
      <Navbar />
      
      {/* Hero Section avec image en arrière-plan et texte centré */}
      <section style={styles.heroAbout}>
        <div style={styles.overlay}></div>
        <div style={styles.textBottom} className="text-bottom">
          <h2 style={styles.heroTitle} className="hero-title">Nos Cycles Éducatifs</h2>
          <p style={styles.heroBreadcrumb} className="hero-breadcrumb">
            <a href="/" style={styles.homeLink}>Accueil</a>&nbsp;&gt;&nbsp;
            <span style={{ color: 'white' }}>Nos Cycles Éducatifs</span>
          </p>
        </div>
      </section>

      {/* Cycles Section */}
      <section style={styles.cyclesSection}>
        <div style={styles.cyclesRow} className="cycles-row">
          {cycles.map((cycle, index) => (
            <div 
              key={cycle.id}
              style={{
                ...styles.cycleCard,
                ...(index === cycles.length - 1 ? styles.cycleCardLast : {})
              }}
              className={`cycle-card cycle-${cycle.id}`}
              onClick={() => handleCardClick(cycle)}
            >
              {/* Content */}
              <div style={styles.cardContent}>
                <div 
                  style={styles.cycleIcon}
                  className="cycle-icon"
                >
              {typeof cycle.icon === 'string' ? (
  <img
    src={cycle.icon}
    alt={cycle.title}
    style={{ width: '65px', height: '65px', objectFit: 'contain' }}
  />
) : (
  React.cloneElement(cycle.icon, {
    color: 'black',
    className: 'cycle-icon-svg',
    style: { transition: 'all 0.3s ease' }
  })
)}

                </div>

                <h5 style={styles.cycleTitle} className="cycle-title">
                  {cycle.title}
                </h5>

                <div style={styles.cycleSubtitle} className="cycle-subtitle">
                  {cycle.subtitle}
                </div>

                <div style={styles.divider}></div>

                <p style={styles.cycleDescription} className="cycle-description">
                  {cycle.description}
                </p>

                <ul style={styles.featuresList} className="features-list">
                  {cycle.features.map((feature, idx) => (
                    <li key={idx} style={styles.featureItem}>
                      <div style={styles.featureBullet}></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div 
                  style={styles.cycleButton}
                  className="cycle-button"
                  onClick={(e) => handleDiscoverClick(e, cycle)}
                >
                  <span>Découvrir</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <ScrollToTop />
      <SocialFAB />
    </div>
  );
};

export default CyclesPage;