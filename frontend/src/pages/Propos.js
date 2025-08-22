import React from 'react';
import { 
  Target, 
  Handshake, 
  CheckCircle, 
  Users, 
  GraduationCap, 
  Laptop, 
  Clock, 
  Globe, 
  UserCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import SocialFAB from '../components/SocialFAB';

const Propos = () => {
  // Suppression des animations au scroll

  return (
    <>
      <Navbar />
      
      <style jsx>{`
        /* Styles généraux */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .section-padding {
          padding: 60px 0;
        }

        .section-padding-sm {
          padding: 40px 0;
        }

        /* Typography */
        .small-title {
          color: #4c1781;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        .title-style {
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .section-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #666;
          margin-bottom: 20px;
        }

        /* Layout */
        .row {
          display: flex;
          flex-wrap: wrap;
          margin: -15px;
        }

        .col-half {
          flex: 0 0 50%;
          padding: 15px;
        }

        .col-full {
          flex: 0 0 100%;
          padding: 15px;
        }

        .align-center {
          align-items: center;
        }

        .text-center {
          text-align: center;
        }

        .order-1 { order: 1; }
        .order-2 { order: 2; }

        /* Images */
        .img-fluid {
          max-width: 100%;
          height: auto;
        }

        .radius-image {
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        /* Buttons */
        .btn-primary {
          background-color: #4c1781;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 25px;
          font-weight: bold;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background-color: #3d1165;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(76, 23, 129, 0.3);
        }

        /* Lists */
        .feature-list {
          list-style: none;
          padding: 0;
          margin: 20px 0;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 15px;
          padding: 10px 0;
        }

        .feature-icon {
          color: #4c1781;
          margin-right: 15px;
          margin-top: 2px;
          min-width: 20px;
        }

        .feature-text {
          flex: 1;
        }

        .feature-text strong {
          font-weight: 600;
          color: #333;
        }

        /* Grid pour les niveaux - SUPPRIMÉ */

        /* Section spécifiques */
        .mission-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .mission-content h4 {
          color: #4c1781;
          font-size: 1.5rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }

        .mission-content h4 i {
          margin-right: 10px;
        }

        /* Fade in animation */
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

        /* Mobile First - Responsive */
        @media (max-width: 768px) {
          .container {
            padding: 0 15px;
          }

          .section-padding {
            padding: 40px 0;
          }

          .title-style {
            font-size: 2rem;
          }

          .col-half {
            flex: 0 0 100%;
          }

          .row {
            margin: -10px;
          }

          .col-half, .col-full {
            padding: 10px;
          }

          .order-mobile-1 { order: 1; }
          .order-mobile-2 { order: 2; }

          .levels-grid {
            display: none; /* Section supprimée */
          }

          .feature-item {
            margin-bottom: 12px;
          }

          .hide-mobile {
            display: none;
          }

          .show-mobile {
            display: block;
            margin-bottom: 20px;
          }
        }

        @media (min-width: 769px) {
          .hide-desktop {
            display: none;
          }

          .show-mobile {
            display: none;
          }
        }

        /* Espacement */
        .mb-2 { margin-bottom: 10px; }
        .mb-3 { margin-bottom: 20px; }
        .mb-4 { margin-bottom: 30px; }
        .mb-5 { margin-bottom: 40px; }
        
        .mt-3 { margin-top: 20px; }
        .mt-4 { margin-top: 30px; }
      `}</style>

      {/* Hero Section */}
      <section style={{
        backgroundImage: 'url("/images/contact-banner.jpg")',

        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '300px',
        position: 'relative',
        color: 'white'
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end'
        }}>
          <div style={{
            padding: '30px',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 'bold',
              margin: 0,
              color: 'white'
            }}>À Propos</h1>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'white',
              margin: '5px 0 0 0'
            }}>
              <a href="/" style={{
                textDecoration: 'none',
                color: '#ff4d4d'
              }}>Accueil</a>&nbsp;&gt;&nbsp;
              <span style={{ color: 'white' }}>À Propos</span>
            </p>
          </div>
        </div>
      </section>

      <div className="fade-in">
        {/* Section À propos */}
        <section className="section-padding" id="apropos">
          <div className="container">
            <div className="row align-center">
              {/* Texte à gauche sur desktop, en haut sur mobile */}
              <div className="col-half order-2 order-mobile-2">
                <h5 className="small-title">À propos de nous</h5>
                <h3 className="title-style">Qui sommes-nous ?</h3>
                {/* Image visible uniquement sur mobile */}
                <div className="show-mobile">
                  <img src="images/aa.png" alt="Groupe Scolaire Alfred Kastler" className="img-fluid radius-image" />
                </div>
                <p className="section-text">
                  Le <strong>Groupe Scolaire Alfred Kastler</strong>, situé au 130 Boulevard Ali Yaâta à Casablanca, 
                  propose une éducation complète, de la crèche jusqu'au lycée. Notre établissement bilingue mêle 
                  innovation pédagogique, environnement bienveillant et infrastructures modernes. Nous nous engageons 
                  à former des citoyens autonomes, responsables et ouverts sur le monde.
                </p>
                <p className="section-text">
                  Téléphone : 05 22 62 81 82 • 05 20 46 94 69 • 05 22 60 07 00 |  Email : contact@kastler.ma
                </p>
                <a href="/contact" className="btn-primary">Contactez-nous</a>
              </div>
              {/* Image à droite sur desktop, cachée sur mobile */}
              <div className="col-half order-1 order-mobile-1 hide-mobile">
                <img src="images/aa.png" alt="Groupe Scolaire Alfred Kastler" className="img-fluid radius-image" />
              </div>
            </div>
          </div>
        </section>

        {/* Section Mission & Valeurs */}
        <section className="section-padding mission-section" id="mission-values">
          <div className="container">
            {/* Titre principal */}
            <div className="text-center mb-5">
              <h5 className="small-title">Notre Engagement</h5>
              <h3 className="title-style">Notre Mission & Nos Valeurs</h3>
            </div>

            <div className="row">
              {/* Section Mission */}
              <div className="col-half">
                <div className="mission-content">
                  <h4><Target size={24} style={{marginRight: '10px'}} /> Notre Mission</h4>
                  <p className="section-text">
                    Accompagner chaque élève dans son épanouissement personnel et académique en offrant une éducation 
                    de qualité qui développe l'esprit critique, la créativité et les valeurs citoyennes.
                  </p>
                  <p className="section-text">
                    Notre objectif est de préparer nos élèves à devenir des acteurs responsables et engagés dans la 
                    société de demain, en leur donnant les outils nécessaires pour réussir dans un monde en constante évolution.
                  </p>
                </div>
              </div>

              {/* Section Valeurs */}
              <div className="col-half">
                <div className="mission-content">
                  <h4><Handshake size={24} style={{marginRight: '10px'}} /> Nos Valeurs</h4>
                  <ul className="feature-list">
                    <li className="feature-item">
                      <CheckCircle size={20} className="feature-icon" />
                      <div className="feature-text">
                        <strong>Excellence :</strong> Exigence et qualité pédagogique.
                      </div>
                    </li>
                    <li className="feature-item">
                      <CheckCircle size={20} className="feature-icon" />
                      <div className="feature-text">
                        <strong>Bienveillance :</strong> Accompagnement et respect de chaque élève.
                      </div>
                    </li>
                    <li className="feature-item">
                      <CheckCircle size={20} className="feature-icon" />
                      <div className="feature-text">
                        <strong>Innovation :</strong> Méthodes pédagogiques modernes et créatives.
                      </div>
                    </li>
                    <li className="feature-item">
                      <CheckCircle size={20} className="feature-icon" />
                      <div className="feature-text">
                        <strong>Ouverture :</strong> Éducation multiculturelle et bilingue.
                      </div>
                    </li>
                    <li className="feature-item">
                      <CheckCircle size={20} className="feature-icon" />
                      <div className="feature-text">
                        <strong>Responsabilité :</strong> Formation de citoyens conscients et engagés.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Pourquoi choisir */}
        <section className="section-padding" id="whychoose">
          <div className="container">
            <div className="text-center mb-4">
              <h5 className="small-title">Pourquoi choisir Alfred Kastler ?</h5>
              <h3 className="title-style">Nous offrons une éducation d'excellence</h3>
            </div>

            <div className="row align-center">
              {/* Image à gauche */}
              <div className="col-half">
                <img src="/images/ao.png" alt="Installations Alfred Kastler" className="img-fluid radius-image" />
              </div>

              {/* Texte à droite */}
              <div className="col-half">
                <p className="section-text">
                  Le Groupe Scolaire Alfred Kastler s'engage à fournir une éducation de qualité, adaptée aux besoins 
                  de chaque élève. Voici pourquoi vous devriez nous choisir :
                </p>
                <ul className="feature-list">
                  <li className="feature-item">
                    <UserCheck size={20} className="feature-icon" />
                    <span className="feature-text">Une équipe pédagogique expérimentée et passionnée.</span>
                  </li>
                  <li className="feature-item">
                    <GraduationCap size={20} className="feature-icon" />
                    <span className="feature-text">Un programme éducatif complet de la crèche au lycée.</span>
                  </li>
                  <li className="feature-item">
                    <Users size={20} className="feature-icon" />
                    <span className="feature-text">Un suivi personnalisé pour chaque élève.</span>
                  </li>
                  <li className="feature-item">
                    <Laptop size={20} className="feature-icon" />
                    <span className="feature-text">Des infrastructures modernes et équipements technologiques.</span>
                  </li>
                  <li className="feature-item">
                    <Clock size={20} className="feature-icon" />
                    <span className="feature-text">Horaires flexibles du lundi au samedi (07:00-17:00).</span>
                  </li>
                  <li className="feature-item">
                    <Globe size={20} className="feature-icon" />
                    <span className="feature-text">Éducation bilingue pour une ouverture internationale.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section Locaux */}
        <section className="section-padding" id="locaux">
          <div className="container">
            <div className="row align-center">
              {/* Texte à gauche sur desktop, en haut sur mobile */}
              <div className="col-half order-2 order-mobile-2">
                <h5 className="small-title">Alfred Kastler</h5>
                <h3 className="title-style">NOS LOCAUX</h3>
                {/* Image visible uniquement sur mobile */}
                <div className="show-mobile">
                  <img src="/images/abdo.png" alt="Campus Alfred Kastler" className="img-fluid radius-image" />
                </div>
                <p className="section-text">
                  Nos locaux offrent un <strong>environnement éducatif stimulant et sécurisé</strong>,
                  idéal pour l'épanouissement de nos élèves.
                  Équipés des dernières technologies pédagogiques et conçus pour favoriser l'apprentissage,
                  ils permettent un développement optimal des compétences et de la créativité.
                </p>
                <a href="/contact" className="btn-primary" style={{backgroundColor: '#4c1781'}}>
                  Visitez notre établissement
                </a>
              </div>
              {/* Image à droite sur desktop, cachée sur mobile */}
              <div className="col-half order-1 order-mobile-1 hide-mobile">
                <img src="/images/abdo.png" alt="Campus Alfred Kastler" className="img-fluid radius-image" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <ScrollToTop />
      <SocialFAB />
      <Footer />
    </>
  );
};

export default Propos;