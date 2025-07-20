import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Sidebar from '../components/Sidebar';
import {
  Save,
  UserRoundSearch,
  BookOpen,
  Calendar,
  BadgeEuro,
  StickyNote
} from 'lucide-react';

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

const AjouterPaiement = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [cours, setCours] = useState([]);
  const [etudiantsComplets, setEtudiantsComplets] = useState([]); // Pour stocker les données complètes des étudiants
  const [form, setForm] = useState({
    etudiant: '',
    cours: [],
    moisDebut: '',
    nombreMois: 1,
    montant: '',
    note: ''
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const resEtudiants = await axios.get('http://localhost:5000/api/etudiants', config);
        const resCours = await axios.get('http://localhost:5000/api/cours', config);

        // Stocker les données complètes des étudiants
        setEtudiantsComplets(resEtudiants.data.filter(e => e.actif));

        setEtudiants(resEtudiants.data
          .filter(e => e.actif)
          .map(e => ({ value: e._id, label: e.nomComplet })));

        setCours(resCours.data.map(c => ({ value: c.nom, label: c.nom })));

        const savedData = JSON.parse(localStorage.getItem('paiementPreRempli'));
        if (savedData) {
          setForm(prev => ({
            ...prev,
            etudiant: savedData.etudiant || '',
            cours: savedData.cours || []
          }));
          localStorage.removeItem('paiementPreRempli');
        }
      } catch (err) {
        console.error('Erreur chargement données:', err);
      }
    };

    fetchData();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Fonction pour gérer la sélection d'un étudiant
  const handleEtudiantChange = (selectedEtudiant) => {
    if (selectedEtudiant) {
      // Trouver l'étudiant complet avec ses cours
      const etudiantComplet = etudiantsComplets.find(e => e._id === selectedEtudiant.value);
      
      // Extraire les cours de l'étudiant (supposons que les cours sont dans un champ 'cours' ou 'coursInscrits')
      let coursEtudiant = [];
      if (etudiantComplet && etudiantComplet.cours) {
        // Si les cours sont stockés comme un tableau de noms
        coursEtudiant = etudiantComplet.cours;
      } else if (etudiantComplet && etudiantComplet.coursInscrits) {
        // Si les cours sont dans un champ 'coursInscrits'
        coursEtudiant = etudiantComplet.coursInscrits;
      }
      
      setForm({
        ...form,
        etudiant: selectedEtudiant.value,
        cours: coursEtudiant
      });
    } else {
      setForm({
        ...form,
        etudiant: '',
        cours: []
      });
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/paiements', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✅ Paiement ajouté avec succès');
      setForm({
        etudiant: '',
        cours: [],
        moisDebut: '',
        nombreMois: 1,
        montant: '',
        note: ''
      });
    } catch (err) {
      console.error('Erreur ajout:', err);
      setMessage('❌ Erreur lors de l\'ajout du paiement');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)',
      padding: '20px'
    },
    formContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '30px'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1f2937',
      textAlign: 'center',
      marginBottom: '30px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '25px'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '25px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      resize: 'vertical',
      minHeight: '80px',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '30px'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    buttonHover: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
    },
    message: {
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '8px',
      textAlign: 'center',
      color: '#15803d',
      fontWeight: '500'
    },
    messageError: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      color: '#dc2626'
    }
  };

  const mediaQueries = `
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr !important;
      }
      .form-container {
        padding: 20px !important;
      }
      .title {
        font-size: 1.5rem !important;
      }
    }
  `;

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '44px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af'
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e0f2fe',
      borderRadius: '6px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#0369a1'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#0369a1',
      '&:hover': {
        backgroundColor: '#0369a1',
        color: 'white'
      }
    })
  };

  return (
    <>
      <style>{mediaQueries}</style>
      <div style={styles.container}>
        <Sidebar onLogout={handleLogout} />
        
        <div style={styles.formContainer} className="form-container">
          <h2 style={styles.title} className="title">Ajouter un Paiement</h2>

          <div style={styles.formGrid}>
            {/* Première ligne - Étudiant et Cours */}
            <div style={styles.formRow} className="form-row">
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <UserRoundSearch size={16} style={{color: '#3b82f6'}} />
                  Étudiant
                </label>
                <Select
                  options={etudiants}
                  value={etudiants.find(e => e.value === form.etudiant)}
                  onChange={handleEtudiantChange}
                  placeholder="Sélectionner un étudiant"
                  isSearchable
                  styles={selectStyles}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <BookOpen size={16} style={{color: '#10b981'}} />
                  Cours
                </label>
                <Select
                  options={cours}
                  value={cours.filter(option => form.cours.includes(option.value))}
                  onChange={selectedOptions => 
                    setForm({ 
                      ...form, 
                      cours: selectedOptions ? selectedOptions.map(opt => opt.value) : []
                    })
                  }
                  placeholder="Cours sélectionnés automatiquement"
                  isMulti
                  isSearchable
                  styles={selectStyles}
                />
              </div>
            </div>

            {/* Deuxième ligne - Date de début et Nombre de mois */}
            <div style={styles.formRow} className="form-row">
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Calendar size={16} style={{color: '#8b5cf6'}} />
                  Date de début
                </label>
                <input
                  type="date"
                  name="moisDebut"
                  value={form.moisDebut}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Calendar size={16} style={{color: '#f59e0b'}} />
                  Nombre de mois
                </label>
                <input
                  type="number"
                  name="nombreMois"
                  value={form.nombreMois}
                  onChange={handleChange}
                  min="1"
                  required
                  style={styles.input}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>

            {/* Troisième ligne - Montant et Note */}
            <div style={styles.formRow} className="form-row">
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <BadgeEuro size={16} style={{color: '#10b981'}} />
                  Montant
                </label>
                <input
                  type="number"
                  name="montant"
                  value={form.montant}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  style={styles.input}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <StickyNote size={16} style={{color: '#eab308'}} />
                  Note (optionnel)
                </label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Ajouter une note..."
                  style={styles.textarea}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>

            {/* Bouton de soumission */}
            <div style={styles.buttonContainer}>
              <button
                onClick={handleSubmit}
                style={styles.button}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                <Save size={18} />
                Enregistrer le Paiement
              </button>
            </div>
          </div>

          {/* Message de confirmation */}
          {message && (
            <div style={message.includes('❌') ? {...styles.message, ...styles.messageError} : styles.message}>
              {message}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AjouterPaiement;