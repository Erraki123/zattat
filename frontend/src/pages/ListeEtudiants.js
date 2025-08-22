import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ListeEtudiants.css';
import Sidebar from '../components/Sidebar'; // ✅ استيراد صحيح

import { 
  User, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Eye, 
  Edit,   BookOpen, 
  Calendar, 
  Cake, 
  MapPin,
  RotateCcw, X,
  Trash2,
  Mail,
  GraduationCap
} from "lucide-react";


const ListeEtudiants = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [etudiantsFiltres, setEtudiantsFiltres] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreGenre, setFiltreGenre] = useState('');
  const [filtreCours, setFiltreCours] = useState('');
  const [filtreNiveau, setFiltreNiveau] = useState('');
  const [filtreActif, setFiltreActif] = useState('');
  const [pageActuelle, setPageActuelle] = useState(1);
  const [etudiantsParPage] = useState(10);
  const [loading, setLoading] = useState(true);
  
  // États pour le modal d'ajout
  const [showModal, setShowModal] = useState(false);
const [formAjout, setFormAjout] = useState({
  nomComplet: '',
  genre: 'Homme',
  dateNaissance: '',
  niveau: '6ème Collège',
  telephoneEtudiant: '',
  telephonePere: '',
  telephoneMere: '',
  codeMassar: '',
  adresse: '',
  email: '',
  motDePasse: '',
  cours: [],
  actif: true,
  prixTotal: 0,
  paye: false,
  pourcentageBourse: 0,
  typePaiement: 'Cash',
  anneeScolaire: ''
});
  const [vueMode, setVueMode] = useState('tableau'); // 'tableau' ou 'carte'

  const [imageFile, setImageFile] = useState(null);
  const [listeCours, setListeCours] = useState([]);
  const [messageAjout, setMessageAjout] = useState('');
  const [loadingAjout, setLoadingAjout] = useState(false);
  
  // États pour le modal de visualisation
  const [showViewModal, setShowViewModal] = useState(false);
  const [etudiantSelectionne, setEtudiantSelectionne] = useState(null);
  
  // États pour le modal de modification
  const [showEditModal, setShowEditModal] = useState(false);
 const [formModifier, setFormModifier] = useState({
  nomComplet: '',
  genre: 'Homme',
  dateNaissance: '',
  niveau: '6ème Collège',
  telephoneEtudiant: '',
  telephonePere: '',
  telephoneMere: '',
  codeMassar: '',
  adresse: '',
  email: '',
  motDePasse: '',
  cours: [],
  actif: true,
  prixTotal: 0,
  paye: false,
  pourcentageBourse: 0,
  typePaiement: 'Cash',
  anneeScolaire: ''
});
  const [imageFileModifier, setImageFileModifier] = useState(null);
  const [messageModifier, setMessageModifier] = useState('');
  const [loadingModifier, setLoadingModifier] = useState(false);
  const [etudiantAModifier, setEtudiantAModifier] = useState(null);
  
  const navigate = useNavigate();

  // Niveaux disponibles selon le schéma
  const niveauxDisponibles = [
    // Collège
    "6ème Collège",
    "5ème Collège", 
    "4ème Collège",
    "3ème Collège",
    // Lycée Tronc Commun
    "Tronc Commun Scientifique",
    "Tronc Commun Littéraire",
    "Tronc Commun Technique",
    // 1ère Bac
    "1BAC SM",
    "1BAC PC",
    "1BAC SVT",
    "1BAC Lettres",
    "1BAC Économie",
    "1BAC Technique",
    // 2ème Bac
    "2BAC SMA",
    "2BAC SMB",
    "2BAC PC",
    "2BAC SVT",
    "2BAC Lettres",
    "2BAC Économie",
    "2BAC Technique"
  ];

  useEffect(() => {
    fetchEtudiants();
    fetchCours();
  }, []);

  useEffect(() => {
    filtrerEtudiants();
  }, [etudiants, recherche, filtreGenre, filtreCours, filtreNiveau, filtreActif]);

  const fetchEtudiants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/etudiants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEtudiants(res.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCours = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/cours', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListeCours(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des cours:', err);
    }
  };

const filtrerEtudiants = () => {
  let resultats = etudiants;

  // Filtre par recherche (nom, téléphone, email, code massar)
if (recherche) {
  resultats = resultats.filter(e =>
    (e.nomComplet && e.nomComplet.toLowerCase().includes(recherche.toLowerCase())) ||
    (e.telephoneEtudiant && e.telephoneEtudiant.includes(recherche)) ||
    (e.email && e.email.toLowerCase().includes(recherche.toLowerCase())) ||
    (e.codeMassar && e.codeMassar.toLowerCase().includes(recherche.toLowerCase()))
  );
}

    // Filtre par genre
    if (filtreGenre) {
      resultats = resultats.filter(e => e.genre === filtreGenre);
    }

    // Filtre par cours
    if (filtreCours) {
      resultats = resultats.filter(e => 
        e.cours.some(cours => cours.toLowerCase().includes(filtreCours.toLowerCase()))
      );
    }

    // Filtre par niveau
    if (filtreNiveau) {
      resultats = resultats.filter(e => e.niveau === filtreNiveau);
    }

    // Filtre par statut actif
    if (filtreActif !== '') {
      resultats = resultats.filter(e => e.actif === (filtreActif === 'true'));
    }

    setEtudiantsFiltres(resultats);
    setPageActuelle(1); // Reset à la première page après filtrage
  };

  // Fonctions pour le modal d'ajout
  const openModal = () => {
    setShowModal(true);
    setMessageAjout('');
  };

 const closeModal = () => {
  setShowModal(false);
  setFormAjout({
    nomComplet: '',
    genre: 'Homme',
    dateNaissance: '',
    niveau: '6ème Collège',
    telephoneEtudiant: '',
    telephonePere: '',
    telephoneMere: '',
    codeMassar: '',
    adresse: '',
    email: '',
    motDePasse: '',
    cours: [],
    actif: true,
    prixTotal: 0,
    paye: false,
    pourcentageBourse: 0,
    typePaiement: 'Cash',
    anneeScolaire: ''
  });
  setImageFile(null);
  setMessageAjout('');
};

  const handleChangeAjout = (e) => {
    const { name, value, type, checked } = e.target;
    setFormAjout({ ...formAjout, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSelectCoursAjout = (coursNom) => {
    const nouveauxCours = formAjout.cours.includes(coursNom)
      ? formAjout.cours.filter(c => c !== coursNom)
      : [...formAjout.cours, coursNom];
    setFormAjout({ ...formAjout, cours: nouveauxCours });
  };

  const handleImageChangeAjout = (e) => {
    setImageFile(e.target.files[0]);
  };

const handleSubmitAjout = async (e) => {
  e.preventDefault();
  setLoadingAjout(true);
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('nomComplet', formAjout.nomComplet);
    formData.append('genre', formAjout.genre);
    formData.append('dateNaissance', formAjout.dateNaissance);
    formData.append('niveau', formAjout.niveau);
    formData.append('telephoneEtudiant', formAjout.telephoneEtudiant);
    formData.append('telephonePere', formAjout.telephonePere);
    formData.append('telephoneMere', formAjout.telephoneMere);
    formData.append('codeMassar', formAjout.codeMassar);
    formData.append('adresse', formAjout.adresse);
    formData.append('email', formAjout.email);
    formData.append('motDePasse', formAjout.motDePasse);
    formData.append('actif', formAjout.actif);
    formData.append('prixTotal', formAjout.prixTotal);
    formData.append('paye', formAjout.paye);
    formData.append('pourcentageBourse', formAjout.pourcentageBourse);
    formData.append('typePaiement', formAjout.typePaiement);
    formData.append('anneeScolaire', formAjout.anneeScolaire);

    formAjout.cours.forEach(c => formData.append('cours[]', c));
    if (imageFile) formData.append('image', imageFile);

    const response = await axios.post('http://localhost:5000/api/etudiants', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    setMessageAjout('✅ Étudiant ajouté avec succès');
    
    // Recharger automatiquement la liste des étudiants
    await fetchEtudiants();
    
    // Réinitialiser le formulaire
    setFormAjout({
      nomComplet: '',
      genre: 'Homme',
      dateNaissance: '',
      niveau: '6ème Collège',
      telephoneEtudiant: '',
      telephonePere: '',
      telephoneMere: '',
      codeMassar: '',
      adresse: '',
      email: '',
      motDePasse: '',
      cours: [],
      actif: true,
      prixTotal: 0,
      paye: false,
      pourcentageBourse: 0,
      typePaiement: 'Cash',
      anneeScolaire: ''
    });
    setImageFile(null);
    
    // Fermer le modal après 2 secondes
    setTimeout(() => {
      closeModal();
    }, 2000);
    
  } catch (err) {
    setMessageAjout('❌ Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
  } finally {
    setLoadingAjout(false);
  }
};


  // Fonctions pour le modal de modification
 const openEditModal = (etudiant) => {
  setEtudiantAModifier(etudiant);
  setFormModifier({
    nomComplet: etudiant.nomComplet || '',
    genre: etudiant.genre || 'Homme',
    dateNaissance: etudiant.dateNaissance ? etudiant.dateNaissance.slice(0, 10) : '',
    niveau: etudiant.niveau || '6ème Collège',
    telephoneEtudiant: etudiant.telephoneEtudiant || '',
    telephonePere: etudiant.telephonePere || '',
    telephoneMere: etudiant.telephoneMere || '',
    codeMassar: etudiant.codeMassar || '',
    adresse: etudiant.adresse || '',
    email: etudiant.email || '',
    motDePasse: '',
    cours: etudiant.cours || [],
    actif: etudiant.actif ?? true,
    prixTotal: etudiant.prixTotal ?? 0,
    paye: etudiant.paye ?? false,
    pourcentageBourse: etudiant.pourcentageBourse ?? 0,
    typePaiement: etudiant.typePaiement || 'Cash',
    anneeScolaire: etudiant.anneeScolaire || ''
  });
  setImageFileModifier(null);
  setMessageModifier('');
  setShowEditModal(true);
};

const closeEditModal = () => {
  setShowEditModal(false);
  setEtudiantAModifier(null);
  setFormModifier({
    nomComplet: '',
    genre: 'Homme',
    dateNaissance: '',
    niveau: '6ème Collège',
    telephoneEtudiant: '',
    telephonePere: '',
    telephoneMere: '',
    codeMassar: '',
    adresse: '',
    email: '',
    motDePasse: '',
    cours: [],
    actif: true,
    prixTotal: 0,
    paye: false,
    pourcentageBourse: 0,
    typePaiement: 'Cash',
    anneeScolaire: ''
  });
  setImageFileModifier(null);
  setMessageModifier('');
};

  const handleChangeModifier = (e) => {
    const { name, value, type, checked } = e.target;
    setFormModifier({ ...formModifier, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSelectCoursModifier = (coursNom) => {
    const nouveauxCours = formModifier.cours.includes(coursNom)
      ? formModifier.cours.filter(c => c !== coursNom)
      : [...formModifier.cours, coursNom];
    setFormModifier({ ...formModifier, cours: nouveauxCours });
  };

  const handleImageChangeModifier = (e) => {
    setImageFileModifier(e.target.files[0]);
  };

 const handleSubmitModifier = async (e) => {
  e.preventDefault();
  setLoadingModifier(true);
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('nomComplet', formModifier.nomComplet);
    formData.append('genre', formModifier.genre);
    formData.append('dateNaissance', formModifier.dateNaissance);
    formData.append('niveau', formModifier.niveau);
    formData.append('telephoneEtudiant', formModifier.telephoneEtudiant);
    formData.append('telephonePere', formModifier.telephonePere);
    formData.append('telephoneMere', formModifier.telephoneMere);
    formData.append('codeMassar', formModifier.codeMassar);
    formData.append('adresse', formModifier.adresse);
    formData.append('email', formModifier.email);
    if (formModifier.motDePasse.trim() !== '') {
      formData.append('motDePasse', formModifier.motDePasse);
    }
    formData.append('actif', formModifier.actif);
    formData.append('prixTotal', formModifier.prixTotal);
    formData.append('paye', formModifier.paye);
    formData.append('pourcentageBourse', formModifier.pourcentageBourse);
    formData.append('typePaiement', formModifier.typePaiement);
    formData.append('anneeScolaire', formModifier.anneeScolaire);

    formModifier.cours.forEach(c => formData.append('cours[]', c));
    if (imageFileModifier) formData.append('image', imageFileModifier);

    const response = await axios.put(`http://localhost:5000/api/etudiants/${etudiantAModifier._id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    setMessageModifier('✅ Étudiant modifié avec succès');
    
    // Recharger automatiquement la liste des étudiants
    await fetchEtudiants();
    
    // Fermer le modal après 2 secondes
    setTimeout(() => {
      closeEditModal();
    }, 2000);
    
  } catch (err) {
    setMessageModifier('❌ Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
  } finally {
    setLoadingModifier(false);
  }
};


  const handleToggleActif = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`http://localhost:5000/api/etudiants/${id}/actif`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEtudiants(etudiants.map(e => e._id === id ? res.data : e));
    } catch (err) {
      console.error('Erreur toggle actif:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("🛑 Êtes-vous sûr de vouloir supprimer cet étudiant ?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/etudiants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEtudiants(etudiants.filter(e => e._id !== id));
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const handleEdit = (etudiant) => {
    openEditModal(etudiant);
  };

  const handleView = (etudiant) => {
    setEtudiantSelectionne(etudiant);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setEtudiantSelectionne(null);
  };

  const viderFiltres = () => {
    setRecherche('');
    setFiltreGenre('');
    setFiltreCours('');
    setFiltreNiveau('');
    setFiltreActif('');
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    const jour = String(date.getDate()).padStart(2, '0');
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    const annee = date.getFullYear();
    return `${jour}-${mois}-${annee}`;
  };

  const calculerAge = (dateNaissance) => {
    const dob = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Pagination
  const indexDernierEtudiant = pageActuelle * etudiantsParPage;
  const indexPremierEtudiant = indexDernierEtudiant - etudiantsParPage;
  const etudiantsActuels = etudiantsFiltres.slice(indexPremierEtudiant, indexDernierEtudiant);
  const totalPages = Math.ceil(etudiantsFiltres.length / etudiantsParPage);

  const changerPage = (numerePage) => {
    setPageActuelle(numerePage);
  };

  // Obtenir tous les cours uniques pour le filtre
  const coursUniques = [...new Set(etudiants.flatMap(e => e.cours))];

  if (loading) {
    return <div className="loading">Chargement des étudiants...</div>;
  }

  return (
    <div className="liste-etudiants-container"style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)'
        }}>
      <Sidebar onLogout={handleLogout} />

      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h2 style={{ width: '100%', textAlign: 'center' }}>Liste des Étudiants</h2>
        <div className="header-actions">
          <div className="stats">
            Total: {etudiantsFiltres.length} étudiants
          </div>
          
          {/* Boutons de basculement vue */}
          <div className="vue-toggle">
            <button 
              onClick={() => setVueMode('tableau')}
              className={`btn-vue ${vueMode === 'tableau' ? 'active' : ''}`}
            >
              Tableau
            </button>
            <button 
              onClick={() => setVueMode('carte')}
              className={`btn-vue ${vueMode === 'carte' ? 'active' : ''}`}
            >
              Cartes
            </button>
          </div>
          
          <button onClick={openModal} className="btn-ajouter-etudiant">
             Ajouter un étudiant
          </button>
        </div>
      </div>

      {/* Section des filtres */}
      <div className="filtres-section">
        <div className="filtres-row">
          <div className="filtre-groupe">
            <label>Rechercher:</label>
            <input
              type="text"
              placeholder="Nom, téléphone, email ou Code Massar..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="input-recherche"
            />
          </div>

          <div className="filtre-groupe">
            <label>Genre:</label>
            <select
              value={filtreGenre}
              onChange={(e) => setFiltreGenre(e.target.value)}
              className="select-filtre"
            >
              <option value="">Tous</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>

          <div className="filtre-groupe">
            <label>Niveau:</label>
            <select
              value={filtreNiveau}
              onChange={(e) => setFiltreNiveau(e.target.value)}
              className="select-filtre"
            >
              <option value="">Tous les niveaux</option>
              {niveauxDisponibles.map(niveau => (
                <option key={niveau} value={niveau}>{niveau}</option>
              ))}
            </select>
          </div>
          
          <div className="filtre-groupe">
            <label>Classe:</label>
            <select
              value={filtreCours}
              onChange={(e) => setFiltreCours(e.target.value)}
              className="select-filtre"
            >
              <option value="">Tous les classes</option>
              {coursUniques.map(cours => (
                <option key={cours} value={cours}>{cours}</option>
              ))}
            </select>
          </div>

          <div className="filtre-groupe">
            <label>Statut:</label>
            <select
              value={filtreActif}
              onChange={(e) => setFiltreActif(e.target.value)}
              className="select-filtre"
            >
              <option value="">Tous</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>

          <button onClick={viderFiltres} className="btn-vider-filtres">
            Vider les filtres
          </button>
        </div>
      </div>

      {/* Vue Tableau ou Cartes */}
{vueMode === 'tableau' ? (
  // VUE TABLEAU
  <div className="tableau-container">
    <table className="tableau-etudiants">
      <thead>
        <tr>
          <th>Nom Complet</th>
          <th>Genre</th>
          <th>Niveau</th>
          <th>Date de Naissance</th>
          <th>Âge</th>
          <th>Tél. Étudiant</th>
          <th>Code Massar</th>
          <th>Classe</th>
          <th>Statut</th>
          <th>Image</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {etudiantsActuels.length === 0 ? (
          <tr>
            <td colSpan="12" className="aucun-resultat">
              Aucun étudiant trouvé
            </td>
          </tr>
        ) : (
          etudiantsActuels.map((e) => (
            <tr key={e._id}>
              <td className="nom-colonne">{e.nomComplet}</td>
              <td>{e.genre}</td>
              <td className="niveau-colonne">
                <span className="niveau-badge">
                  <GraduationCap size={16} className="inline mr-1" />
                  {e.niveau || 'Non défini'}
                </span>
              </td>
              <td>{formatDate(e.dateNaissance)}</td>
              <td>{calculerAge(e.dateNaissance)} ans</td>
              <td>{e.telephoneEtudiant}</td>
              <td>{e.codeMassar}</td>
              <td className="cours-colonne">
                {(Array.isArray(e.cours) && e.cours.length > 0) ? e.cours.join(', ') : ''}
              </td>
              <td className="statut-colonne">
                <div className="toggle-switch-container">
                  <span className={`statut-text ${e.actif ? 'actif' : 'inactif'}`}>
                    {e.actif ? 'Actif' : 'Inactif'}
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={e.actif}
                      onChange={() => handleToggleActif(e._id)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </td>
              <td className="image-colonne">
                {e.image ? (
                  <img 
                    src={`http://localhost:5000${e.image}`} 
                    alt="etudiant" 
                    className="image-etudiant"
                  />
                ) : (
                  <div className="pas-image">N/A</div>
                )}
              </td>
              <td className="actions-colonne">
                <button 
                  onClick={() => handleView(e)}
                  className="btn-voir"
                >
              <Eye size={16} />
                </button>
                <button 
                  onClick={() => handleEdit(e)}
                  className="btn-modifier"
                >
                            <Edit size={16} />

                </button>
                <button 
                  onClick={() => handleDelete(e._id)}
                  className="btn-supprimer"
                >
              <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
) : (
  // VUE CARTES

<div className="cartes-container">
  {etudiantsActuels.length === 0 ? (
    <div className="aucun-resultat-cartes">
      Aucun étudiant trouvé
    </div>
  ) : (
    <div className="cartes-grid">
      {etudiantsActuels.map((e) => (
        <div key={e._id} className="carte-etudiant">
          <div className="carte-header">
            <div className="carte-image">
              {e.image ? (
                <img 
                  src={`http://localhost:5000${e.image}`} 
                  alt="etudiant" 
                  className="carte-photo"
                />
              ) : (
                <div className="carte-placeholder">
                  <User size={24} />
                </div>
              )}
            </div>
            <div className="carte-statut">
              <span className={`statut-badge ${e.actif ? 'actif' : 'inactif'}`}>
                {e.actif ? <CheckCircle size={16} /> : <XCircle size={16} />}
              </span>
            </div>
          </div>
          
          <div className="carte-content">
            <h3 className="carte-nom">{e.nomComplet}</h3>
            <div className="carte-info">
              <div className="carte-detail">
                <span className="carte-label">Genre:</span>
                <span>
                  <User size={16} className="inline mr-1" /> {e.genre}
                </span>
              </div>
              <div className="carte-detail">
                <span className="carte-label">Niveau:</span>
                <span>
                  <GraduationCap size={16} className="inline mr-1" /> {e.niveau || 'Non défini'}
                </span>
              </div>
              <div className="carte-detail">
                <span className="carte-label">Âge:</span>
                <span>{calculerAge(e.dateNaissance)} ans</span>
              </div>
              <div className="carte-detail">
                <span className="carte-label">Tél. Étudiant:</span>
                <span>
                  <Phone size={16} className="inline mr-1" /> {e.telephoneEtudiant}
                </span>
              </div>
              <div className="carte-detail">
                <span className="carte-label">Code Massar:</span>
                <span>{e.codeMassar}</span>
              </div>
              <div className="carte-detail">
                <span className="carte-label">Email:</span>
                <span>
                  <Mail size={16} className="inline mr-1" /> {e.email}
                </span>
              </div>
              <div className="carte-detail cours-detail">
                <span className="carte-label">Classe:</span>
                <div className="carte-cours">
                  {(Array.isArray(e.cours) && e.cours.length > 0) ? (
                    e.cours.map((cours, index) => (
                      <span key={index} className="cours-tag">{cours}</span>
                    ))
                  ) : (
                    <span className="no-cours">Aucun classe</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="carte-actions">
            <button 
              onClick={() => handleView(e)}
              className="btn-carte btn-voir"
              title="Voir détails"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={() => handleEdit(e)}
              className="btn-carte btn-modifier"
              title="Modifier"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => handleToggleActif(e._id)}
              className="btn-carte btn-toggle"
              title={e.actif ? 'Désactiver' : 'Activer'}
            >
              <RotateCcw size={16} />
            </button>
            <button 
              onClick={() => handleDelete(e._id)}
              className="btn-carte btn-supprimer"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
)}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => changerPage(pageActuelle - 1)}
            disabled={pageActuelle === 1}
            className="btn-pagination"
          >
            ← Précédent
          </button>

          <div className="numeros-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(numero => (
              <button
                key={numero}
                onClick={() => changerPage(numero)}
                className={`btn-page ${pageActuelle === numero ? 'active' : ''}`}
              >
                {numero}
              </button>
            ))}
          </div>

          <button
            onClick={() => changerPage(pageActuelle + 1)}
            disabled={pageActuelle === totalPages}
            className="btn-pagination"
          >
            Suivant →
          </button>

          <div className="info-pagination">
            Page {pageActuelle} sur {totalPages} 
            ({indexPremierEtudiant + 1}-{Math.min(indexDernierEtudiant, etudiantsFiltres.length)} sur {etudiantsFiltres.length})
          </div>
        </div>
      )}

      {/* Modal d'ajout d'étudiant */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ajouter un étudiant</h3>
              <button className="btn-fermer-modal" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmitAjout} className="form-ajout-etudiant">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom Complet *</label>
                  <input
                    type="text"
                    name="nomComplet"
                    placeholder="Nom complet"
                    value={formAjout.nomComplet}
                    onChange={handleChangeAjout}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Genre *</label>
                  <select name="genre" value={formAjout.genre} onChange={handleChangeAjout}>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Niveau *</label>
                  <select name="niveau" value={formAjout.niveau} onChange={handleChangeAjout} required>
                    {niveauxDisponibles.map(niveau => (
                      <option key={niveau} value={niveau}>{niveau}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date de Naissance *</label>
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formAjout.dateNaissance}
                    onChange={handleChangeAjout}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Code Massar *</label>
                  <input
                    type="text"
                    name="codeMassar"
                    placeholder="Code Massar"
                    value={formAjout.codeMassar}
                    onChange={handleChangeAjout}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone Étudiant *</label>
                  <input
                    type="text"
                    name="telephoneEtudiant"
                    placeholder="Téléphone de l'étudiant"
                    value={formAjout.telephoneEtudiant}
                    onChange={handleChangeAjout}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formAjout.email}
                    onChange={handleChangeAjout}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mot de Passe *</label>
                  <input
                    type="password"
                    name="motDePasse"
                    placeholder="Mot de passe (minimum 6 caractères)"
                    value={formAjout.motDePasse}
                    onChange={handleChangeAjout}
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone Père</label>
                  <input
                    type="text"
                    name="telephonePere"
                    placeholder="Téléphone du père (optionnel)"
                    value={formAjout.telephonePere}
                    onChange={handleChangeAjout}
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone Mère</label>
                  <input
                    type="text"
                    name="telephoneMere"
                    placeholder="Téléphone de la mère (optionnel)"
                    value={formAjout.telephoneMere}
                    onChange={handleChangeAjout}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <textarea
                  name="adresse"
                  placeholder="Adresse complète (optionnel)"
                  value={formAjout.adresse}
                  onChange={handleChangeAjout}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Classe </label>
                <div className="cours-selection-container">
                  {listeCours.map((cours) => (
                    <div
                      key={cours._id}
                      className={`cours-chip ${formAjout.cours.includes(cours.nom) ? 'selected' : ''}`}
                      onClick={() => handleSelectCoursAjout(cours.nom)}
                    >
                      <span className="cours-nom">{cours.nom}</span>
                      {formAjout.cours.includes(cours.nom) && (
                        <span className="cours-check">✓</span>
                      )}
                    </div>
                  ))}
                </div>
                {formAjout.cours.length > 0 && (
                  <div className="cours-selectionnes">
                    <small>Classe sélectionnés: {formAjout.cours.join(', ')}</small>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChangeAjout}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="actif"
                      checked={formAjout.actif}
                      onChange={handleChangeAjout}
                    />
                    Étudiant actif
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix Total</label>
                  <input
                    type="number"
                    name="prixTotal"
                    placeholder="Prix total"
                    value={formAjout.prixTotal}
                    onChange={handleChangeAjout}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Payé</label>
                  <select name="paye" value={formAjout.paye} onChange={handleChangeAjout}>
                    <option value={true}>Oui</option>
                    <option value={false}>Non</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pourcentage Bourse (%)</label>
                  <input
                    type="number"
                    name="pourcentageBourse"
                    placeholder="Pourcentage bourse"
                    value={formAjout.pourcentageBourse}
                    onChange={handleChangeAjout}
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                <div className="form-group">
                  <label>Type Paiement</label>
                  <select name="typePaiement" value={formAjout.typePaiement} onChange={handleChangeAjout}>
                    <option value="Cash">Cash</option>
                    <option value="Virement">Virement</option>
                    <option value="Chèque">Chèque</option>
                    <option value="En ligne">En ligne</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Année Scolaire *</label>
                <input
                  type="text"
                  name="anneeScolaire"
                  placeholder="ex: 2025/2026"
                  value={formAjout.anneeScolaire}
                  onChange={handleChangeAjout}
                  required
                  pattern="\d{4}/\d{4}"
                  title="Format attendu: YYYY/YYYY"
                />
              </div>

              {messageAjout && (
                <div className={`message-ajout ${messageAjout.includes('✅') ? 'success' : 'error'}`}>
                  {messageAjout}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-annuler">
                  Annuler
                </button>
                <button type="submit" disabled={loadingAjout} className="btn-enregistrer">
                  {loadingAjout ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification d'étudiant */}
      {showEditModal && etudiantAModifier && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier l'étudiant</h3>
              <button className="btn-fermer-modal" onClick={closeEditModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmitModifier} className="form-ajout-etudiant">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom Complet *</label>
                  <input
                    type="text"
                    name="nomComplet"
                    placeholder="Nom complet"
                    value={formModifier.nomComplet}
                    onChange={handleChangeModifier}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Genre *</label>
                  <select name="genre" value={formModifier.genre} onChange={handleChangeModifier}>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Niveau *</label>
                  <select name="niveau" value={formModifier.niveau} onChange={handleChangeModifier} required>
                    {niveauxDisponibles.map(niveau => (
                      <option key={niveau} value={niveau}>{niveau}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date de Naissance *</label>
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formModifier.dateNaissance}
                    onChange={handleChangeModifier}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Code Massar *</label>
                  <input
                    type="text"
                    name="codeMassar"
                    placeholder="Code Massar"
                    value={formModifier.codeMassar}
                    onChange={handleChangeModifier}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone Étudiant *</label>
                  <input
                    type="text"
                    name="telephoneEtudiant"
                    placeholder="Téléphone de l'étudiant"
                    value={formModifier.telephoneEtudiant}
                    onChange={handleChangeModifier}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formModifier.email}
                    onChange={handleChangeModifier}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nouveau Mot de Passe</label>
                  <input
                    type="password"
                    name="motDePasse"
                    placeholder="Laisser vide pour garder l'ancien"
                    value={formModifier.motDePasse}
                    onChange={handleChangeModifier}
                    minLength="6"
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>
                    Laisser vide pour conserver le mot de passe actuel
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone Père</label>
                  <input
                    type="text"
                    name="telephonePere"
                    placeholder="Téléphone du père"
                    value={formModifier.telephonePere}
                    onChange={handleChangeModifier}
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone Mère</label>
                  <input
                    type="text"
                    name="telephoneMere"
                    placeholder="Téléphone de la mère"
                    value={formModifier.telephoneMere}
                    onChange={handleChangeModifier}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <textarea
                  name="adresse"
                  placeholder="Adresse complète"
                  value={formModifier.adresse}
                  onChange={handleChangeModifier}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Classe</label>
                <div className="cours-selection-container">
                  {listeCours.map((cours) => (
                    <div
                      key={cours._id}
                      className={`cours-chip ${formModifier.cours.includes(cours.nom) ? 'selected' : ''}`}
                      onClick={() => handleSelectCoursModifier(cours.nom)}
                    >
                      <span className="cours-nom">{cours.nom}</span>
                      {formModifier.cours.includes(cours.nom) && (
                        <span className="cours-check">✓</span>
                      )}
                    </div>
                  ))}
                </div>
                {formModifier.cours.length > 0 && (
                  <div className="cours-selectionnes">
                    <small>Classe sélectionnés: {formModifier.cours.join(', ')}</small>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChangeModifier}
                />
                {etudiantAModifier.image && (
                  <div className="image-actuelle">
                    <small>Image actuelle :</small>
                    <img 
                      src={`http://localhost:5000${etudiantAModifier.image}`} 
                      alt="Image actuelle" 
                      className="image-preview"
                      style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}}
                    />
                  </div>
                )}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="actif"
                    checked={formModifier.actif}
                    onChange={handleChangeModifier}
                  />
                  Étudiant actif
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix Total</label>
                  <input
                    type="number"
                    name="prixTotal"
                    placeholder="Prix total"
                    value={formModifier.prixTotal}
                    onChange={handleChangeModifier}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Payé</label>
                  <select name="paye" value={formModifier.paye} onChange={handleChangeModifier}>
                    <option value={true}>Oui</option>
                    <option value={false}>Non</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pourcentage Bourse (%)</label>
                  <input
                    type="number"
                    name="pourcentageBourse"
                    placeholder="Pourcentage bourse"
                    value={formModifier.pourcentageBourse}
                    onChange={handleChangeModifier}
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                <div className="form-group">
                  <label>Type Paiement</label>
                  <select name="typePaiement" value={formModifier.typePaiement} onChange={handleChangeModifier}>
                    <option value="Cash">Cash</option>
                    <option value="Virement">Virement</option>
                    <option value="Chèque">Chèque</option>
                    <option value="En ligne">En ligne</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Année Scolaire *</label>
                <input
                  type="text"
                  name="anneeScolaire"
                  placeholder="ex: 2025/2026"
                  value={formModifier.anneeScolaire}
                  onChange={handleChangeModifier}
                  required
                  pattern="\d{4}/\d{4}"
                  title="Format attendu: YYYY/YYYY"
                />
              </div>

              {messageModifier && (
                <div className={`message-ajout ${messageModifier.includes('✅') ? 'success' : 'error'}`}>
                  {messageModifier}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={closeEditModal} className="btn-annuler">
                  Annuler
                </button>
                <button type="submit" disabled={loadingModifier} className="btn-enregistrer">
                  {loadingModifier ? 'Modification...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation d'étudiant */}
      {showViewModal && etudiantSelectionne && (
        <div className="modal-overlay" onClick={closeViewModal}>
          <div className="modal-content modal-view" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Informations de l'étudiant</h3>
              <button className="btn-fermer-modal" onClick={closeViewModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="etudiant-details">
              <div className="etudiant-header">
                <div className="etudiant-image-section">
                  {etudiantSelectionne.image ? (
                    <img 
                      src={`http://localhost:5000${etudiantSelectionne.image}`} 
                      alt="Photo de l'étudiant" 
                      className="etudiant-image-large"
                    />
                  ) : (
                    <div className="etudiant-image-placeholder">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <div className="etudiant-info-principal">
                  <h2>{etudiantSelectionne.nomComplet}</h2>
                  <div className="statut-badge">
                    <span className={`badge ${etudiantSelectionne.actif ? 'actif' : 'inactif'}`}>
                      {etudiantSelectionne.actif ? (
                        <>
                          <CheckCircle size={16} className="inline mr-1" /> Actif
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="inline mr-1" /> Inactif
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="etudiant-info-grid">
                <div className="info-card">
                  <div className="info-label">Genre</div>
                  <div className="info-value">
                    <User size={16} className="inline mr-1" /> {etudiantSelectionne.genre}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-label">Niveau</div>
                  <div className="info-value">
                    <GraduationCap size={16} className="inline mr-1" /> {etudiantSelectionne.niveau || 'Non défini'}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-label">Date de Naissance</div>
                  <div className="info-value">
                    <Calendar size={16} className="inline mr-1" /> {formatDate(etudiantSelectionne.dateNaissance)}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-label">Âge</div>
                  <div className="info-value">
                    <Cake size={16} className="inline mr-1" /> {calculerAge(etudiantSelectionne.dateNaissance)} ans
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-label">Téléphone Étudiant</div>
                  <div className="info-value">
                    <Phone size={16} className="inline mr-1" /> {etudiantSelectionne.telephoneEtudiant}
                  </div>
                </div>

                {etudiantSelectionne.telephonePere && (
                  <div className="info-card">
                    <div className="info-label">Téléphone Père</div>
                    <div className="info-value">
                      <Phone size={16} className="inline mr-1" /> {etudiantSelectionne.telephonePere}
                    </div>
                  </div>
                )}

                {etudiantSelectionne.telephoneMere && (
                  <div className="info-card">
                    <div className="info-label">Téléphone Mère</div>
                    <div className="info-value">
                      <Phone size={16} className="inline mr-1" /> {etudiantSelectionne.telephoneMere}
                    </div>
                  </div>
                )}

                <div className="info-card">
                  <div className="info-label">Code Massar</div>
                  <div className="info-value">{etudiantSelectionne.codeMassar}</div>
                </div>

                <div className="info-card">
                  <div className="info-label">Email</div>
                  <div className="info-value">
                    <Mail size={16} className="inline mr-1" /> {etudiantSelectionne.email}
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-label">Année Scolaire</div>
                  <div className="info-value">{etudiantSelectionne.anneeScolaire || 'Non définie'}</div>
                </div>

                {etudiantSelectionne.adresse && (
                  <div className="info-card full-width">
                    <div className="info-label">Adresse</div>
                    <div className="info-value">
                      <MapPin size={16} className="inline mr-1" /> {etudiantSelectionne.adresse}
                    </div>
                  </div>
                )}
              </div>

              <div className="cours-section">
                <h4>
                  <BookOpen size={20} className="inline mr-2" /> Classe Inscrits
                </h4>
                <div className="cours-badges">
                  {(Array.isArray(etudiantSelectionne.cours) && etudiantSelectionne.cours.length > 0) ? (
                    etudiantSelectionne.cours.map((cours, index) => (
                      <span key={index} className="cours-badge">{cours}</span>
                    ))
                  ) : (
                    <span className="no-cours">Aucun classe inscrit</span>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  onClick={() => {
                    closeViewModal();
                    openEditModal(etudiantSelectionne);
                  }}
                  className="btn-modifier-depuis-view"
                >
                  <Edit size={16} className="inline mr-1" /> Modifier
                </button>
                <button onClick={closeViewModal} className="btn-fermer">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeEtudiants;