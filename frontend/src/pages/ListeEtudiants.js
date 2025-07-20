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

  RotateCcw, X,
  Trash2 
} from "lucide-react";


const ListeEtudiants = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [etudiantsFiltres, setEtudiantsFiltres] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreGenre, setFiltreGenre] = useState('');
  const [filtreCours, setFiltreCours] = useState('');
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
  telephone: '',
  email: '',           // NOUVEAU
  motDePasse: '',      // NOUVEAU
  cours: [],
  actif: true
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
  telephone: '',
  email: '',           // NOUVEAU
  motDePasse: '',      // NOUVEAU
  cours: [],
  actif: true
});
  const [imageFileModifier, setImageFileModifier] = useState(null);
  const [messageModifier, setMessageModifier] = useState('');
  const [loadingModifier, setLoadingModifier] = useState(false);
  const [etudiantAModifier, setEtudiantAModifier] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchEtudiants();
    fetchCours();
  }, []);

  useEffect(() => {
    filtrerEtudiants();
  }, [etudiants, recherche, filtreGenre, filtreCours, filtreActif]);

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

  // Filtre par recherche (nom, téléphone, email)
if (recherche) {
  resultats = resultats.filter(e =>
    (e.nomComplet && e.nomComplet.toLowerCase().includes(recherche.toLowerCase())) ||
    (e.telephone && e.telephone.includes(recherche)) ||
    (e.email && e.email.toLowerCase().includes(recherche.toLowerCase()))
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
    telephone: '',
    email: '',           // NOUVEAU
    motDePasse: '',      // NOUVEAU
    cours: [],
    actif: true
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
    formData.append('telephone', formAjout.telephone);
    formData.append('email', formAjout.email);           // NOUVEAU
    formData.append('motDePasse', formAjout.motDePasse); // NOUVEAU
    formData.append('actif', formAjout.actif);

    formAjout.cours.forEach(c => formData.append('cours[]', c));
    if (imageFile) formData.append('image', imageFile);

    const response = await axios.post('http://localhost:5000/api/etudiants', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    setMessageAjout('✅ Étudiant ajouté avec succès');
    
    // Ajouter le nouvel étudiant à la liste
    setEtudiants([...etudiants, response.data]);
    
    // Réinitialiser le formulaire
    setFormAjout({
      nomComplet: '',
      genre: 'Homme',
      dateNaissance: '',
      telephone: '',
      email: '',           // NOUVEAU
      motDePasse: '',      // NOUVEAU
      cours: [],
      actif: true
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
    telephone: etudiant.telephone || '',
    email: etudiant.email || '',           // NOUVEAU
    motDePasse: '',                        // NOUVEAU (toujours vide pour sécurité)
    cours: etudiant.cours || [],
    actif: etudiant.actif ?? true
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
    telephone: '',
    email: '',           // NOUVEAU
    motDePasse: '',      // NOUVEAU
    cours: [],
    actif: true
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
    formData.append('telephone', formModifier.telephone);
    formData.append('email', formModifier.email);           // NOUVEAU
    
    // N'envoyer le mot de passe que s'il est rempli
    if (formModifier.motDePasse.trim() !== '') {            // NOUVEAU
      formData.append('motDePasse', formModifier.motDePasse);
    }
    
    formData.append('actif', formModifier.actif);

    formModifier.cours.forEach(c => formData.append('cours[]', c));
    if (imageFileModifier) formData.append('image', imageFileModifier);

    const response = await axios.put(`http://localhost:5000/api/etudiants/${etudiantAModifier._id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    setMessageModifier('✅ Étudiant modifié avec succès');
    
    // Mettre à jour la liste des étudiants
    setEtudiants(etudiants.map(e => e._id === etudiantAModifier._id ? response.data : e));
    
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
    if (!window.confirm("🛑 "

    )) return;

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
          
          {/* NOUVEAU: Boutons de basculement vue */}
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
              placeholder="Nom ou téléphone..."
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
            <label>Cours:</label>
            <select
              value={filtreCours}
              onChange={(e) => setFiltreCours(e.target.value)}
              className="select-filtre"
            >
              <option value="">Tous les cours</option>
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

      {/* Tableau des étudiants */}
    {/* Vue Tableau ou Cartes */}
{vueMode === 'tableau' ? (
  // VUE TABLEAU (votre code existant)
  <div className="tableau-container">
    <table className="tableau-etudiants">
      <thead>
        <tr>
          <th>Nom Complet</th>
          <th>Genre</th>
          <th>Date de Naissance</th>
          <th>Âge</th>
          <th>Téléphone</th>
          <th>Email</th>
          <th>Cours</th>
          <th>Statut</th>
          <th>Image</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {etudiantsActuels.length === 0 ? (
          <tr>
            <td colSpan="9" className="aucun-resultat">
              Aucun étudiant trouvé
            </td>
          </tr>
        ) : (
          etudiantsActuels.map((e) => (
            <tr key={e._id}>
              <td className="nom-colonne">{e.nomComplet}</td>
              <td>{e.genre}</td>
              <td>{formatDate(e.dateNaissance)}</td>
              <td>{calculerAge(e.dateNaissance)} ans</td>
              <td>{e.telephone}</td>
              <td>{e.email}</td>
              <td className="cours-colonne">
                {e.cours.join(', ')}
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
                   Voir
                </button>
                <button 
                  onClick={() => handleEdit(e)}
                  className="btn-modifier"
                >
                   Modifier
                </button>
                <button 
                  onClick={() => handleDelete(e._id)}
                  className="btn-supprimer"
                >
                   Supprimer
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
) : (
  // VUE CARTES (nouvelle)

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
                <span className="carte-label">Âge:</span>
                <span>{calculerAge(e.dateNaissance)} ans</span>
              </div>
              <div className="carte-detail">
                <span className="carte-label">Téléphone:</span>
         
                <span>
                  <Phone size={16} className="inline mr-1" /> {e.telephone}
                </span>
              </div>
                     <div className="carte-detail">
  <span className="carte-label">Email:</span>
  <span>{e.email}</span>
</div>
              <div className="carte-detail cours-detail">
                <span className="carte-label">Cours:</span>
                <div className="carte-cours">
                  {e.cours.length > 0 ? (
                    e.cours.map((cours, index) => (
                      <span key={index} className="cours-tag">{cours}</span>
                    ))
                  ) : (
                    <span className="no-cours">Aucun cours</span>
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

              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="text"
                  name="telephone"
                  placeholder="Téléphone"
                  value={formAjout.telephone}
                  onChange={handleChangeAjout}
                  required
                />
              </div>
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
    placeholder="Mot de passe"
    value={formAjout.motDePasse}
    onChange={handleChangeAjout}
    required
    minLength="6"
  />
</div>

              <div className="form-group">
                <label>Cours (multi-sélection possible)</label>
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
                    <small>Cours sélectionnés: {formAjout.cours.join(', ')}</small>
                  </div>
                )}
              </div>

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

              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="text"
                  name="telephone"
                  placeholder="Téléphone"
                  value={formModifier.telephone}
                  onChange={handleChangeModifier}
                  required
                />
              </div>
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

              <div className="form-group">
                <label>Cours (multi-sélection possible)</label>
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
                    <small>Cours sélectionnés: {formModifier.cours.join(', ')}</small>
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
          <div className="info-label">Téléphone</div>
          <div className="info-value">
            <Phone size={16} className="inline mr-1" /> {etudiantSelectionne.telephone}
          </div>
        </div>
      </div>
<div className="info-card">
  <div className="info-label">Email</div>
  <div className="info-value">
     {etudiantSelectionne.email}
  </div>
</div>
      <div className="cours-section">
        <h4>
          <BookOpen size={20} className="inline mr-2" /> Cours Inscrits
        </h4>
        <div className="cours-badges">
          {etudiantSelectionne.cours.length > 0 ? (
            etudiantSelectionne.cours.map((cours, index) => (
              <span key={index} className="cours-badge">{cours}</span>
            ))
          ) : (
            <span className="no-cours">Aucun cours inscrit</span>
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