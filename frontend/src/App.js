import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
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
import  ProfAjouterBulletin from './pages/ProfAjouterBulletin'; 
import  AdminBulletins from './pages/AdminBulletins'; 
import  EtudiantBulletins from './pages/EtudiantBulletins';
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
import CrechePrescolairePage from './pages/CrechePrescolairePage'; // Import de la page
import CollegePage from './pages/CollegePage'; // Import de la page
import LyceePage
 from './pages/LyceePage'; // Import de la page
import AdminActualites from './pages/AdminActualites';
import PaiementManagerPage from './pages/PaiementManagerPage';
import AdminMessagesmanager from './pages/AdminMessagesmanager';
import AdminVieScolairemanager from './pages/AdminVieScolairemanager';
import AdminActualitesmanager from './pages/AdminActualitesmanager';
import EtudiantProfil from './pages/EtudiantProfil';
import ProfesseurProfil from './pages/ProfesseurProfil';


function AppContent() {
  const location = useLocation();

  useEffect(() => {
    let deferredPrompt;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;

      const installBtn = document.getElementById('install-button');
      if (installBtn) {
        installBtn.style.display = 'flex';
        
        const handleInstallClick = () => {
          installBtn.style.display = 'none';
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
              console.log('✅ App installed');
            }
            deferredPrompt = null;
          });
        };

        installBtn.addEventListener('click', handleInstallClick);
        
        // Cleanup function pour éviter les fuites mémoire
        return () => {
          installBtn.removeEventListener('click', handleInstallClick);
        };
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <>
     

      <Routes>
        {/* Routes principales */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<KastlerHomepage/>} />
        <Route path="/propos" element={< Propos/>} />
        <Route path="/contact" element={<ContactPage/>} />
        <Route path="/Cycles" element={<CyclesPage/>} />
        <Route path="/ecole-primaire" element={<EcolePrimairePage/>} />
        <Route path="/CrechePrescolaire" element={<CrechePrescolairePage/>} />
        <Route path="/college" element={<CollegePage/>} />
        <Route path="/lycee" element={<LyceePage/>} />

<Route path="/admin/actualites" element={<AdminActualites />} />
<Route path="/manager/actualites" element={<AdminActualitesmanager />} />



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
<Route path="/admin/Bulletin" element={< AdminBulletins />} />

<Route path="/manager/messages" element={< AdminMessagesmanager />} />

<Route path="/etudiant/Bulletin" element={< EtudiantBulletins />} /><Route path="/professeur/AjouterBulletin" element={<ProfAjouterBulletin />} />


<Route path="/manager/VieScolaire" element={<AdminVieScolairemanager />} />

<Route path="/manager" element={<Dashboardmanager />} />
<Route path="/admin/Manager" element={< PaiementManagerPage />} />

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
<Route path="/admin/messages" element={<AdminMessages />} />

<Route path="/actualites" element={<ActualitesPage />} />
<Route path="/Vie-Scolaire" element={<VieScolairePage />} />

<Route path="/admin/VieScolaire" element={<AdminVieScolaire />} />
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
