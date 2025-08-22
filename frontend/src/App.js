// App.jsx (ou App.js)
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';

// Import des pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ListeEtudiants from './pages/ListeEtudiants';
import ListeCours from './pages/ListeCours';
import AjouterPaiement from './pages/AjouterPaiement';
import ListePaiements from './pages/ListePaiements';
import Calendrier from './pages/Calendrier';
import ProfilEtudiant from './pages/ProfilEtudiant';
import AjouterPresence from './pages/AjouterPresence';
import ListePresences from './pages/ListePresences';
import AjouterProfesseur from './pages/AjouterProfesseur';
import ListeProfesseurs from './pages/ListeProfesseurs';
import ProfesseurDashboard from './pages/ProfesseurDashboard';
import ListePresenceProf from './pages/ListePresenceProf';
import EtudiantsProfesseur from './pages/EtudiantsProfesseur';
import DashboardEtudiant from './pages/DashboardEtudiant';
import Profile from './pages/Profile';
import EtudiantPresences from './pages/EtudiantPresences';
import EvenementsProf from './pages/EvenementsProf';
import EvenementsEtudiant from './pages/EvenementsEtudiant';
import DocumentsEtudiant from './pages/DocumentsEtudiant';
import DocumentsProfesseur from './pages/DocumentsProfesseur';
import ExercicesCoursProf from './pages/ExercicesCoursProf';
import ListeCoursProf from './pages/ListeCoursProf';
import EtudiantPaiements from './pages/EtudiantPaiements';
import TeleverserExerciceEtudiant from './pages/TéléverserExerciceEtudiant';
import MesExercicesEtudiant from './pages/MesExercicesEtudiant';
import EtudiantLiveCours from './pages/EtudiantLiveCours';
import LiveCoursEtudiant from './pages/LiveCoursEtudiant';
import ProfLiveCours from './pages/ProfLiveCours';
import ProfileProfesseur from './pages/ProfileProfesseur';
import QREtudiant from './pages/qretudiant';
import Dashboardmanager from './pages/Dashboardmanager';
import ProfAjouterBulletin from './pages/ProfAjouterBulletin';
import AdminBulletins from './pages/AdminBulletins';
import EtudiantBulletins from './pages/EtudiantBulletins';
import MessageProf from './pages/MessageProf';
import MessageEtudiant from './pages/MessageEtudiant';
import ProfileUpdatePage from './pages/ProfileUpdatePage';
import PaiementsExp from './pages/PaiementsExp';
import KastlerHomepage from './pages/KastlerHomepage';
import AdminAjouterSeance from './pages/AdminAjouterSeance';
import ActualitesPage from './pages/ActualitesPage';
import VieScolairePage from './pages/VieScolairePage';
import SeancesEtudiant from './pages/SeancesEtudiant';
import SeancesProfesseur from './pages/SeancesProfesseur';
import ContactPage from './pages/ContactPage';
import CyclesPage from './pages/CyclesPage';
import AdminMessages from './pages/AdminMessages';
import Propos from './pages/Propos';
import AdminVieScolaire from './pages/AdminVieScolaire';
import EcolePrimairePage from './pages/EcolePrimairePage';
import CrechePrescolairePage from './pages/CrechePrescolairePage';
import CollegePage from './pages/CollegePage';
import LyceePage from './pages/LyceePage';
import AdminActualites from './pages/AdminActualites';
import PaiementManagerPage from './pages/PaiementManagerPage';
import AdminMessagesmanager from './pages/AdminMessagesmanager';
import AdminVieScolairemanager from './pages/AdminVieScolairemanager';
import AdminActualitesmanager from './pages/AdminActualitesmanager';
import EtudiantProfil from './pages/EtudiantProfil';
import ProfesseurProfil from './pages/ProfesseurProfil';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Prompt PWA stocké ici (n'entraîne pas de re-render)
  const deferredPromptRef = useRef(null);

  // Peut-on afficher le bouton d'install ?
  const [canInstall, setCanInstall] = useState(false);

  // L'app est-elle installée ? (persisté + détection standalone)
  const [isInstalled, setIsInstalled] = useState(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    const persisted = localStorage.getItem('pwaInstalled') === '1';
    return standalone || persisted;
  });

  // Effet pour rediriger vers login lors du premier lancement après installation
  useEffect(() => {
    const isStandalone = 
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    
    const hasRedirectedOnce = localStorage.getItem('hasRedirectedToLogin') === '1';
    
    // Si l'app est en mode standalone ET qu'on n'a jamais redirigé
    if (isStandalone && !hasRedirectedOnce && location.pathname === '/') {
      localStorage.setItem('hasRedirectedToLogin', '1');
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Écoute du prompt et de l'installation
  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      // Afficher le bouton uniquement si on est sur /login
      setCanInstall(location.pathname === '/login');
    };

    const onAppInstalled = () => {
      deferredPromptRef.current = null;
      setCanInstall(false);
      setIsInstalled(true);
      localStorage.setItem('pwaInstalled', '1');
      // Marquer pour redirection au prochain lancement
      localStorage.removeItem('hasRedirectedToLogin');
      // Rediriger vers /login une fois installée
      navigate('/login', { replace: true });
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Quand la route change, afficher/masquer le bouton selon /login
  useEffect(() => {
    if (location.pathname !== '/login') {
      setCanInstall(false);
    } else if (!isInstalled) {
      // Afficher le bouton sur /login même sans beforeinstallprompt
      setCanInstall(true);
    }
  }, [location.pathname, isInstalled]);

  // Clic sur "Installer"
  const handleInstallClick = async () => {
    const deferredPrompt = deferredPromptRef.current;
    if (!deferredPrompt) {
      // Si pas de prompt disponible, afficher les instructions
      alert('Pour installer cette application:\n\n1. Sur Chrome/Edge: Cliquez sur l\'icône d\'installation dans la barre d\'adresse\n2. Ou utilisez le menu "Installer l\'application"\n3. Sur mobile: Utilisez "Ajouter à l\'écran d\'accueil" dans le menu du navigateur');
      return;
    }

    setCanInstall(false);
    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice.catch(() => null);
    deferredPromptRef.current = null;

    if (choice?.outcome === 'accepted') {
      // Considérer comme installée dès l'acceptation (plus fluide)
      setIsInstalled(true);
      localStorage.setItem('pwaInstalled', '1');
      // Marquer pour redirection au prochain lancement
      localStorage.removeItem('hasRedirectedToLogin');
      navigate('/login', { replace: true });
    }
  };

  // Masquer le bouton si déjà en mode standalone
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const shouldShowInstallButton =
    !isStandalone && !isInstalled && canInstall && location.pathname === '/login';

  return (
    <>
      {/* Bouton d'installation: UNIQUEMENT sur /login */}
      {shouldShowInstallButton && (
        <button
          onClick={handleInstallClick}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 18px',
background: 'linear-gradient(to right, #e60039, #8a2be2)',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 999
          }}
          title="Installer l'application"
        >
          <Download size={18} />
          Installer l'application
        </button>
      )}

      <Routes>
        {/* Route par défaut */}
        <Route path="/" element={<KastlerHomepage />} />
        
        {/* Routes publiques (toujours accessibles) */}
        <Route path="/propos" element={<Propos />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/Cycles" element={<CyclesPage />} />
        <Route path="/ecole-primaire" element={<EcolePrimairePage />} />
        <Route path="/CrechePrescolaire" element={<CrechePrescolairePage />} />
        <Route path="/college" element={<CollegePage />} />
        <Route path="/lycee" element={<LyceePage />} />
        <Route path="/actualites" element={<ActualitesPage />} />
        <Route path="/Vie-Scolaire" element={<VieScolairePage />} />

        {/* Auth public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/liste-etudiants" element={<ListeEtudiants />} />
        <Route path="/ajouter-paiement" element={<AjouterPaiement />} />
        <Route path="/liste-paiements" element={<ListePaiements />} />
        <Route path="/liste-classe" element={<ListeCours />} />
        <Route path="/calendrier" element={<Calendrier />} />
        <Route path="/etudiants/:id" element={<ProfilEtudiant />} />
        <Route path="/ajouter-professeur" element={<AjouterProfesseur />} />
        <Route path="/liste-professeurs" element={<ListeProfesseurs />} />
        <Route path="/ajouter-presence" element={<AjouterPresence />} />
        <Route path="/liste-presences" element={<ListePresences />} />
        <Route path="/update-profil" element={<ProfileUpdatePage />} />
        <Route path="/paiements-exp" element={<PaiementsExp />} />
        <Route path="/qr-etudiant" element={<QREtudiant />} />
        <Route path="/admin/seances" element={<AdminAjouterSeance />} />
        <Route path="/etudiant/seances" element={<SeancesEtudiant />} />
        <Route path="/professeur/seances" element={<SeancesProfesseur />} />
        <Route path="/admin/Bulletin" element={<AdminBulletins />} />
        <Route path="/manager/messages" element={<AdminMessagesmanager />} />
        <Route path="/etudiant/Bulletin" element={<EtudiantBulletins />} />
        <Route path="/professeur/AjouterBulletin" element={<ProfAjouterBulletin />} />
        <Route path="/manager/VieScolaire" element={<AdminVieScolairemanager />} />
        <Route path="/manager" element={<Dashboardmanager />} />
        <Route path="/admin/Manager" element={<PaiementManagerPage />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/VieScolaire" element={<AdminVieScolaire />} />
        <Route path="/admin/actualites" element={<AdminActualites />} />
        <Route path="/manager/actualites" element={<AdminActualitesmanager />} />

        {/* Routes Professeur */}
        <Route path="/professeur" element={<ProfesseurDashboard />} />
        <Route path="/professeur/profile" element={<ProfileProfesseur />} />
        <Route path="/presences" element={<ListePresenceProf />} />
        <Route path="/professeur/etudiants" element={<EtudiantsProfesseur />} />
        <Route path="/evenements-prof" element={<EvenementsProf />} />
        <Route path="/professeur/exercices/:nomCours" element={<ExercicesCoursProf />} />
        <Route path="/professeur/exercices" element={<ListeCoursProf />} />
        <Route path="/professeur/live" element={<ProfLiveCours />} />
        <Route path="/prof/documents" element={<DocumentsProfesseur />} />
        <Route path="/professeur/messages" element={<MessageProf />} />

        {/* Routes Étudiant */}
        <Route path="/etudiant/messages" element={<MessageEtudiant />} />
        <Route path="/professeur/profil" element={<ProfesseurProfil />} />
        <Route path="/etudiant/profil" element={<EtudiantProfil />} />
        <Route path="/etudiant" element={<DashboardEtudiant />} />
        <Route path="/etudiant/profile" element={<Profile />} />
        <Route path="/etudiant/presences" element={<EtudiantPresences />} />
        <Route path="/etudiant/paiements" element={<EtudiantPaiements />} />
        <Route path="/evenements-etudiant" element={<EvenementsEtudiant />} />
        <Route path="/etudiant/documents" element={<DocumentsEtudiant />} />
        <Route path="/etudiant/mes-exercices" element={<MesExercicesEtudiant />} />
        <Route path="/etudiant/exercices/upload" element={<TeleverserExerciceEtudiant />} />
        <Route path="/etudiant/live" element={<LiveCoursEtudiant />} />
        <Route path="/etudiant/live/:cours" element={<EtudiantLiveCours />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}