import React, { useEffect, useRef } from 'react';
import { CheckCircle, Users, Heart, BookOpen, Palette, Shield, ExternalLink, Book, Calculator, Globe, Trophy, Target, Microscope, Users2, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import SocialFAB from '../components/SocialFAB';

const CollegePage = () => {
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
      
      <div className="college-page">
      {/* Section d'en-tête avec logos séparés - WHITE */}
      <section 
        ref={addToRefs}
        className="header-section white-section"
      >
        <div className="container">
          <div className="header-content">
            {/* Logo et titre côte à côte */}
            <div className="title-logo-container">
              <div className="logo-container side-logo">
                <img src="/logo-ak.png" alt="Alfred Kastler" className="school-logo kastler-logo" />
              </div>
              <div className="title-container">
                <h2 className="main-title">Collège</h2>
                <div className="service-divider"></div>
                <div className="partnership-text">Excellence Éducative</div>
              </div>
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
              <h5 className="small-title">Collège Alfred Kastler</h5>
              <h3 className="title-style">
                Construction de la Personnalité et Approfondissement des Connaissances
              </h3>
              
              <div className="mobile-image">
                <img src="/images/adi.png" className="responsive-img" alt="Collège Alfred Kastler" />
              </div>
              
              <p className="description-text">
                Notre collège accompagne les élèves dans cette période charnière de leur parcours éducatif, 
                en favorisant l'épanouissement personnel et l'approfondissement des savoirs fondamentaux.
              </p>
              <p className="description-text">
                Nous proposons un environnement stimulant qui développe l'autonomie, l'esprit critique 
                et prépare efficacement nos collégiens aux défis du lycée et de l'enseignement supérieur.
              </p>
            </div>

            <div className="image-content">
              <img src="/images/adi.png" className="responsive-img" alt="Élèves collégiens" />
            </div>
          </div>
        </div>
      </section>

      {/* Section Programme National Enrichi - WHITE */}
      <section 
        ref={addToRefs}
        className="program-section white-section"
      >
        <div className="container">
          <div className="content-row reverse">
            <div className="text-content">
              <h5 className="small-title">Programme Enrichi</h5>
              <h3 className="title-style">
                Programme National Enrichi et Personnalisé
              </h3>
              
              <div className="mobile-image">
                <img src="/images/gfr.png" className="responsive-img" alt="Programme enrichi" />
              </div>
              
              <div className="program-grid">
                <div className="program-item">
                  <div className="program-icon">
                    <Book size={24} />
                  </div>
                  <h4>Disciplines fondamentales</h4>
                  <p>Français, mathématiques, sciences et langues vivantes avec approfondissement</p>
                </div>
                
                <div className="program-item">
                  <div className="program-icon">
                    <Microscope size={24} />
                  </div>
                  <h4>Sciences expérimentales</h4>
                  <p>Laboratoires équipés pour la physique, chimie et sciences de la vie</p>
                </div>
                
                <div className="program-item">
                  <div className="program-icon">
                    <Globe size={24} />
                  </div>
                  <h4>Ouverture internationale</h4>
                  <p>Langues étrangères renforcées et projets d'échanges culturels</p>
                </div>
                
                <div className="program-item">
                  <div className="program-icon">
                    <Palette size={24} />
                  </div>
                  <h4>Arts et expression</h4>
                  <p>Développement créatif à travers les arts plastiques, musique et théâtre</p>
                </div>
              </div>
            </div>

            <div className="image-content">
              <img src="/images/gfr.png" className="responsive-img" alt="Cours de sciences" />
            </div>
          </div>
        </div>
      </section>

      {/* Section Orientation et Projets - GREY */}
      <section 
        ref={addToRefs}
        className="orientation-section grey-section"
      >
        <div className="container">
          <div className="content-row">
            <div className="text-content">
              <h5 className="small-title">Orientation & Projets</h5>
              <h3 className="title-style">
                Orientation Personnalisée et Projets Interdisciplinaires
              </h3>
              
              <div className="mobile-image">
                <img src="/images/rocky.png" className="responsive-img" alt="Orientation et projets" />
              </div>
              
              <ul className="services-list">
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Accompagnement personnalisé dans le choix d'orientation</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Projets interdisciplinaires stimulants et innovants</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Ateliers de découverte des métiers et formations</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Développement de l'esprit d'initiative et de créativité</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Travail collaboratif et gestion de projets</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Participation à des concours académiques</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Sorties pédagogiques et visites d'entreprises</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Préparation aux certifications internationales</span>
                </li>
              </ul>
            </div>

            <div className="image-content">
              <img src="/images/rocky.png" className="responsive-img" alt="Projets étudiants" />
            </div>
          </div>
        </div>
      </section>

      {/* Section Préparation Lycée - WHITE */}
      <section 
        ref={addToRefs}
        className="preparation-section white-section"
      >
        <div className="container">
          <div className="content-row reverse">
            <div className="text-content">
              <h5 className="small-title">Préparation</h5>
              <h3 className="title-style">
                Préparation Optimale au Lycée et Excellence Académique
              </h3>
              
              <div className="mobile-image">
                <img src="/images/ty.png" className="responsive-img" alt="Préparation lycée" />
              </div>
              
              <ul className="services-list">
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Méthodes de travail avancées et organisation personnelle</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Développement de l'autonomie et du sens des responsabilités</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Préparation au brevet des collèges avec excellence</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Accompagnement vers les filières d'excellence du lycée</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Développement des compétences numériques avancées</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Formation à l'expression orale et à l'argumentation</span>
                </li>
                <li className="service-item">
                  <CheckCircle className="check-icon" size={20} />
                  <span>Suivi individualisé et soutien personnalisé</span>
                </li>
              </ul>

              <div className="contact-info">
                <h4 className="contact-title">Informations Alfred Kastler</h4>
                <p className="contact-detail">
                  <strong>Adresse :</strong> Boulevard Zerktouni, Quartier Gauthier, Casablanca
                </p>
                <p className="contact-detail">
                  <strong>Téléphone :</strong> +212 5 22 27 78 92
                </p>
                <p className="contact-detail">
                  <strong>Email :</strong> contact@kastler.ma
                </p>
                <div className="school-link">
                  <a href="/contact" className="link-button">
                    <Users size={18} />
                    Nous Contacter
                  </a>
                </div>
              </div>
            </div>

            <div className="image-content">
              <img src="/images/ty.png" className="responsive-img" alt="Excellence académique" />
            </div>
          </div>
        </div>
              </section>
      </div>

      <SocialFAB />
      <ScrollToTop />
      <Footer />

      <style jsx>{`
        .college-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

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
          justify-content: center;
          position: relative;
        }

        .title-logo-container {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: logoFloat 6s ease-in-out infinite;
        }

        .side-logo {
          animation-delay: 0s;
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
          text-align: left;
          flex: 1;
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
          margin: 0 0 1rem 0;
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
        .program-section,
        .orientation-section,
        .preparation-section {
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

        /* Grid des programmes */
        .program-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }

        .program-item {
          background: rgba(107, 33, 168, 0.02);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(107, 33, 168, 0.1);
          transition: all 0.3s ease;
        }

        .program-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(107, 33, 168, 0.1);
          border-color: rgba(107, 33, 168, 0.2);
        }

        .program-icon {
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

        .program-item h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .program-item p {
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
          .college-page {
            padding-top: 90px;
          }

          .header-section {
            padding: 3rem 0;
          }

          .header-content {
            flex-direction: column;
            gap: 2rem;
          }

          .title-logo-container {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .title-container {
            text-align: center;
          }

          .service-divider {
            margin: 0 auto 1rem;
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
            text-align: center;
          }

          .presentation-section,
          .program-section,
          .orientation-section,
          .preparation-section {
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

          .program-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .college-page {
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

          .program-item {
            padding: 1rem;
          }

          .program-icon {
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

export default CollegePage;