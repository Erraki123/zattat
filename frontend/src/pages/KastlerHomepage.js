import React, { useState } from 'react';
import { Heart, BookOpen, Target, GraduationCap, MapPin, Phone, Mail, Clock, ChevronRight, Baby, Users, ArrowRight, Send, User, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import SocialFAB from '../components/SocialFAB';

const KastlerHomepage = () => {
  // État pour le formulaire de contact
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cycle: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          cycle: '',
          subject: '',
          message: ''
        });
        
        setTimeout(() => {
          setSubmitStatus(null);
        }, 5000);
      } else {
        setSubmitStatus('error');
        console.error('Erreur lors de l\'envoi:', result.message);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Erreur réseau:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cartes des cycles éducatifs pour le hero
  const educationCards = [
    {
      id: 'creche',
      icon: <Heart size={28} />,
      title: "Crèche & Préscolaire",
      image: '/images/child-315049_640.jpg',
      route: '/CrechePrescolaire'
    },
    {
      id: 'primaire',
      icon: <BookOpen size={28} />,
      title: "École Primaire",
      image: '/images/istockphoto-1194312917-612x612.jpg',
      route: '/ecole-primaire'
    },
    {
      id: 'college',
      icon: <Target size={28} />,
      title: "Collège",
      image: '/images/istockphoto-2184618859-612x612.jpg',
      route: '/college'
    },
    {
      id: 'lycee',
      icon: <GraduationCap size={28} />,
      title: "Lycée",
      image: '/images/graduation-4502796_640.jpg',
      route: '/lycee'
    }
  ];

  // Features de l'école
  const features = [
    {
      icon: <Target size={32} />,
      title: "Excellence Académique",
      description: "Un programme éducatif rigoureux adapté aux standards internationaux pour garantir la réussite de chaque élève."
    },
    {
      icon: <Heart size={32} />,
      title: "Environnement Bienveillant",
      description: "Un cadre sécurisé et chaleureux où chaque enfant peut s'épanouir et développer sa personnalité."
    },
    {
      icon: <GraduationCap size={32} />,
      title: "Équipe Pédagogique",
      description: "Des enseignants qualifiés et passionnés, dédiés à l'accompagnement personnalisé de chaque élève."
    },
    {
      icon: <BookOpen size={32} />,
      title: "Innovation Pédagogique",
      description: "Des méthodes d'enseignement modernes intégrant les nouvelles technologies et les approches créatives."
    }
  ];

  // Cycles détaillés - UTILISANT LA STRUCTURE DE CYCLESPAGE
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

  // Informations de contact - MISE À JOUR AVEC LES ICÔNES DE CONTACTPAGE
  const contactInfo = [
    {
      icon: 'icons/google-maps.png',
      title: "Adresse",
      content: "130, Boulevard Ali Yaàta, Hay Al Mohammadi, Casablanca",
      color: "#3b82f6"
    },
    {
      icon: 'icons/telephone.png',
      title: "Téléphone",
      content: "+212 5 22 62 81 82",
      color: "#10b981"
    },
    {
      icon: 'icons/communication.png',
      title: "Email",
      content: "contact@kastler.ma",
      color: "#8b5cf6"
    },
    {
      icon: 'icons/schedule.png',
      title: "Horaires",
      content: "Lundi - Samedi: 07:00 - 17:00",
      color: "#f59e0b"
    }
  ];

  // Fonctions de navigation - REPRISES DE CYCLESPAGE
  const handleCardClick = (cycle) => {
    window.location.href = cycle.route;
  };

  const handleDiscoverClick = (e, cycle) => {
    e.stopPropagation();
    window.location.href = cycle.route;
  };

  const handleHeroCardClick = (card) => {
    window.location.href = card.route;
  };

  const styles = {
    // Hero Section Styles
    heroSection: {
      paddingTop: '5rem',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',   
      backgroundImage: 'url(images/abdo.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    },
    heroOverlay: {
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1
    },
    heroContent: {
      position: 'relative',
      zIndex: 2,
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    },
    cardsRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      flexWrap: 'wrap'
    },
    educationCard: {
      width: '250px',
      height: '180px',
      background: '#000',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      opacity: 0,
      transform: 'scale(0.9)',
      animation: 'fadeZoomIn 0.8s ease forwards'
    },
    cardImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease'
    },
    cardOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '20px',
      color: 'white'
    },
    cardIcon: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      width: '45px',
      height: '45px',
      background: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '	#9933CC',
      transition: 'all 0.3s ease'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center'
    },

    // Section Styles
    sectionContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    },
    sectionHeader: {
      textAlign: 'center',
      marginBottom: '4rem'
    },
    sectionTitle: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    },
    sectionSubtitle: {
      fontSize: '1.25rem',
      color: '#6b7280',
      maxWidth: '600px',
      margin: '0 auto'
    },

    // Features Section
    featuresSection: {
      padding: '6rem 0',
      backgroundColor: '#f9fafb'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem'
    },
    featureCard: {
      background: 'white',
      padding: '2rem',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease'
    },
    featureIcon: {
      width: '80px',
      height: '80px',
      background: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
      color: ' #4c1781',
      transition: 'transform 0.3s ease'
    },
    featureTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    },
    featureDescription: {
      color: '#6b7280',
      lineHeight: '1.6'
    },

    // Cycles Section - STYLES REPRIS DE CYCLESPAGE
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
    },

    // Stats Section
    statsSection: {
      padding: '4rem 0',
      backgroundColor: ' #4c1781'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.5rem'
    },
    statLabel: {
      color: '#d1d5db',
      fontSize: '1.1rem'
    },

    // Contact Section - STYLES MIS À JOUR DEPUIS CONTACTPAGE
    contactSection: {
      padding: '6rem 0',
      backgroundColor: '#f9fafb'
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem',
      marginBottom: '2rem'
    },
    contactInfoSection: {
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
      order: 2
    },
    contactTitle: {
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap'
    },
    contactDescription: {
      color: '#6b7280',
      fontSize: '1.1rem',
      lineHeight: '1.6',
      marginBottom: '2rem'
    },
    contactItems: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      marginBottom: '1.5rem',
      padding: '1rem',
      borderRadius: '12px',
      transition: 'all 0.3s'
    },
    contactIcon: {
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    contactText: {
      flex: 1,
      minWidth: 0
    },
    contactItemTitle: {
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.25rem',
      fontSize: 'clamp(0.875rem, 2vw, 1rem)'
    },
    contactContent: {
      color: '#6b7280',
      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
      wordBreak: 'break-word'
    },
    formSection: {
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
      order: 1
    },
    formTitle: {
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    formInput: {
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s',
      fontSize: '1rem',
      width: '100%',
      boxSizing: 'border-box'
    },
    formTextarea: {
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s',
      minHeight: '120px',
      resize: 'vertical',
      fontSize: '1rem',
      width: '100%',
      boxSizing: 'border-box'
    },
    formSelect: {
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s',
      fontSize: '1rem',
      backgroundColor: 'white',
      width: '100%',
      boxSizing: 'border-box'
    },
    submitButton: {
      background: 'linear-gradient(to right, #e60039, #8a2be2)',
      color: 'white',
      padding: '1rem 2rem',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontSize: '1rem',
      width: '100%'
    },
    statusMessage: {
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    successMessage: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      border: '1px solid #bbf7d0'
    },
    errorMessage: {
      backgroundColor: '#fecaca',
      color: '#991b1b',
      border: '1px solid #fca5a5'
    },
    section: {
      position: 'relative',
      backgroundColor: '#f4f4f4',
      padding: '100px 20px',
      textAlign: 'center',
      overflow: 'hidden',
    },
    bgText: {
      fontSize: '72px',
      fontWeight: 900,
      color: '#ddd',
      textTransform: 'uppercase',
      margin: 0,
      zIndex: 0,
    },
    frontText: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '28px',
      fontWeight: '700',
      color: '#222',
      margin: 0,
      zIndex: 1,
    }
  };

  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <section id="accueil" style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        
        <div style={styles.heroContent}>
          <div style={styles.cardsRow}>
            {educationCards.map((card, index) => (
              <div 
                key={card.id}
                style={{
                  ...styles.educationCard,
                  animationDelay: `${0.2 + index * 0.2}s`
                }}
                className="education-card"
                onClick={() => handleHeroCardClick(card)}
              >
                <img 
                  src={card.image} 
                  alt={card.title}
                  style={styles.cardImage}
                  className="card-image"
                />
                <div style={styles.cardOverlay}>
                  <div style={styles.cardIcon} className="card-icon">
                    {card.icon}
                  </div>
                  <h3 style={styles.cardTitle}>{card.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section style={styles.section}>
        <h1 style={styles.bgText}>Groupe Scolaire </h1>
        <h2 style={styles.frontText}>Alfred Kastler</h2>
      </section>

      <section className="kastler-about-section">
        <div className="kastler-container">
          <div className="kastler-image">
            <img
              src="images/abdo.png"
              alt="Groupe Scolaire Alfred Kastler"
              className="floating-image"
            />
          </div>

          <div className="kastler-text">
            <h1 className="kastler-subtitle">Groupe Scolaire</h1>
            <h2 className="kastler-title">Alfred Kastler Casablanca</h2>
            <p>
              Le Groupe Scolaire Alfred Kastler s'engage à offrir une éducation d'excellence,
              de la petite enfance jusqu'au lycée. Notre approche pédagogique innovante,
              encadrée par une équipe passionnée, permet à chaque élève de s'épanouir pleinement
              dans un environnement bienveillant, moderne et multiculturel.
            </p>
            <a href="/propos" className="kastler-button">Voir plus</a>
          </div>
        </div>
      </section>

      {/* Cycles Section - REMPLACÉE PAR CELLE DE CYCLESPAGE */}
      <section id="cycles" style={styles.cyclesSection}>
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

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.sectionContainer}>
          <div style={styles.statsGrid}>
            <div>
              <div style={styles.statNumber}>25+</div>
              <div style={styles.statLabel}>Années d'Excellence</div>
            </div>
            <div>
              <div style={styles.statNumber}>1200+</div>
              <div style={styles.statLabel}>Élèves Accompagnés</div>
            </div>
            <div>
              <div style={styles.statNumber}>95%</div>
              <div style={styles.statLabel}>Taux de Réussite</div>
            </div>
            <div>
              <div style={styles.statNumber}>50+</div>
              <div style={styles.statLabel}>Enseignants Qualifiés</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - REMPLACÉE PAR CELLE DE CONTACTPAGE */}
      <section id="contact" style={styles.contactSection}>
        <div style={styles.sectionContainer}>
          <div style={styles.contactGrid} className="contact-grid">
            {/* Contact Information */}
            <div style={styles.contactInfoSection} className="contact-info-section">
              <h2 style={styles.contactTitle}>
                <MapPin size={24} color="#6f42c1" />
                Informations de Contact
              </h2>
              <p style={styles.contactDescription}>
                Nous sommes à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos démarches d'inscription.
              </p>
              
              <div style={styles.contactItems}>
                {contactInfo.map((item, index) => (
                  <div 
                    key={index} 
                    style={styles.contactItem}
                    className="contact-item"
                  >
                    <div style={styles.contactIcon}>
                      {typeof item.icon === 'string' ? (
                        <img 
                          src={item.icon}
                          alt={item.title}
                          style={{
                            width: '38px',
                            height: '38px',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        React.cloneElement(item.icon, { color: 'white', size: 24 })
                      )}
                    </div>

                    <div style={styles.contactText}>
                      <div style={styles.contactItemTitle}>{item.title}</div>
                      <div style={styles.contactContent}>{item.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contact Form */}
            <div style={styles.formSection} className="form-section">
              <h3 style={styles.formTitle}>
                <MessageSquare size={24} color="#6f42c1" />
                Envoyez-nous un Message
              </h3>
              
              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div style={{...styles.statusMessage, ...styles.successMessage}}>
                  <CheckCircle size={20} />
                  Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div style={{...styles.statusMessage, ...styles.errorMessage}}>
                  <AlertCircle size={20} />
                  Erreur lors de l'envoi du message. Veuillez réessayer.
                </div>
              )}
              
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formRow} className="form-row">
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Prénom *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      style={styles.formInput}
                      className="form-input"
                      required
                      placeholder="Votre prénom"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nom *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      style={styles.formInput}
                      className="form-input"
                      required
                      placeholder="Votre nom"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div style={styles.formRow} className="form-row">
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={styles.formInput}
                      className="form-input"
                      required
                      placeholder="votre@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={styles.formInput}
                      className="form-input"
                      placeholder="+212 6 XX XX XX XX"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div style={styles.formRow} className="form-row">
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Cycle d'Intérêt</label>
                    <select
                      name="cycle"
                      value={formData.cycle}
                      onChange={handleInputChange}
                      style={styles.formSelect}
                      className="form-input"
                      disabled={isSubmitting}
                    >
                      <option value="">Sélectionnez un cycle</option>
                      <option value="creche">Crèche & Préscolaire</option>
                      <option value="primaire">École Primaire</option>
                      <option value="college">Collège</option>
                      <option value="lycee">Lycée</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Sujet *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      style={styles.formSelect}
                      className="form-input"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Choisir un sujet</option>
                      <option value="inscription">Demande d'Inscription</option>
                      <option value="information">Demande d'Information</option>
                      <option value="visite">Visite de l'École</option>
                      <option value="rendez-vous">Prise de Rendez-vous</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    style={styles.formTextarea}
                    className="form-textarea"
                    required
                    placeholder="Décrivez votre demande en détail..."
                    disabled={isSubmitting}
                  />
                </div>

                <button 
                  type="submit" 
                  style={styles.submitButton}
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Envoi en cours...</>
                  ) : (
                    <>
                      <Send size={20} />
                      Envoyer le Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />

      {/* Floating Action Buttons */}
      <ScrollToTop />
      <SocialFAB />

      <style jsx>{`
        .kastler-about-section {
          padding: 40px 0 20px;
          background-color: #fff;
        }

        .kastler-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .kastler-image {
          flex: 1 1 100%;
          margin: 0;
          padding: 0;
        }

        .kastler-image img {
          width: 100%;
          height: auto;
          border-radius: 20px;
          display: block;
          margin: 0 auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .kastler-text {
          flex: 1 1 100%;
          margin: 0;
          padding: 0;
          text-align: center;
        }

        .kastler-subtitle {
          color: #6b21a8;
          font-size: 16px;
          margin-top: 20px;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .kastler-title {
          font-size: 28px;
          font-weight: bold;
          color: #111;
          margin-bottom: 15px;
        }

        .kastler-text p {
          font-size: 16px;
          line-height: 1.7;
          color: #333;
          margin-bottom: 25px;
          padding: 0 10px;
        }

        .kastler-button {
          background-color: #6b21a8;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 30px;
          font-weight: bold;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }

        .kastler-button:hover {
          background-color: #4c1781;
        }

        /* Animation */
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.03);
          }
        }

        .floating-image {
          animation: float 3s ease-in-out infinite;
          transition: transform 0.3s ease;
        }

        .floating-image:hover {
          transform: scale(1.05);
        }

        @keyframes fadeZoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
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

        .education-card:hover {
          transform: scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .education-card:hover .card-image {
          transform: scale(1.1);
        }

        .education-card:hover .card-icon {
          background: white !important;
          color: red !important;
          transform: scale(1.1);
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        /* Contact Form Styles - MIS À JOUR DEPUIS CONTACTPAGE */
        .contact-item:hover {
          background-color: #f9fafb;
          transform: translateX(5px);
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input:disabled,
        .form-textarea:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        /* Styles pour les cycles - REPRIS DE CYCLESPAGE */
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

        /* Background images pour chaque cycle */
        .cycle-creche::before {
          background-image: url('images/child-315049_640.jpg');
        }

        .cycle-creche::after {
          background-color: #FF6B6BCC;
        }

        .cycle-primaire::before {
          background-image: url('images/istockphoto-1194312917-612x612.jpg');
        }

        .cycle-primaire::after {
          background-color: #4ECDC4CC;
        }
        
        .cycle-college::before {
          background-image: url('images/istockphoto-2184618859-612x612.jpg');
        }

        .cycle-college::after {
          background-color: #45B7D1CC;
        }

        .cycle-lycee::before {
          background-image: url('images/graduation-4502796_640.jpg');
        }

        .cycle-lycee::after {
          background-color: #96CEB4CC;
        }

        /* Responsive design */
        @media (min-width: 640px) {
          .form-row {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        
        @media (min-width: 768px) {
          .kastler-container {
            flex-wrap: nowrap;
            flex-direction: row;
            align-items: center;
          }

          .kastler-image,
          .kastler-text {
            flex: 1 1 50%;
            text-align: left;
          }

          .kastler-text p {
            padding: 0;
          }
        }
        
        @media (min-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 3rem !important;
          }
          .contact-info-section {
            order: 1 !important;
          }
          .form-section {
            order: 2 !important;
          }
        }

        @media (max-width: 992px) {
          .cycle-card {
            width: 50% !important;
            min-height: 75vh !important;
          }
        }

        @media (max-width: 768px) {
          .hero-buttons {
            flex-direction: column;
          }
          
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
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

          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .section-title {
            font-size: 2rem !important;
          }
          
          .contact-title {
            font-size: 2rem !important;
          }
        }

        @media (max-width: 480px) {
          .education-card {
            width: 95% !important;
            height: 160px !important;
          }
          
          .card-title {
            font-size: 16px !important;
          }
          
          .card-icon {
            width: 40px !important;
            height: 40px !important;
            top: 12px !important;
            right: 12px !important;
          }

          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .section-title {
            font-size: 2rem !important;
          }
          
          .contact-title {
            font-size: 2rem !important;
          }
        }

        @media (max-width: 1024px) {
          .education-card {
            width: 220px !important;
          }
        }

        @media (max-width: 768px) {
          .cards-row {
            flex-direction: column !important;
            align-items: center !important;
            gap: 15px !important;
          }
          
          .education-card {
            width: 90% !important;
            max-width: 350px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default KastlerHomepage;