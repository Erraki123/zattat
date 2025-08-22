import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  User,
  MessageSquare,
  Calendar,
  GraduationCap,
  Globe,
  Users,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Import components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import SocialFAB from '../components/SocialFAB';

const ContactPage = () => {
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
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

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
        
        // Auto-hide success message after 5 seconds
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

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    },
    heroSection: {
      paddingTop: '4rem',
      paddingBottom: '2rem',
      background: 'linear-gradient(to right, #2563eb, #7c3aed)',
      color: 'white',
      '@media (min-width: 768px)': {
        paddingTop: '5rem',
        paddingBottom: '3rem'
      },
      '@media (min-width: 1024px)': {
        paddingTop: '6rem',
        paddingBottom: '4rem'
      }
    },
    heroContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem',
      textAlign: 'center'
    },
    heroTitle: {
      fontSize: 'clamp(2rem, 5vw, 4rem)',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    heroSubtitle: {
      fontSize: 'clamp(1rem, 3vw, 1.5rem)',
      opacity: 0.9,
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6'
    },
    mainContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem'
    },
    contentGrid: {
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
    sectionTitle: {
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap'
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
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      flexShrink: 0
    },
    contactText: {
      flex: 1,
      minWidth: 0
    },
    contactTitle: {
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
    input: {
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s',
      fontSize: '1rem',
      width: '100%',
      boxSizing: 'border-box'
    },
    textarea: {
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
    select: {
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
          background: 'linear-gradient(to right, #e60039, #8a2be2)', // rouge vers violet

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
      heroContact: {
    backgroundImage: 'url("/images/istockphoto-968775400-612x612.jpg")', // غيّر الصورة حسب ما تريد

    
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '300px',
    position: 'relative',
    color: 'white'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end'
  },
  textBottom: {
    padding: '30px',
    width: '100%'
  },
  heroTitle: {
    fontSize: 'clamp(32px, 5vw, 48px)',
    fontWeight: 'bold',
    margin: 0,
    color: 'white'
  },
  heroBreadcrumb: {
    fontSize: 'clamp(14px, 2vw, 16px)',
    color: 'white',
    margin: '5px 0 0 0'
  },
  homeLink: {
    textDecoration: 'none',
    color: '#ff4d4d'
  },
    mapSection: {
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    },
    mapContainer: {
      borderRadius: '12px',
      overflow: 'hidden',
      height: '300px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  };

  // Responsive styles
  const responsiveStyles = `
    @media (min-width: 640px) {
      .form-row {
        grid-template-columns: 1fr 1fr !important;
      }
    }
    
    @media (min-width: 768px) {
      .main-content {
        padding: 3rem 1.5rem !important;
      }
      .section-padding {
        padding: 2rem !important;
      }
      .content-grid {
        margin-bottom: 3rem !important;
      }
      .map-container {
        height: 400px !important;
      }
    }
    
    @media (min-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr 1fr !important;
        gap: 3rem !important;
      }
      .contact-info-section {
        order: 1 !important;
      }
      .form-section {
        order: 2 !important;
      }
      .map-container {
        height: 500px !important;
      }
    }
    
    @media (min-width: 1280px) {
      .main-content {
        padding: 4rem 2rem !important;
      }
    }
  `;

  return (
    <div style={styles.container}  className="fade-in">
      <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />
      
      <Navbar />
      
      {/* Hero Section */}
      <section style={styles.heroContact}>
  <div style={styles.overlay}>
    <div style={styles.textBottom}>
      <h1 style={styles.heroTitle}>Contactez-Nous</h1>
      <p style={styles.heroBreadcrumb}>
        <a href="/" style={styles.homeLink}>Accueil</a>&nbsp;&gt;&nbsp;
        <span style={{ color: 'white' }}>Contactez-Nous</span>
      </p>
    </div>
  </div>
</section>


      <div style={styles.mainContent} className="main-content">
        {/* Contact Form and Info */}
        <div style={styles.contentGrid} className="content-grid">
          {/* Contact Information */}
         
<div style={styles.contactInfoSection} className="contact-info-section section-padding">
  <h2 style={styles.sectionTitle}>
    <MapPin size={24}color="#6f42c1" />
    Informations de Contact
  </h2>

  {contactInfo.map((item, index) => (
    <div 
      key={index} 
      style={styles.contactItem}
      className="contact-item"
    >
   <div style={{
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
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
        <div style={styles.contactTitle}>{item.title}</div>
        <div style={styles.contactContent}>{item.content}</div>
      </div>
    </div>
  ))}
</div>




          {/* Contact Form */}
          <div style={styles.formSection} className="form-section section-padding">
            <h2 style={styles.sectionTitle}>
              <MessageSquare size={24} color="#6f42c1"/>
              Envoyez-nous un Message
            </h2>
            
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
                    style={styles.input}
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
                    style={styles.input}
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
                    style={styles.input}
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
                    style={styles.input}
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
                    style={styles.select}
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
                    style={styles.select}
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
                  style={styles.textarea}
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

        {/* Google Maps */}
        <div style={styles.mapSection} className="section-padding">
          <h2 style={styles.sectionTitle}>
            <MapPin size={24}  color="#6f42c1" />
            Notre Localisation
          </h2>
          <div style={styles.mapContainer} className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.8567567567567!2d-7.5575343!3d33.5939934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd11bb4dc1b9%3A0xca30fb81460fbe3a!2sSchool%20Group%20Alfred%20Kastler!5e0!3m2!1sen!2sma!4v1690000000000!5m2!1sen!2sma"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Alfred Kastler School Location"
            />
          </div>
        </div>      <SocialFAB />

      </div>

      <Footer />
      <ScrollToTop />

      <style jsx>{`
        .contact-item:hover {
          background-color: #f9fafb;
          transform: translateX(5px);
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
      `}</style>
    </div>
  );
};

export default ContactPage;