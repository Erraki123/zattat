import React, { useState } from 'react';
import { 
  Share2, 
  MessageCircle, 
  Mail, 
  Phone,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter
} from 'lucide-react';

const SocialFAB = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com/alfredkastler',
      color: '#1877F2',
      icon: <Facebook size={20} />
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/alfredkastler',
      color: '#E4405F',
      icon: <Instagram size={20} />
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/school/alfred-kastler',
      color: '#0A66C2',
      icon: <Linkedin size={20} />
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@alfredkastler',
      color: '#FF0000',
      icon: <Youtube size={20} />
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/alfredkastler',
      color: '#1DA1F2',
      icon: <Twitter size={20} />
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/212522628182',
      color: '#25D366',
      icon: <MessageCircle size={20} />
    },
    {
      name: 'Email',
      url: 'mailto:contact@kastler.ma',
      color: '#6366F1',
      icon: <Mail size={20} />
    },
    {
      name: 'Téléphone',
      url: 'tel:+212522628182',
      color: '#059669',
      icon: <Phone size={20} />
    }
  ];

  const styles = {
    container: {
      position: 'fixed',
      left: '30px',
      bottom: '30px',
      zIndex: 1000
    },
    toggleButton: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
background: 'linear-gradient(to right, #e60039, #8a2be2)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
      fontSize: '20px'
    },
    menu: {
      position: 'absolute',
      bottom: '70px',
      left: '0',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? 'visible' : 'hidden',
      transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.3s ease'
    },
    menuItem: {
      marginBottom: '12px',
      transform: isOpen ? 'scale(1)' : 'scale(0.8)',
      transition: 'all 0.3s ease'
    },
    socialLink: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      color: 'white',
      textDecoration: 'none',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease'
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'transparent',
      zIndex: -1,
      display: isOpen ? 'block' : 'none'
    }
  };

  return (
    <>
      <div style={styles.container}>
        {/* Overlay to close menu when clicking outside */}
        <div style={styles.overlay} onClick={() => setIsOpen(false)} />
        
        {/* Social Menu */}
        <ul style={styles.menu}>
          {socialLinks.map((link, index) => (
            <li 
              key={link.name} 
              style={{
                ...styles.menuItem,
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
              }}
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...styles.socialLink,
                  backgroundColor: link.color
                }}
                className="social-link"
                title={link.name}
              >
                {link.icon}
              </a>
            </li>
          ))}
        </ul>

        {/* Toggle Button */}
        <button 
          style={styles.toggleButton}
          onClick={toggleMenu}
          className="fab-toggle"
          title="Partager"
        >
          <Share2 
            size={24} 
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </button>
      </div>

      <style jsx>{`
        .fab-toggle:hover {
          transform: scale(1.1) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important;
        }

        .social-link:hover {
          transform: scale(1.15) !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
        }

        @media (max-width: 768px) {
          .fab-container {
            left: 20px !important;
            bottom: 20px !important;
          }
          
          .fab-toggle {
            width: 55px !important;
            height: 55px !important;
          }
          
          .social-link {
            width: 45px !important;
            height: 45px !important;
          }
        }
      `}</style>
    </>
  );
};

export default SocialFAB;