import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Menu,
  X,
  LogIn
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const styles = {
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
      color: '#111827',
      margin: 0
    },
    logoSubtitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: 0
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
background: 'linear-gradient(135deg, #C4204F 0%, #9326B8 100%)',
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
    }
  };

  return (
    <>
      <header style={styles.header}>
        <nav style={styles.navContainer}>
          <div style={styles.navContent}>
            {/* Logo */}
            <div style={styles.logo}>
            <div style={styles.logoIcon}>
  <img 
    src="/logo-ak.png" 
    alt="Logo Alfred Kastler" 
    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
  />
</div>

              <div style={styles.logoText}>
                <h1 style={styles.logoTitle}>Alfred Kastler</h1>
                <p style={styles.logoSubtitle}>Excellence Éducative</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="desktop-menu" style={styles.desktopMenu}>
              <a href="/" style={styles.menuLink} className="menu-link">Accueil</a>
              <a href="/propos" style={styles.menuLink} className="menu-link">À propos</a>


              <a href="/cycles" style={styles.menuLink} className="menu-link">Cycles</a>
              <a href="/Vie-Scolaire" style={styles.menuLink} className="menu-link">Vie Scolaire</a>
              <a href="/actualites" style={styles.menuLink} className="menu-link">Actualités</a>
             
              <a href="/contact" style={styles.menuLink} className="menu-link">Contact</a>
              <button 
                style={styles.loginBtn}
                className="login-btn"
                onClick={() => navigate('/login')}
                title="Se connecter"
              >
                <LogIn size={20} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              style={styles.mobileMenuBtn}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div style={styles.mobileMenu}>

              <a href="/" style={styles.mobileMenuLink} className="mobile-menu-link">Accueil</a>
              <a href="/propos" style={styles.mobileMenuLink} className="mobile-menu-link">À propos</a>

              <a href="/cycles" style={styles.mobileMenuLink} className="mobile-menu-link">Cycles</a>
              <a href="/Vie-Scolaire" style={styles.mobileMenuLink} className="mobile-menu-link">Vie Scolaire</a>
              <a href="/actualites" style={styles.mobileMenuLink} className="mobile-menu-link">Actualités</a>
              <a href="/contact" style={styles.mobileMenuLink} className="mobile-menu-link">Contact</a>
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

      <style jsx>{`
        .menu-link:hover {
          color: #2563eb;
        }

        .mobile-menu-link:hover {
          color: #2563eb;
        }

        .login-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 1024px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;