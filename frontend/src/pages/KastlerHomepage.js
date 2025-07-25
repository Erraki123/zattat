import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Star,
  ChevronRight,
  Play,
  Calendar,
  Shield,
  Globe,
  Heart,
  Target,
  Menu,
  X,
  LogIn
} from 'lucide-react';

const KastlerHomepage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Excellence Éducative",
      subtitle: "De la crèche au lycée, nous accompagnons chaque élève vers la réussite",
      gradient: "linear-gradient(to right, #2563eb, #7c3aed, #4338ca)"
    },
    {
      title: "Innovation Pédagogique", 
      subtitle: "Méthodes modernes et technologies numériques au service de l'apprentissage",
      gradient: "linear-gradient(to right, #059669, #3b82f6, #7c3aed)"
    },
    {
      title: "Épanouissement Personnel",
      subtitle: "Un environnement bienveillant pour développer talents et personnalité",
      gradient: "linear-gradient(to right, #f43f5e, #ec4899, #7c3aed)"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Users size={32} />,
      title: "Encadrement Personnalisé",
      description: "Suivi individuel de chaque élève par une équipe pédagogique expérimentée"
    },
    {
      icon: <Globe size={32} />,
      title: "Multilinguisme",
      description: "Enseignement en français, arabe et anglais pour une ouverture internationale"
    },
    {
      icon: <Award size={32} />,
      title: "Excellence Académique",
      description: "Résultats exceptionnels aux examens nationaux et préparation universitaire"
    },
    {
      icon: <Heart size={32} />,
      title: "Environnement Bienveillant",
      description: "Cadre sécurisé et chaleureux favorisant l'épanouissement de chaque enfant"
    }
  ];

  const cycles = [
    {
      title: "Crèche & Préscolaire",
      age: "2-5 ans",
      description: "Éveil, socialisation et préparation aux apprentissages fondamentaux",
      gradient: "linear-gradient(to right, #f472b6, #f43f5e)",
      icon: <Heart size={24} />
    },
    {
      title: "École Primaire", 
      age: "6-11 ans",
      description: "Acquisition des fondamentaux : lecture, écriture, calcul et ouverture culturelle",
      gradient: "linear-gradient(to right, #60a5fa, #6366f1)",
      icon: <BookOpen size={24} />
    },
    {
      title: "Collège",
      age: "12-15 ans", 
      description: "Approfondissement des connaissances et développement de l'autonomie",
      gradient: "linear-gradient(to right, #4ade80, #059669)",
      icon: <Target size={24} />
    },
    {
      title: "Lycée",
      age: "16-18 ans",
      description: "Préparation au baccalauréat et orientation vers l'enseignement supérieur",
      gradient: "linear-gradient(to right, #a78bfa, #8b5cf6)", 
      icon: <GraduationCap size={24} />
    }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    },
    header: {
      background: 'white',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
      position: 'fixed',
      width: '100%',
      top: 0,
      zIndex: 50
    },
    navContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem'
    },
    navContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 0'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    logoIcon: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    },
    logoText: {
      display: 'flex',
      flexDirection: 'column'
    },
    logoTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#111827'
    },
    logoSubtitle: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    desktopMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem'
    },
    menuLink: {
      color: '#374151',
      fontWeight: '500',
      textDecoration: 'none',
      transition: 'color 0.3s',
      cursor: 'pointer'
    },
    loginBtn: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    mobileMenuBtn: {
      display: 'none',
      padding: '0.5rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer'
    },
    mobileMenu: {
      background: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '0.5rem'
    },
    mobileMenuLink: {
      display: 'block',
      padding: '0.5rem 0.75rem',
      color: '#374151',
      textDecoration: 'none',
      borderRadius: '0.25rem',
      transition: 'color 0.3s'
    },
    heroSection: {
      paddingTop: '5rem',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    heroBackground: {
      position: 'absolute',
      inset: 0,
      background: slides[currentSlide].gradient,
      transition: 'all 1s ease-in-out'
    },
    heroOverlay: {
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)'
    },
    heroContent: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem',
      textAlign: 'center',
      color: 'white'
    },
    heroInner: {
      maxWidth: '896px',
      margin: '0 auto'
    },
    heroTitle: {
      fontSize: 'clamp(3rem, 8vw, 7rem)',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      opacity: 0,
      animation: 'fadeIn 1s ease-out forwards'
    },
    heroSubtitle: {
      fontSize: 'clamp(1.25rem, 4vw, 2rem)',
      marginBottom: '2rem',
      opacity: 0.9
    },
    heroButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      justifyContent: 'center'
    },
    heroBtn1: {
      background: 'white',
      color: '#111827',
      padding: '1rem 2rem',
      borderRadius: '9999px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '1rem'
    },
    heroBtn2: {
      border: '2px solid white',
      background: 'transparent',
      color: 'white',
      padding: '1rem 2rem',
      borderRadius: '9999px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '1rem'
    },
    slideIndicators: {
      position: 'absolute',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '0.5rem'
    },
    slideIndicator: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    featuresSection: {
      padding: '5rem 0',
      backgroundColor: 'white'
    },
    sectionContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem'
    },
    sectionHeader: {
      textAlign: 'center',
      marginBottom: '4rem'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    },
    sectionSubtitle: {
      fontSize: '1.25rem',
      color: '#6b7280',
      maxWidth: '768px',
      margin: '0 auto'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem'
    },
    featureCard: {
      textAlign: 'center',
      transition: 'transform 0.3s'
    },
    featureIcon: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
      color: 'white',
      transition: 'all 0.3s'
    },
    featureTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.75rem'
    },
    featureDescription: {
      color: '#6b7280'
    },
    cyclesSection: {
      padding: '5rem 0',
      backgroundColor: '#f9fafb'
    },
    cyclesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem'
    },
    cycleCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s'
    },
    cycleIcon: {
      width: '64px',
      height: '64px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      marginBottom: '1rem'
    },
    cycleTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.5rem'
    },
    cycleAge: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.75rem',
      fontWeight: '500'
    },
    cycleDescription: {
      color: '#6b7280',
      marginBottom: '1rem'
    },
    cycleLink: {
      color: '#2563eb',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      transition: 'color 0.3s'
    },
    statsSection: {
      padding: '5rem 0',
      background: 'linear-gradient(to right, #2563eb, #7c3aed, #4338ca)',
      color: 'white'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '1.125rem',
      opacity: 0.9
    },
    contactSection: {
      padding: '5rem 0',
      backgroundColor: 'white'
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '3rem',
      alignItems: 'center'
    },
    contactInfo: {
      marginBottom: '2rem'
    },
    contactTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem'
    },
    contactDescription: {
      fontSize: '1.25rem',
      color: '#6b7280',
      marginBottom: '2rem'
    },
    contactItems: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center'
    },
    contactIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem'
    },
    contactForm: {
      backgroundColor: '#f9fafb',
      borderRadius: '16px',
      padding: '2rem'
    },
    formTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1rem'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.3s'
    },
    formTextarea: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      outline: 'none',
      resize: 'vertical',
      minHeight: '100px',
      transition: 'border-color 0.3s'
    },
    formButton: {
      width: '100%',
      background: 'linear-gradient(to right, #2563eb, #7c3aed)',
      color: 'white',
      padding: '0.75rem',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    footer: {
      backgroundColor: '#111827',
      color: 'white',
      padding: '3rem 0'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem'
    },
    footerSection: {
      marginBottom: '1rem'
    },
    footerTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1rem'
    },
    footerLinks: {
      listStyle: 'none',
      padding: 0
    },
    footerLink: {
      color: '#9ca3af',
      textDecoration: 'none',
      display: 'block',
      padding: '0.25rem 0',
      transition: 'color 0.3s'
    },
    footerBottom: {
      borderTop: '1px solid #374151',
      marginTop: '2rem',
      paddingTop: '2rem',
      textAlign: 'center',
      color: '#9ca3af'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <nav style={styles.navContainer}>
          <div style={styles.navContent}>
            {/* Logo */}
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <GraduationCap size={28} />
              </div>
              <div style={styles.logoText}>
                <h1 style={styles.logoTitle}>Alfred Kastler</h1>
                <p style={styles.logoSubtitle}>Excellence Éducative</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div style={{...styles.desktopMenu, display: window.innerWidth >= 1024 ? 'flex' : 'none'}}>
              <a href="#accueil" style={styles.menuLink}>Accueil</a>
              <a href="#cycles" style={styles.menuLink}>Cycles</a>
              <a href="#vie-scolaire" style={styles.menuLink}>Vie Scolaire</a>
              <a href="#actualites" style={styles.menuLink}>Actualités</a>
              <a href="#contact" style={styles.menuLink}>Contact</a>
              <button 
                style={styles.loginBtn}
                onClick={() => navigate('/login')}
                title="Se connecter"
              >
                <LogIn size={20} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              style={{...styles.mobileMenuBtn, display: window.innerWidth < 1024 ? 'block' : 'none'}}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div style={styles.mobileMenu}>
              <a href="#accueil" style={styles.mobileMenuLink}>Accueil</a>
              <a href="#cycles" style={styles.mobileMenuLink}>Cycles</a>
              <a href="#vie-scolaire" style={styles.mobileMenuLink}>Vie Scolaire</a>
              <a href="#actualites" style={styles.mobileMenuLink}>Actualités</a>
              <a href="#contact" style={styles.mobileMenuLink}>Contact</a>
              <button 
                style={{...styles.loginBtn, width: '100%', marginTop: '0.5rem', borderRadius: '8px'}}
                onClick={() => navigate('/login')}
              >
                <LogIn size={20} style={{marginRight: '0.5rem'}} />
                Se connecter
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroBackground}>
          <div style={styles.heroOverlay}></div>
        </div>
        
        <div style={styles.heroContent}>
          <div style={styles.heroInner}>
            <h1 style={styles.heroTitle}>
              {slides[currentSlide].title}
            </h1>
            <p style={styles.heroSubtitle}>
              {slides[currentSlide].subtitle}
            </p>
            <div style={styles.heroButtons}>
              <button style={styles.heroBtn1}>
                Découvrir nos Cycles
              </button>
              <button style={styles.heroBtn2}>
                Visite Virtuelle
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div style={styles.slideIndicators}>
          {slides.map((_, index) => (
            <button
              key={index}
              style={{
                ...styles.slideIndicator,
                backgroundColor: index === currentSlide ? 'white' : 'rgba(255, 255, 255, 0.5)'
              }}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Pourquoi Choisir Alfred Kastler ?</h2>
            <p style={styles.sectionSubtitle}>
              Depuis notre création, nous nous engageons à offrir une éducation d'excellence dans un environnement stimulant et bienveillant.
            </p>
          </div>

          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} style={styles.featureCard}>
                <div style={styles.featureIcon}>
                  {feature.icon}
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cycles Section */}
      <section id="cycles" style={styles.cyclesSection}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Nos Cycles d'Enseignement</h2>
            <p style={styles.sectionSubtitle}>Un parcours éducatif complet de la petite enfance au baccalauréat</p>
          </div>

          <div style={styles.cyclesGrid}>
            {cycles.map((cycle, index) => (
              <div key={index} style={styles.cycleCard}>
                <div style={{...styles.cycleIcon, background: cycle.gradient}}>
                  {cycle.icon}
                </div>
                <h3 style={styles.cycleTitle}>{cycle.title}</h3>
                <p style={styles.cycleAge}>{cycle.age}</p>
                <p style={styles.cycleDescription}>{cycle.description}</p>
                <a href="#" style={styles.cycleLink}>
                  En savoir plus <ChevronRight size={16} style={{marginLeft: '0.25rem'}} />
                </a>
              </div>
            ))}
          </div>
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

      {/* Contact Info */}
      <section style={styles.contactSection}>
        <div style={styles.sectionContainer}>
          <div style={styles.contactGrid}>
            <div>
              <h2 style={styles.contactTitle}>Contactez-Nous</h2>
              <p style={styles.contactDescription}>
                Nous sommes à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos démarches d'inscription.
              </p>
              
              <div style={styles.contactItems}>
                <div style={styles.contactItem}>
                  <div style={{...styles.contactIcon, backgroundColor: '#dbeafe'}}>
                    <MapPin size={24} color="#2563eb" />
                  </div>
                  <div>
                    <p style={{fontWeight: '600', color: '#111827'}}>Adresse</p>
                    <p style={{color: '#6b7280'}}>130, Boulevard Ali Yaàta, Hay Al Mohammadi, Casablanca</p>
                  </div>
                </div>
                
                <div style={styles.contactItem}>
                  <div style={{...styles.contactIcon, backgroundColor: '#dcfce7'}}>
                    <Phone size={24} color="#059669" />
                  </div>
                  <div>
                    <p style={{fontWeight: '600', color: '#111827'}}>Téléphone</p>
                    <p style={{color: '#6b7280'}}>+212 5 22 62 81 82</p>
                  </div>
                </div>
                
                <div style={styles.contactItem}>
                  <div style={{...styles.contactIcon, backgroundColor: '#f3e8ff'}}>
                    <Mail size={24} color="#7c3aed" />
                  </div>
                  <div>
                    <p style={{fontWeight: '600', color: '#111827'}}>Email</p>
                    <p style={{color: '#6b7280'}}>contact@kastler.ma</p>
                  </div>
                </div>
                
                <div style={styles.contactItem}>
                  <div style={{...styles.contactIcon, backgroundColor: '#fed7aa'}}>
                    <Clock size={24} color="#ea580c" />
                  </div>
                  <div>
                    <p style={{fontWeight: '600', color: '#111827'}}>Horaires</p>
                    <p style={{color: '#6b7280'}}>Lun - Sam: 07:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={styles.contactForm}>
              <h3 style={styles.formTitle}>Demande d'Information</h3>
              <div>
                <div style={styles.formRow}>
                  <input 
                    type="text" 
                    placeholder="Nom" 
                    style={styles.formInput}
                  />
                  <input 
                    type="text" 
                    placeholder="Prénom" 
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <input 
                    type="tel" 
                    placeholder="Téléphone" 
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <select style={styles.formInput}>
                    <option>Cycle souhaité</option>
                    <option>Crèche & Préscolaire</option>
                    <option>École Primaire</option>
                    <option>Collège</option>
                    <option>Lycée</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <textarea 
                    placeholder="Votre message" 
                    style={styles.formTextarea}
                  ></textarea>
                </div>
                <button style={styles.formButton}>
                  Envoyer la Demande
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.sectionContainer}>
          <div style={styles.footerGrid}>
            <div>
              <div style={styles.logo}>
                <div style={{...styles.logoIcon, width: '40px', height: '40px'}}>
                  <GraduationCap size={24} />
                </div>
                <div style={styles.logoText}>
                  <h3 style={{fontSize: '1.125rem', fontWeight: 'bold'}}>Alfred Kastler</h3>
                  <p style={{fontSize: '0.875rem', color: '#9ca3af'}}>Excellence Éducative</p>
                </div>
              </div>
              <p style={{color: '#9ca3af', marginTop: '1rem'}}>
                Groupe scolaire d'excellence situé à Casablanca, offrant un parcours éducatif complet de la crèche au lycée.
              </p>
            </div>
            
            <div>
              <h4 style={styles.footerTitle}>Cycles</h4>
              <ul style={styles.footerLinks}>
                <li><a href="#" style={styles.footerLink}>Crèche & Préscolaire</a></li>
                <li><a href="#" style={styles.footerLink}>École Primaire</a></li>
                <li><a href="#" style={styles.footerLink}>Collège</a></li>
                <li><a href="#" style={styles.footerLink}>Lycée</a></li>
              </ul>
            </div>
            
            <div>
              <h4 style={styles.footerTitle}>Services</h4>
              <ul style={styles.footerLinks}>
                <li><a href="#" style={styles.footerLink}>Transport Scolaire</a></li>
                <li><a href="#" style={styles.footerLink}>Restauration</a></li>
                <li><a href="#" style={styles.footerLink}>Activités Périscolaires</a></li>
                <li><a href="#" style={styles.footerLink}>Soutien Scolaire</a></li>
              </ul>
            </div>
            
            <div>
              <h4 style={styles.footerTitle}>Contact</h4>
              <div style={{color: '#9ca3af'}}>
                <p>130, Bd Ali Yaàta</p>
                <p>Hay Al Mohammadi, Casablanca</p>
                <p>+212 5 22 62 81 82</p>
                <p>contact@kastler.ma</p>
              </div>
            </div>
          </div>
          
          <div style={styles.footerBottom}>
            <p>&copy; 2025 Groupe Scolaire Alfred Kastler. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .hero-title {
          animation: fadeIn 1s ease-out forwards;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.1);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .cycle-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .hero-btn1:hover {
          transform: scale(1.05);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .hero-btn2:hover {
          background: white;
          color: #111827;
        }

        .login-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.2);
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-button:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        }

        .menu-link:hover {
          color: #2563eb;
        }

        .mobile-menu-link:hover {
          color: #2563eb;
        }

        .cycle-link:hover {
          color: #1d4ed8;
        }

        .footer-link:hover {
          color: white;
        }

        @media (max-width: 1024px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }

        @media (max-width: 768px) {
          .hero-buttons {
            flex-direction: column;
          }
          
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          
          .form-row {
            grid-template-columns: 1fr !important;
          }
          
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          
          .cycles-grid {
            grid-template-columns: 1fr !important;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .hero-title {
            font-size: 3rem !important;
          }
          
          .hero-subtitle {
            font-size: 1.25rem !important;
          }
          
          .section-title {
            font-size: 2rem !important;
          }
          
          .contact-title {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default KastlerHomepage;