import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, User, Eye, X, Users, GraduationCap, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const ListeCours = () => {
  const [cours, setCours] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [coursActuel, setCoursActuel] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [professeurs_selectionnes, setProfesseursSelectionnes] = useState([]);

  // États pour le modal d'ajout de cours
  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [nom, setNom] = useState('');
  // const [professeur, setProfesseur] = useState(''); // ❌ plus utilisé
  const [message, setMessage] = useState('');

  // États pour le modal de confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [coursASupprimer, setCoursASupprimer] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    const fetchCoursEtEtudiants = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const resCours = await fetch('http://localhost:5000/api/cours', config);
        const resEtudiants = await fetch('http://localhost:5000/api/etudiants', config);
        const resProfs = await fetch('http://localhost:5000/api/professeurs', config);

        if (resCours.ok && resEtudiants.ok && resProfs.ok) {
          const coursData = await resCours.json();
          const etudiantsData = await resEtudiants.json();
          const profsData = await resProfs.json();
          
          setCours(coursData);
          setEtudiants(etudiantsData);
          setProfesseurs(profsData);
        }
      } catch (err) {
        console.error('Erreur de chargement:', err);
      }
    };

    fetchCoursEtEtudiants();
  }, []);

  const afficherDetails = (coursSelectionne) => {
    setCoursActuel(coursSelectionne);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Fonction pour ajouter un cours
  const handleAjoutCours = async (e) => {
    e.preventDefault();

  if (!nom.trim()) {
  setMessage('❌ Veuillez remplir le nom du cours');
  return;
}

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nom: nom.trim(),
          professeur: professeurs_selectionnes // tableau de noms
        })
      });

      if (response.ok) {
        const nouveauCours = await response.json();
        setCours([...cours, nouveauCours]);

        setMessage('✅ Cours ajouté avec succès');
        setNom('');
        setProfesseursSelectionnes([]);

        setTimeout(() => {
          setShowAjoutModal(false);
          setMessage('');
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage('❌ Erreur: ' + (errorData.message || 'Erreur inconnue'));
      }

    } catch (err) {
      setMessage('❌ Erreur: ' + (err.message || 'Erreur de connexion'));
    }
  };

  // Fonction pour ouvrir le modal de confirmation de suppression
  const ouvrirModalSuppression = (cours) => {
    setCoursASupprimer(cours);
    setShowDeleteModal(true);
    setDeleteMessage('');
  };

  // Fonction pour supprimer un cours
  const handleSupprimerCours = async () => {
    if (!coursASupprimer) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/cours/${coursASupprimer._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Mettre à jour la liste des cours en supprimant le cours supprimé
        setCours(cours.filter(c => c._id !== coursASupprimer._id));
        
        setDeleteMessage('✅ Cours supprimé avec succès');
        
        setTimeout(() => {
          setShowDeleteModal(false);
          setCoursASupprimer(null);
          setDeleteMessage('');
        }, 1500);
      } else {
        const errorData = await response.json();
        setDeleteMessage('❌ Erreur: ' + (errorData.message || 'Erreur lors de la suppression'));
      }
      
    } catch (err) {
      setDeleteMessage('❌ Erreur: ' + (err.message || 'Erreur de connexion'));
    }
  };

  // Fonction pour fermer le modal d'ajout
  const fermerModalAjout = () => {
    setShowAjoutModal(false);
    setNom('');
    setProfesseursSelectionnes([]);
    setMessage('');
  };

  // Fonction pour fermer le modal de suppression
  const fermerModalSuppression = () => {
    setShowDeleteModal(false);
    setCoursASupprimer(null);
    setDeleteMessage('');
  };

  const etudiantsDansCours = coursActuel
    ? etudiants.filter(e => e.cours.includes(coursActuel.nom))
    : [];

  const styles = {
    container: {
      minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    innerContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem 1rem'
    },
    header: {
      backdropFilter: 'blur(10px)',
      backgroundColor: 'white',
      borderRadius: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      marginBottom: '2rem'
    },
    headerContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '20px'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #1f2937, #4b5563)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: '0'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '0.875rem',
      margin: '0.25rem 0 0 0'
    },
    addButton: {
      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
      fontSize: '1rem'
    },
    coursGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem'
    },
    coursCard: {
      backdropFilter: 'blur(10px)',
      backgroundColor: 'white',
      borderRadius: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      position: 'relative'
    },
    coursCardHovered: {
      backgroundColor: 'white',
      transform: 'translateY(-8px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    coursCardContent: {
      padding: '1.5rem',
      minHeight: '180px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    coursCardTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    coursIcon: {
      padding: '0.75rem',
      background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
      borderRadius: '0.75rem',
      transition: 'all 0.3s ease'
    },
    coursIconHovered: {
      background: 'linear-gradient(135deg, #bfdbfe, #c7d2fe)'
    },
    studentCount: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    coursTitle: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '0.5rem',
      transition: 'color 0.2s ease'
    },
    coursTitleHovered: {
      color: '#2563eb'
    },
    professeurInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#6b7280',
      marginBottom: '1rem',
      fontSize: '0.875rem'
    },
    coursFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '1rem',
      borderTop: '1px solid #f3f4f6'
    },
    badge: {
      backgroundColor: '#eff6ff',
      color: '#2563eb',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      display: 'inline-block'
    },
    // Nouveau style pour le bouton de suppression
    deleteButton: {
      padding: '0.5rem',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    deleteButtonHovered: {
      backgroundColor: '#dc2626',
      color: 'white',
      borderColor: '#dc2626'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      width: '100%',
      maxWidth: '28rem',
      maxHeight: '90vh',
      overflow: 'hidden'
    },
    modalHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #f3f4f6'
    },
    modalHeaderContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    modalHeaderLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    modalIconContainer: {
      padding: '0.5rem',
      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    // Style pour l'icône de suppression dans le modal
    deleteModalIconContainer: {
      padding: '0.5rem',
      background: 'linear-gradient(135deg, #dc2626, #ef4444)',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    closeButton: {
      padding: '0.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    modalBody: {
      padding: '1.5rem'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      backgroundColor: '#f9fafb',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      backgroundColor: '#f9fafb',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.75rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5em 1.5em',
      paddingRight: '2.5rem'
    },
    message: {
      padding: '1rem',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '1rem'
    },
    messageSuccess: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0'
    },
    messageError: {
      backgroundColor: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca'
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.75rem',
      paddingTop: '1.5rem'
    },
    cancelButton: {
      flex: 1,
      padding: '0.75rem 1rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: 'none',
      borderRadius: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    submitButton: {
      flex: 1,
      padding: '0.75rem 1rem',
      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
      color: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease'
    },
    // Bouton de suppression dans le modal
    deleteSubmitButton: {
      flex: 1,
      padding: '0.75rem 1rem',
      background: 'linear-gradient(135deg, #dc2626, #ef4444)',
      color: 'white',
      border: 'none',
      borderRadius: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease'
    },
    detailsModalContent: {
      width: '100%',
      maxWidth: '32rem'
    },
    detailsBody: {
      padding: '1.5rem',
      maxHeight: '60vh',
      overflowY: 'auto'
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    sectionTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    emptyState: {
      textAlign: 'center',
      padding: '2rem'
    },
    emptyIcon: {
      padding: '0.75rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '50%',
      width: '3rem',
      height: '3rem',
      margin: '0 auto 0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    studentList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    studentItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.75rem',
      transition: 'background-color 0.2s ease'
    },
    studentInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    studentIcon: {
      padding: '0.5rem',
      backgroundColor: '#dbeafe',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    studentName: {
      fontWeight: '500',
      color: '#1f2937'
    },
    viewButton: {
      padding: '0.5rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    // Style pour le texte de confirmation de suppression
    deleteConfirmationText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '1rem',
      lineHeight: '1.5'
    },
    deleteWarning: {
      fontSize: '0.875rem',
      color: '#dc2626',
      fontWeight: '600',
      marginBottom: '1rem'
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar onLogout={handleLogout} />

      <div style={styles.innerContainer}>
        {/* Header moderne */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={{ ...styles.headerLeft, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <div style={styles.iconContainer}>
              </div>
              <div>
                <h1 style={{ ...styles.title, textAlign: 'center', width: '100%' }}>Gestion des classe</h1>
              </div>
            </div>
            <button
              onClick={() => setShowAjoutModal(true)}
              style={styles.addButton}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
            >
              <Plus size={20} />
              Nouveau classe
            </button>
          </div>
        </div>

        {/* Grille des cours */}
        <div style={styles.coursGrid}>
          {cours.map((c) => {
            const nombreEtudiants = etudiants.filter(e => e.cours.includes(c.nom)).length;
            const isHovered = hoveredCard === c._id;
            
            return (
              <div 
                key={c._id}
                style={{
                  ...styles.coursCard,
                  ...(isHovered ? styles.coursCardHovered : {})
                }}
                onMouseEnter={() => setHoveredCard(c._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={styles.coursCardContent}>
                  <div 
                    onClick={() => afficherDetails(c)}
                    style={{cursor: 'pointer'}}
                  >
                    <div style={styles.coursCardTop}>
                      <div 
                        style={{
                          ...styles.coursIcon,
                          ...(isHovered ? styles.coursIconHovered : {})
                        }}
                      >
                        <BookOpen size={24} color="#2563eb" />
                      </div>
                      <div style={styles.studentCount}>
                        <Users size={16} />
                        <span>{nombreEtudiants}</span>
                      </div>
                    </div>
                    
                    <h3 
                      style={{
                        ...styles.coursTitle,
                        ...(isHovered ? styles.coursTitleHovered : {})
                      }}
                    >
                      {c.nom}
                    </h3>
                    
                    <div style={styles.professeurInfo}>
  <User size={16} />
  <span>
    {Array.isArray(c.professeur)
      ? c.professeur.join(', ')
      : c.professeur || 'Non assigné'}
  </span>
</div>

                  </div>
                  
                  <div style={styles.coursFooter}>
                    <span style={styles.badge}>
                      {nombreEtudiants} étudiant{nombreEtudiants !== 1 ? 's' : ''}
                    </span>
                    
                    {/* Bouton de suppression */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Empêche l'ouverture du modal de détails
                        ouvrirModalSuppression(c);
                      }}
                      style={styles.deleteButton}
                      onMouseEnter={(e) => {
                        Object.assign(e.target.style, styles.deleteButtonHovered);
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#fef2f2';
                        e.target.style.color = '#dc2626';
                        e.target.style.borderColor = '#fecaca';
                      }}
                      title="Supprimer ce cours"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message si aucun cours */}
        {cours.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <BookOpen size={24} color="#9ca3af" />
            </div>
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem'}}>
              Aucun cours disponible
            </h3>
            <p style={{color: '#9ca3af'}}>Commencez par ajouter votre premier cours</p>
          </div>
        )}
      </div>

      {/* Modal d'ajout de cours */}
      {showAjoutModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderContent}>
                <div style={styles.modalHeaderLeft}>
                  <div style={styles.modalIconContainer}>
                    <Plus size={20} color="white" />
                  </div>
                  <h2 style={styles.modalTitle}>Nouveau Cours</h2>
                </div>
                <button
                  onClick={fermerModalAjout}
                  style={styles.closeButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={20} color="#6b7280" />
                </button>
              </div>
            </div>

            <div style={styles.modalBody}>
              <form onSubmit={handleAjoutCours}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nom du cours</label>
                  <input
                    type="text"
                    placeholder="Ex: Mathématiques, Physique..."
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Professeurs avec checkboxes */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Professeurs</label>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '8px',
                    backgroundColor: '#f9fafb'
                  }}>
                    {professeurs.map((p) => (
                      <label key={p._id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px',
                        cursor: 'pointer',
                        borderRadius: '0.5rem',
                        transition: 'background-color 0.2s ease'
                      }}
                        onMouseEnter={e => { e.target.style.backgroundColor = '#e5e7eb'; }}
                        onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; }}
                      >
                        <input
                          type="checkbox"
                          checked={professeurs_selectionnes.includes(p.nom)}
                          onChange={() => {
                            setProfesseursSelectionnes(prev =>
                              prev.includes(p.nom)
                                ? prev.filter(nom => nom !== p.nom)
                                : [...prev, p.nom]
                            );
                          }}
                          style={{
                            marginRight: '12px',
                            width: '16px',
                            height: '16px',
                            accentColor: '#3b82f6'
                          }}
                        />
                        <span style={{ fontSize: '0.875rem' }}>
                          {p.nom} - {p.matiere}
                        </span>
                      </label>
                    ))}
                  </div>
                  {/* Affichage des sélections */}
                  {professeurs_selectionnes.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                        {professeurs_selectionnes.length} professeur(s) sélectionné(s)
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {professeurs_selectionnes.map((nom, index) => (
                          <span key={index} style={{
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            border: '1px solid #bfdbfe'
                          }}>
                            {nom}
                            <button
                              type="button"
                              onClick={() => setProfesseursSelectionnes(prev => prev.filter(n => n !== nom))}
                              style={{
                                marginLeft: '5px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#1e40af',
                                fontWeight: 'bold'
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message && (
                  <div style={{
                    ...styles.message,
                    ...(message.includes('✅') ? styles.messageSuccess : styles.messageError)
                  }}>
                    {message}
                  </div>
                )}

                <div style={styles.buttonGroup}>
                  <button
                    type="button"
                    onClick={fermerModalAjout}
                    style={styles.cancelButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={styles.submitButton}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderContent}>
                <div style={styles.modalHeaderLeft}>
                  <div style={styles.deleteModalIconContainer}>
                    <Trash2 size={20} color="white" />
                  </div>
                  <h2 style={styles.modalTitle}>Supprimer le cours</h2>
                </div>
                <button
                  onClick={fermerModalSuppression}
                  style={styles.closeButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={20} color="#6b7280" />
                </button>
              </div>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.deleteConfirmationText}>
                Êtes-vous sûr de vouloir supprimer le cours <strong>"{coursASupprimer?.nom}"</strong> ?
              </div>
              <div style={styles.deleteWarning}>
                ⚠️ Cette action est irréversible et supprimera définitivement le cours.
              </div>

              {deleteMessage && (
                <div style={{
                  ...styles.message,
                  ...(deleteMessage.includes('✅') ? styles.messageSuccess : styles.messageError)
                }}>
                  {deleteMessage}
                </div>
              )}

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={fermerModalSuppression}
                  style={styles.cancelButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSupprimerCours}
                  style={styles.deleteSubmitButton}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {coursActuel && (
        <div style={styles.modal}>
          <div style={{...styles.modalContent, ...styles.detailsModalContent}}>
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderContent}>
                <div style={styles.modalHeaderLeft}>
                  <div style={styles.modalIconContainer}>
                    <BookOpen size={20} color="white" />
                  </div>
                  <div>
                    <h2 style={styles.modalTitle}>{coursActuel.nom}</h2>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem'}}>
  <User size={16} />
  <span>
    {Array.isArray(coursActuel.professeur)
      ? coursActuel.professeur.join(', ')
      : coursActuel.professeur || 'Non assigné'}
  </span>
</div>

                  </div>
                </div>
                <button
                  onClick={() => setCoursActuel(null)}
                  style={styles.closeButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={20} color="#6b7280" />
                </button>
              </div>
            </div>

            <div style={styles.detailsBody}>
              <div style={styles.sectionHeader}>
                <Users size={20} color="#2563eb" />
                <h3 style={styles.sectionTitle}>
                  Étudiants inscrits ({etudiantsDansCours.length})
                </h3>
              </div>
              
              {etudiantsDansCours.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>
                    <Users size={24} color="#9ca3af" />
                  </div>
                  <p style={{color: '#9ca3af', margin: 0}}>Aucun étudiant inscrit dans ce cours</p>
                </div>
              ) : (
                <div style={styles.studentList}>
                  {etudiantsDansCours.map(e => (
                    <div 
                      key={e._id} 
                      style={styles.studentItem}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                      }}
                    >
                      <div style={styles.studentInfo}>
                        <div style={styles.studentIcon}>
                          <User size={16} color="#2563eb" />
                        </div>
                        <span style={styles.studentName}>{e.nomComplet}</span>
                      </div>
                      <button
                        onClick={() => window.location.href = `/etudiants/${e._id}`}
                        style={styles.viewButton}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#3b82f6';
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeCours;