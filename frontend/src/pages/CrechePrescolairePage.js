import React, { useEffect, useRef } from 'react';
import { CheckCircle, Users, Heart, BookOpen, Palette, Shield, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import SocialFAB from '../components/SocialFAB';

const CrechePrescolairePage = () => {
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="creche-page">
        {/* Section d'en-tête avec logos séparés - WHITE */}
        <section 
          ref={addToRefs}
          className="header-section white-section"
        >
          <div className="container">
            <div className="header-content">
              {/* Logo Al Ansari à gauche */}
              <div className="logo-container left-logo">
                <img src="/images/rt.png" alt="Al Ansari" className="school-logo ansari-logo" />
                <div className="logo-label">Al Ansari</div>
              </div>

              {/* Titre central avec animation */}
              <div className="title-container">
                <h2 className="main-title">Crèche & Préscolaire</h2>
                <div className="service-divider"></div>
                <div className="partnership-text">Partenariat Éducatif</div>
              </div>

              {/* Logo Alfred Kastler à droite */}
              <div className="logo-container right-logo">
                <img src="/logo-ak.png" alt="Alfred Kastler" className="school-logo kastler-logo" />
                <div className="logo-label">Alfred Kastler</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Introduction - GREY */}
        <section 
          ref={addToRefs}
          className="presentation-section grey-section"
        >
          <div className="container">
            <div className="content-row">
              <div className="text-content">
                <h5 className="small-title">Partenariat Éducatif</h5>
                <h3 className="title-style">
                  Un Environnement Sécurisé pour les Premiers Apprentissages
                </h3>
                
                <div className="mobile-image">
                  <img src="/images/deux.png" className="responsive-img" alt="Crèche et préscolaire" />
                </div>
                
                <p className="description-text">
                  Grâce à notre partenariat avec le Groupe Scolaire Al Ansari, nous offrons un environnement 
                  sécurisé et stimulant pour les premiers apprentissages de vos enfants, de la crèche jusqu'au préscolaire.
                </p>
                <p className="description-text">
                  Une approche pédagogique moderne qui respecte le rythme de chaque enfant et favorise 
                  son épanouissement personnel dans un cadre bienveillant.
                </p>
                
                <div className="school-link">
                  <a href="https://ansari.ma" target="_blank" rel="noopener noreferrer" className="link-button">
                    <ExternalLink size={18} />
                    Visiter le site Al Ansari
                  </a>
                </div>
              </div>

              <div className="image-content">
                <img src="/images/deux.png" className="responsive-img" alt="Enfants en apprentissage" />
              </div>
            </div>
          </div>
        </section>

        {/* Section Nos Services - WHITE */}
        <section 
          ref={addToRefs}
          className="services-section white-section"
        >
          <div className="container">
            <div className="content-row reverse">
              <div className="text-content">
                <h5 className="small-title">Services</h5>
                <h3 className="title-style">
                  Nos Programmes Éducatifs
                </h3>
                
                <div className="mobile-image">
                  <img src="/images/services.png" className="responsive-img" alt="Programmes éducatifs" />
                </div>
                
                <ul className="services-list">
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Développement de la motricité fine et globale</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Éveil artistique et créatif</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Socialisation et développement de l'autonomie</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Apprentissage ludique des bases (lecture, écriture, mathématiques)</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Activités sensorielles et découverte du monde</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Initiation aux langues (arabe, français, anglais)</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Activités physiques adaptées à l'âge</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Suivi personnalisé de chaque enfant</span>
                  </li>
                </ul>
              </div>

              <div className="image-content">
                <img src="/images/services.png" className="responsive-img" alt="Activités créatives" />
              </div>
            </div>
          </div>
        </section>

        {/* Section Compétences Complémentaires - GREY */}
        <section 
          ref={addToRefs}
          className="complementary-section grey-section"
        >
          <div className="container">
            <div className="content-row">
              <div className="text-content">
                <h5 className="small-title">Accompagnement</h5>
                <h3 className="title-style">
                  Compétences Complémentaires
                </h3>
                
                <div className="mobile-image">
                  <img src="/images/rtz.png" className="responsive-img" alt="Accompagnement personnalisé" />
                </div>
                
                <ul className="services-list">
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Accompagnement des familles dans l'éducation</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Gestion des transitions (maison-école)</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Développement de l'intelligence émotionnelle</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Préparation à l'entrée en primaire</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Activités périscolaires enrichissantes</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Suivi médical et nutritionnel</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Communication régulière avec les parents</span>
                  </li>
                </ul>

                <div className="contact-info">
                  <h4 className="contact-title">Informations Al Ansari</h4>
                  <p className="contact-detail">
                    <strong>Adresse :</strong> Hay Smara – Rue N°4, Hay Mohammadi, Casablanca
                  </p>
                  <p className="contact-detail">
                    <strong>Téléphone :</strong> +212 5 22 62 81 82
                  </p>
                  <p className="contact-detail">
                    <strong>Email :</strong> administration@ansari.ma
                  </p>
                  <div className="school-link">
                    <a href="https://ansari.ma" target="_blank" rel="noopener noreferrer" className="link-button">
                      <ExternalLink size={18} />
                      Site Web Al Ansari
                    </a>
                  </div>
                </div>
              </div>

              <div className="image-content">
                <img src="/images/rtz.png" className="responsive-img" alt="Environnement scolaire" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <SocialFAB />
      <ScrollToTop />
      <Footer />

      <style jsx>{`
        .creche-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Sections avec alternance white/grey */
        .white-section {
          background-color: #ffffff;
        }

        .grey-section {
          background-color: #f8f9fa;
        }

        /* Nouvelle section header avec logos séparés */
        .header-section {
          padding: 4rem 0;
          position: relative;
          overflow: hidden;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: logoFloat 6s ease-in-out infinite;
        }

        .left-logo {
          animation-delay: 0s;
        }

        .right-logo {
          animation-delay: 3s;
        }

        .school-logo {
          width: 120px;
          height: 80px;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          background: white;
          padding: 10px;
        }

        .school-logo:hover {
          transform: translateY(-10px) scale(1.05);
          box-shadow: 0 15px 40px rgba(107, 33, 168, 0.2);
        }

        .logo-label {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #6b21a8;
          text-align: center;
        }

        .title-container {
          text-align: center;
          flex: 1;
          margin: 0 2rem;
        }

        .main-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: titleSlideIn 1s ease-out;
        }

        .service-divider {
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #6b21a8, #a855f7);
          margin: 0 auto 1rem;
          border-radius: 2px;
          animation: dividerExpand 1.2s ease-out;
        }

        .partnership-text {
          color: #666;
          font-size: 1.1rem;
          font-weight: 500;
          animation: textFadeIn 1.5s ease-out;
        }

        /* Animations */
        @keyframes logoFloat {
          0%, 100% { 
            transform: translateY(0px);
          }
          50% { 
            transform: translateY(-15px);
          }
        }

        @keyframes titleSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dividerExpand {
          0% {
            width: 0;
          }
          100% {
            width: 60px;
          }
        }

        @keyframes textFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Sections principales */
        .presentation-section,
        .services-section,
        .complementary-section {
          padding: 4rem 0;
        }

        /* Contenu */
        .content-row {
          display: flex;
          align-items: center;
          gap: 3rem;
        }

        .content-row.reverse {
          flex-direction: row-reverse;
        }

        .text-content {
          flex: 1;
        }

        .image-content {
          flex: 1;
        }

        .small-title {
          color: #6b21a8;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .title-style {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }

        .description-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
          margin-bottom: 1rem;
        }

        .responsive-img {
          width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
        }

        .mobile-image {
          display: none;
          margin-bottom: 1.5rem;
        }

        /* Lien vers le site */
        .school-link {
          margin-top: 1.5rem;
        }

        .link-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #6b21a8, #a855f7);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(107, 33, 168, 0.3);
        }

        .link-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(107, 33, 168, 0.4);
          background: linear-gradient(135deg, #7c3aed, #c084fc);
        }

        /* Listes de services */
        .services-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .service-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 0.75rem;
        }

        .check-icon {
          color: #6b21a8;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .service-item span {
          font-size: 1rem;
          line-height: 1.6;
          color: #555;
        }

        /* Informations de contact */
        .contact-info {
          background: rgba(107, 33, 168, 0.05);
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 2rem;
          border-left: 4px solid #6b21a8;
        }

        .contact-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }

        .contact-detail {
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
          color: #555;
        }

        .contact-detail strong {
          color: #333;
        }

        /* Animations */
        .animated-section {
          opacity: 0;
          transform: translateY(50px);
          transition: opacity 1.2s ease-out, transform 1.2s ease-out;
        }

        .animated-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .animated-section:nth-child(1) { transition-delay: 0.2s; }
        .animated-section:nth-child(2) { transition-delay: 0.4s; }
        .animated-section:nth-child(3) { transition-delay: 0.6s; }
        .animated-section:nth-child(4) { transition-delay: 0.8s; }

        /* Responsive Design */
        @media (max-width: 768px) {
          .creche-page {
            padding-top: 90px;
          }

          .header-section {
            padding: 3rem 0;
          }

          .header-content {
            flex-direction: column;
            gap: 2rem;
          }

          .logo-container {
            flex-direction: row;
            gap: 1rem;
          }

          .school-logo {
            width: 80px;
            height: 60px;
          }

          .main-title {
            font-size: 1.6rem;
            margin-bottom: 0.5rem;
          }

          .service-divider {
            width: 40px;
            margin-bottom: 0.5rem;
          }

          .partnership-text {
            font-size: 1rem;
          }

          .title-container {
            margin: 0;
          }

          .presentation-section,
          .services-section,
          .complementary-section {
            padding: 3rem 0;
          }

          .content-row,
          .content-row.reverse {
            flex-direction: column;
            gap: 1.5rem;
          }

          .image-content {
            display: none;
          }

          .mobile-image {
            display: block;
          }

          .title-style {
            font-size: 1.5rem;
            text-align: left;
          }

          .small-title {
            text-align: left;
          }

          .container {
            padding: 0 15px;
          }

          .text-content {
            padding: 0 10px;
          }
        }

        @media (max-width: 480px) {
          .creche-page {
            padding-top: 80px;
          }

          .header-section {
            padding: 2rem 0;
          }

          .school-logo {
            width: 60px;
            height: 45px;
          }

          .main-title {
            font-size: 1.4rem;
          }

          .title-style {
            font-size: 1.3rem;
          }

          .description-text,
          .service-item span {
            font-size: 1rem;
          }

          .logo-label {
            font-size: 0.8rem;
          }
        }

        @media (min-width: 992px) {
          .header-section {
            padding: 5rem 0;
          }

          .main-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default CrechePrescolairePage;