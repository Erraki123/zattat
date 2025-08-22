import React, { useEffect, useRef } from 'react';
import { CheckCircle, Users, Heart, BookOpen, Palette, Shield, ExternalLink, Book, Calculator, Globe, Trophy } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import SocialFAB from '../components/SocialFAB';

const EcolePrimairePage = () => {
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
      
      <div className="ecole-page">
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
                <h2 className="main-title">École Primaire</h2>
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
                <h5 className="small-title">École Primaire</h5>
                <h3 className="title-style">
                  Acquisition des Fondamentaux avec une Pédagogie Moderne et Bienveillante
                </h3>
                
                <div className="mobile-image">
                  <img src="/images/deux.png" className="responsive-img" alt="École primaire" />
                </div>
                
                <p className="description-text">
                  Notre école primaire offre un environnement d'apprentissage stimulant où chaque enfant 
                  développe ses compétences fondamentales à travers une pédagogie moderne, interactive et respectueuse du rythme de chacun.
                </p>
                <p className="description-text">
                  Nous mettons l'accent sur l'acquisition solide des savoirs de base tout en développant 
                  l'autonomie, la créativité et l'esprit critique de nos élèves.
                </p>
                
                <div className="school-link">
                  <a href="https://ansari.ma" target="_blank" rel="noopener noreferrer" className="link-button">
                    <ExternalLink size={18} />
                    Visiter le site Al Ansari
                  </a>
                </div>
              </div>

              <div className="image-content">
                <img src="/images/deux.png" className="responsive-img" alt="Élèves en classe" />
              </div>
            </div>
          </div>
        </section>

        {/* Section Programmes Fondamentaux - WHITE */}
        <section 
          ref={addToRefs}
          className="fundamentals-section white-section"
        >
          <div className="container">
            <div className="content-row reverse">
              <div className="text-content">
                <h5 className="small-title">Programmes Fondamentaux</h5>
                <h3 className="title-style">
                  Les Piliers de l'Apprentissage
                </h3>
                
                <div className="mobile-image">
                  <img src="/images/raw.png" className="responsive-img" alt="Apprentissages fondamentaux" />
                </div>
                
                <div className="fundamentals-grid">
                  <div className="fundamental-item">
                    <div className="fundamental-icon">
                      <Book size={24} />
                    </div>
                    <h4>Maîtrise de la lecture et écriture</h4>
                    <p>Développement des compétences linguistiques essentielles pour la réussite scolaire</p>
                  </div>
                  
                  <div className="fundamental-item">
                    <div className="fundamental-icon">
                      <Calculator size={24} />
                    </div>
                    <h4>Mathématiques et sciences</h4>
                    <p>Apprentissage logique et méthodique des concepts mathématiques et scientifiques</p>
                  </div>
                  
                  <div className="fundamental-item">
                    <div className="fundamental-icon">
                      <Globe size={24} />
                    </div>
                    <h4>Langues étrangères</h4>
                    <p>Ouverture sur le monde à travers l'apprentissage du français et de l'anglais</p>
                  </div>
                  
                  <div className="fundamental-item">
                    <div className="fundamental-icon">
                      <Trophy size={24} />
                    </div>
                    <h4>Activités sportives et culturelles</h4>
                    <p>Développement physique et artistique pour un épanouissement complet</p>
                  </div>
                </div>
              </div>

              <div className="image-content">
                <img src="/images/raw.png" className="responsive-img" alt="Activités d'apprentissage" />
              </div>
            </div>
          </div>
        </section>

        {/* Section Méthodes Pédagogiques - GREY */}
        <section 
          ref={addToRefs}
          className="methods-section grey-section"
        >
          <div className="container">
            <div className="content-row">
              <div className="text-content">
                <h5 className="small-title">Pédagogie</h5>
                <h3 className="title-style">
                  Méthodes d'Enseignement Innovantes
                </h3>
                
                <div className="mobile-image">
                  <img src="/images/rowdy.png" className="responsive-img" alt="Méthodes pédagogiques" />
                </div>
                
                <ul className="services-list">
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Pédagogie différenciée adaptée au rythme de chaque élève</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Apprentissage par projets et manipulation</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Utilisation d'outils numériques éducatifs</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Travail en groupe et coopération</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Évaluation positive et formative</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Développement de l'autonomie et de la responsabilité</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Sorties éducatives et découvertes culturelles</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Soutien scolaire personnalisé</span>
                  </li>
                </ul>
              </div>

              <div className="image-content">
                <img src="/images/rowdy.png" className="responsive-img" alt="Classe interactive" />
              </div>
            </div>
          </div>
        </section>

        {/* Section Accompagnement et Suivi - WHITE */}
        <section 
          ref={addToRefs}
          className="support-section white-section"
        >
          <div className="container">
            <div className="content-row reverse">
              <div className="text-content">
                <h5 className="small-title">Accompagnement</h5>
                <h3 className="title-style">
                  Suivi Personnalisé et Développement Global
                </h3>
                
                <div className="mobile-image">
                  <img src="/images/aop.png" className="responsive-img" alt="Suivi personnalisé" />
                </div>
                
                <ul className="services-list">
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Évaluation continue des acquis et des progrès</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Communication régulière avec les familles</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Développement des compétences sociales et civiques</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Préparation à l'entrée au collège</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Activités de découverte des métiers</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Encadrement par une équipe qualifiée</span>
                  </li>
                  <li className="service-item">
                    <CheckCircle className="check-icon" size={20} />
                    <span>Environnement sécurisé et bienveillant</span>
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
                <img src="/images/aop.png" className="responsive-img" alt="Environnement éducatif" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <SocialFAB />
      <ScrollToTop />
      <Footer />

      <style jsx>{`
        .ecole-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

        /* Sections avec alternance white/grey */
        .white-section {
          background-color: #ffffff;
        }

        .grey-section {
          background-color: #f8f9fa;
        }

        /* Section header avec logos séparés */
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
        .fundamentals-section,
        .methods-section,
        .support-section {
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

        /* Grid des fondamentaux */
        .fundamentals-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }

        .fundamental-item {
          background: rgba(107, 33, 168, 0.02);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(107, 33, 168, 0.1);
          transition: all 0.3s ease;
        }

        .fundamental-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(107, 33, 168, 0.1);
          border-color: rgba(107, 33, 168, 0.2);
        }

        .fundamental-icon {
          background: linear-gradient(135deg, #6b21a8, #a855f7);
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .fundamental-item h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .fundamental-item p {
          font-size: 0.95rem;
          color: #666;
          line-height: 1.5;
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
          .ecole-page {
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
          .fundamentals-section,
          .methods-section,
          .support-section {
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

          .fundamentals-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .ecole-page {
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

          .fundamental-item {
            padding: 1rem;
          }

          .fundamental-icon {
            width: 40px;
            height: 40px;
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

export default EcolePrimairePage;