import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const styles = {
    button: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
background: 'linear-gradient(135deg, #e60039 0%, #8a2be2 100%)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
      zIndex: 1000,
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden',
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
    }
  };

  return (
    <>
      <button 
        style={styles.button}
        onClick={scrollToTop}
        className="scroll-to-top"
        title="Retour en haut"
      >
        <ChevronUp size={24} />
      </button>

      <style jsx>{`
        .scroll-to-top:hover {
          transform: scale(1.1) translateY(0) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important;
        }

        @media (max-width: 768px) {
          .scroll-to-top {
            bottom: 20px !important;
            right: 20px !important;
            width: 45px !important;
            height: 45px !important;
          }
        }
      `}</style>
    </>
  );
};

export default ScrollToTop;