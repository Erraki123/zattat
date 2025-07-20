import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, Users, Save, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/SidebarProf'; // Composant sidebar pour professeur
const AjouterPresence = () => {
  const [cours, setCours] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [selectedCours, setSelectedCours] = useState('');
  const [dateSession, setDateSession] = useState('');
  const [presences, setPresences] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCours = async () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        // 🔒 التحقق من الصلاحيات
        if (!token || role !== 'prof') {
          navigate('/');
          return;
        }

        const res = await axios.get('http://localhost:5000/api/professeur/mes-cours', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setCours(res.data);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des cours:', error);
      }
    };

    fetchCours();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleCoursChange = async (e) => {
    setSelectedCours(e.target.value);
    setPresences([]);
    setMessage('');

    if (!e.target.value) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/etudiants', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = res.data.filter(et => et.actif && et.cours.includes(e.target.value));

      const initialPresences = filtered.map(et => ({
        etudiant: et._id,
        nom: et.nomComplet,
        present: true,
        remarque: '',
      }));
      setPresences(initialPresences);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
    }
  };

  const handlePresenceChange = (index, field, value) => {
    const updated = [...presences];
    updated[index][field] = value;
    setPresences(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      for (const pres of presences) {
        await axios.post('http://localhost:5000/api/presences', {
          etudiant: pres.etudiant,
          cours: selectedCours,
          dateSession,
          present: pres.present,
          remarque: pres.remarque
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setMessage('success');
    } catch (err) {
      console.error('Erreur:', err);
      setMessage('error');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header moderne */}      <Sidebar onLogout={handleLogout} />

      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <div style={styles.iconContainer}>
              <Users style={styles.titleIcon} />
            </div>
            <h1 style={styles.title}>Enregistrement de Présence</h1>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={styles.mainContent}>
        <div style={styles.formCard}>
          {/* En-tête de la carte */}
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>
              <BookOpen style={styles.cardIcon} />
              <h2 style={styles.cardTitleText}>Configuration de la session</h2>
            </div>
          </div>

          {/* Formulaire */}
          <div style={styles.formContent}>
            {/* Sélection du cours */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <BookOpen style={styles.labelIcon} />
                Sélectionner un cours
              </label>
              <select 
                style={styles.select} 
                value={selectedCours} 
                onChange={handleCoursChange} 
                required
              >
                <option value="">Choisir un cours...</option>
                {cours.map(c => (
                  <option key={c._id} value={c.nom}>{c.nom}</option>
                ))}
              </select>
            </div>

            {/* Date de session */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Calendar style={styles.labelIcon} />
                Date de session
              </label>
              <input 
                type="date" 
                style={styles.input}
                value={dateSession} 
                onChange={e => setDateSession(e.target.value)} 
                required 
              />
            </div>

            {/* Liste des présences */}
            {presences.length > 0 && (
              <div style={styles.presenceSection}>
                <div style={styles.presenceHeader}>
                  <h3 style={styles.presenceTitle}>
                    <Users style={styles.presenceIcon} />
                    Liste des étudiants ({presences.length})
                  </h3>
                </div>
                
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>Étudiant</th>
                        <th style={styles.th}>Statut</th>
                        <th style={styles.th}>Remarque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presences.map((p, i) => (
                        <tr key={p.etudiant} style={styles.tableRow}>
                          <td style={styles.td}>
                            <div style={styles.studentInfo}>
                              <div style={styles.avatar}>
                                <span style={styles.avatarText}>
                                  {p.nom.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div style={styles.studentName}>{p.nom}</div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <select 
                              style={{
                                ...styles.statusSelect,
                                backgroundColor: p.present ? '#dcfce7' : '#fee2e2',
                                color: p.present ? '#166534' : '#991b1b',
                                borderColor: p.present ? '#bbf7d0' : '#fecaca'
                              }}
                              value={p.present} 
                              onChange={(e) => handlePresenceChange(i, 'present', e.target.value === 'true')}
                            >
                              <option value="true">✓ Présent</option>
                              <option value="false">✗ Absent</option>
                            </select>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.remarqueContainer}>
                              <MessageSquare style={styles.remarqueIcon} />
                              <input 
                                type="text" 
                                style={styles.remarqueInput}
                                value={p.remarque} 
                                onChange={(e) => handlePresenceChange(i, 'remarque', e.target.value)}
                                placeholder="Ajouter une remarque..."
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Bouton d'enregistrement */}
                <div style={styles.submitContainer}>
                  <button 
                    type="submit" 
                    style={styles.submitButton}
                    onClick={handleSubmit}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #1e40af, #3730a3)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #3b82f6, #4f46e5)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    <Save style={styles.buttonIcon} />
                    Enregistrer la présence
                  </button>
                </div>
              </div>
            )}

            {/* Message de statut */}
            {message && (
              <div style={{
                ...styles.messageContainer,
                backgroundColor: message === 'success' ? '#dcfce7' : '#fee2e2',
                borderColor: message === 'success' ? '#16a34a' : '#dc2626',
                color: message === 'success' ? '#166534' : '#991b1b'
              }}>
                {message === 'success' ? (
                  <>
                    <CheckCircle style={styles.messageIcon} />
                    Présence enregistrée avec succès !
                  </>
                ) : (
                  <>
                    <XCircle style={styles.messageIcon} />
                    Échec lors de l'enregistrement. Veuillez réessayer.
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(229, 231, 235, 0.6)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px 0'
  },
 
  titleIcon: {
    width: '32px',
    height: '32px',
    color: '#ffffff'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #1f2937, #374151)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0'
  },
  mainContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px'
  },
  formCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(229, 231, 235, 0.5)',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '24px 32px'
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  cardIcon: {
    width: '20px',
    height: '20px',
    color: 'black'
  },
  cardTitleText: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'black',
    margin: '0'
  },
  formContent: {
    padding: '32px'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  labelIcon: {
    width: '16px',
    height: '16px',
    color: '#3b82f6'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#374151',
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#374151',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  presenceSection: {
    marginTop: '32px',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px'
  },
  presenceHeader: {
    marginBottom: '16px'
  },
  presenceTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0'
  },
  presenceIcon: {
    width: '20px',
    height: '20px',
    color: '#3b82f6'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    marginBottom: '24px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#ffffff'
  },
  tableHeader: {
    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
  },
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e5e7eb'
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s ease'
  },
  td: {
    padding: '16px 20px',
    verticalAlign: 'middle'
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
  },
  avatarText: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600'
  },
  studentName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1f2937'
  },
  statusSelect: {
    padding: '8px 16px',
    border: '2px solid',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px'
  },
  remarqueContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    maxWidth: '250px'
  },
  remarqueIcon: {
    width: '16px',
    height: '16px',
    color: '#9ca3af',
    flexShrink: 0
  },
  remarqueInput: {
    flex: 1,
    padding: '8px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  submitContainer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '24px'
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #3b82f6, #4f46e5)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
  },
  buttonIcon: {
    width: '20px',
    height: '20px'
  },
  messageContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderRadius: '12px',
    border: '2px solid',
    marginTop: '24px',
    fontSize: '16px',
    fontWeight: '500'
  },
  messageIcon: {
    width: '20px',
    height: '20px'
  }
};

// CSS pour les effets hover et focus
const additionalStyles = `
  .form-select:focus, .form-input:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  .table-row:hover {
    background-color: #f8fafc !important;
  }
  
  .remarque-input:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  @media (max-width: 768px) {
    .main-content {
      padding: 16px !important;
    }
    
    .form-content {
      padding: 20px !important;
    }
    
    .title {
      font-size: 24px !important;
    }
    
    .table-container {
      font-size: 14px !important;
    }
    
    .th, .td {
      padding: 12px 8px !important;
    }
    
    .remarque-container {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 6px !important;
    }
    
    .submit-button {
      width: 100% !important;
      justify-content: center !important;
    }
  }
`;

// Ajouter les styles CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = additionalStyles;
document.head.appendChild(styleSheet);

export default AjouterPresence;