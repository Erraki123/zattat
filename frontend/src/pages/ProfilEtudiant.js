import React, { useEffect, useState } from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  BookOpen, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Users,
  FileText
} from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Ajout de l'import manquant
import Sidebar from '../components/Sidebar'; // ✅ استيراد صحيح
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

const ProfilEtudiant = () => {
  const { id } = useParams();
  
  const [etudiant, setEtudiant] = useState(null);
  const [paiements, setPaiements] = useState([]);
  const [expirés, setExpirés] = useState([]);
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
       
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Récupération des données de l'étudiant
        const resEtudiant = await axios.get(`http://localhost:5000/api/etudiants/${id}`, config);
        setEtudiant(resEtudiant.data);

        // Récupération de tous les paiements puis filtrage
        const resPaiements = await axios.get(`http://localhost:5000/api/paiements`, config);
        const paiementsEtudiant = resPaiements.data.filter(p => p.etudiant?._id === id);
        setPaiements(paiementsEtudiant);

        // Récupération des paiements expirés puis filtrage
        const resExp = await axios.get(`http://localhost:5000/api/paiements/exp`, config);
        const expirésEtudiant = resExp.data.filter(p => p.etudiant?._id === id);
        setExpirés(expirésEtudiant);

        // Récupération des présences pour cet étudiant
        const resPres = await axios.get(`http://localhost:5000/api/presences/etudiant/${id}`, config);
        setPresences(resPres.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLoading(false);
      } finally {
        setLoading(false); // ✅ Arrête le chargement dans tous les cas
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
        </div>
        <p style={styles.loadingText}>Chargement du profil étudiant...</p>
      </div>
    );
  }

  if (!etudiant) {
    return (
      <div style={styles.errorContainer}>
        <AlertTriangle size={48} color="#ef4444" />
        <h2>Étudiant introuvable</h2>
        <p>Vérifiez l'ID de l'étudiant et réessayez.</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
            <Sidebar onLogout={handleLogout} />

      {/* Header avec informations principales */}
      <div style={styles.headerSection}>
        <div style={styles.headerContent}>
          <div style={styles.profileHeader}>
            <div style={styles.avatarSection}>
              {etudiant.image ? (
                <img
                  src={`http://localhost:5000${etudiant.image}`}
                  alt="Profil étudiant"
                  style={styles.avatar}
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <User size={40} color="#fff" />
                </div>
              )}
              <div style={{
                ...styles.statusIndicator,
                backgroundColor: etudiant.actif ? '#22c55e' : '#ef4444'
              }}>
                {etudiant.actif ? 'Actif' : 'Inactif'}
              </div>
            </div>

            <div style={styles.studentInfo}>
              <h1 style={styles.studentName}>{etudiant.nomComplet}</h1>
              
              <div style={styles.infoCards}>
                <div style={styles.infoCard}>
                  <Calendar size={18} color="#6366f1" />
                  <div>
                    <span style={styles.infoLabel}>Date de naissance</span>
                    <span style={styles.infoValue}>
                      {new Date(etudiant.dateNaissance).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div style={styles.infoCard}>
                  <Phone size={18} color="#06b6d4" />
                  <div>
                    <span style={styles.infoLabel}>Téléphone</span>
                    <span style={styles.infoValue}>{etudiant.telephone}</span>
                  </div>
                </div>

                <div style={styles.infoCard}>
                  <BookOpen size={18} color="#f59e0b" />
                  <div>
                    <span style={styles.infoLabel}>Cours inscrits</span>
                    <div style={styles.coursesGrid}>
                      {etudiant.cours?.map((cours, index) => (
                        <span key={index} style={styles.courseTag}>{cours}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content principal */}
      <div style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          
          {/* Section Paiements */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>
                <CreditCard size={24} color="#10b981" />
                <h2>Historique des paiements</h2>
              </div>
              <div style={styles.counter}>
                <span>{paiements.length}</span>
              </div>
            </div>

            <div style={styles.sectionContent}>
              {paiements.length === 0 ? (
                <div style={styles.emptyState}>
                  <CreditCard size={48} color="#94a3b8" />
                  <h3>Aucun paiement enregistré</h3>
                  <p>Les paiements de cet étudiant apparaîtront ici une fois ajoutés.</p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>Cours</th>
                        <th style={styles.th}>Début</th>
                        <th style={styles.th}>Durée</th>
                        <th style={styles.th}>Montant</th>
                        <th style={styles.th}>Date paiement</th>
                        <th style={styles.th}>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paiements.map(p => (
                        <tr key={p._id} style={styles.tableRow}>
                          <td style={styles.td}>
                            <span style={styles.courseBadge}>{p.cours}</span>
                          </td>
                          <td style={styles.td}>
                            {new Date(p.moisDebut).toLocaleDateString('fr-FR')}
                          </td>
                          <td style={styles.td}>
                            <span style={styles.durationBadge}>{p.nombreMois} mois</span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.amountText}>{p.montant} DH</span>
                          </td>
                          <td style={styles.td}>
{p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '—'}

                          </td>
                          <td style={styles.td}>{p.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Section Paiements Expirés */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>
                <AlertTriangle size={24} color="#ef4444" />
                <h2>Paiements expirés</h2>
              </div>
              <div style={{...styles.counter, backgroundColor: '#fef2f2', color: '#dc2626'}}>
                <span>{expirés.length}</span>
              </div>
            </div>

            <div style={styles.sectionContent}>
              {expirés.length === 0 ? (
                <div style={styles.emptyState}>
                  <CheckCircle size={48} color="#22c55e" />
                  <h3>Aucun paiement expiré</h3>
                  <p>Tous les paiements de cet étudiant sont à jour.</p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={{...styles.tableHeader, backgroundColor: '#fef2f2'}}>
                        <th style={styles.th}>Cours</th>
                        <th style={styles.th}>Début</th>
                        <th style={styles.th}>Durée</th>
                        <th style={styles.th}>Montant</th>
                        <th style={styles.th}>Date expiration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expirés.map(p => {
                        const fin = new Date(p.moisDebut);
                        fin.setMonth(fin.getMonth() + p.nombreMois);
                        return (
                          <tr key={p._id} style={{...styles.tableRow, backgroundColor: '#fef9f9'}}>
                            <td style={styles.td}>
                              <span style={styles.courseBadge}>{p.cours}</span>
                            </td>
                            <td style={styles.td}>
                              {new Date(p.moisDebut).toLocaleDateString('fr-FR')}
                            </td>
                            <td style={styles.td}>
                              <span style={styles.durationBadge}>{p.nombreMois} mois</span>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.amountText}>{p.montant} DH</span>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.expiredBadge}>
                                {fin.toLocaleDateString('fr-FR')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Section Présences */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>
                <Users size={24} color="#8b5cf6" />
                <h2>Historique de présence</h2>
              </div>
              <div style={{...styles.counter, backgroundColor: '#f3f4f6', color: '#6b7280'}}>
                <span>{presences.length}</span>
              </div>
            </div>

            <div style={styles.sectionContent}>
              {presences.length === 0 ? (
                <div style={styles.emptyState}>
                  <Users size={48} color="#94a3b8" />
                  <h3>Aucun enregistrement de présence</h3>
                  <p>L'historique de présence de cet étudiant apparaîtra ici.</p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Cours</th>
                        <th style={styles.th}>Matière</th>
                        <th style={styles.th}>Période</th>
                        <th style={styles.th}>Statut</th>
                        <th style={styles.th}>Remarque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presences.map(p => (
                        <tr key={p._id} style={styles.tableRow}>
                          <td style={styles.td}>
                            {new Date(p.dateSession).toLocaleDateString('fr-FR')}
                          </td>
                          <td style={styles.td}>
                            <span style={styles.courseBadge}>{p.cours}</span>
                          </td>
                          <td style={styles.td}>
                            <span>{p.matiere || '—'}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ 
                              backgroundColor: '#fefce8', 
                              color: '#92400e', 
                              padding: '4px 8px', 
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              border: '1px solid #fde68a'
                            }}>
                              {p.periode === 'matin' ? 'Matin' : p.periode === 'soir' ? 'Soir' : '—'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.presenceStatus}>
                              {p.present ? (
                                <>
                                  <CheckCircle size={16} color="#22c55e" />
                                  <span style={styles.presentText}>Présent</span>
                                </>
                              ) : (
                                <>
                                  <XCircle size={16} color="#ef4444" />
                                  <span style={styles.absentText}>Absent</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td style={styles.td}>{p.remarque || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },

  loadingSpinner: {
    marginBottom: '20px'
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  loadingText: {
    color: '#6b7280',
    fontSize: '16px',
    fontWeight: '500'
  },

  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    color: '#6b7280'
  },

  headerSection: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },

  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px'
  },

  profileHeader: {
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      gap: '20px'
    }
  },

  avatarSection: {
    position: 'relative',
    flexShrink: 0
  },

  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '3px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },

  avatarPlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '12px',
    backgroundColor: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },

  statusIndicator: {
    position: 'absolute',
    bottom: '-8px',
    right: '-8px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },

  studentInfo: {
    flex: 1,
    minWidth: 0
  },

  studentName: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 24px 0',
    lineHeight: 1.2
  },

  infoCards: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
  },

  infoCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },

  infoLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px'
  },

  infoValue: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827'
  },

  coursesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '4px'
  },

  courseTag: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #bfdbfe'
  },

  mainContent: {
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)'
  },




  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px'
  },

  section: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    marginBottom: '32px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },

  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827'
  },

  counter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '32px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    padding: '0 8px'
  },

  sectionContent: {
    padding: '32px'
  },

  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#6b7280'
  },

  tableWrapper: {
    overflowX: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: '8px'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },

  tableHeader: {
    backgroundColor: '#f9fafb'
  },

  th: {
    padding: '16px 20px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e5e7eb'
  },

  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'backgroundColor 0.15s ease'
  },

  td: {
    padding: '16px 20px',
    verticalAlign: 'middle',
    color: '#374151'
  },

  courseBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #dbeafe'
  },

  durationBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #bbf7d0'
  },

  amountText: {
    fontWeight: '700',
    color: '#059669',
    fontSize: '16px'
  },

  expiredBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #fecaca'
  },

  presenceStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  presentText: {
    color: '#15803d',
    fontWeight: '500',
    fontSize: '13px'
  },

  absentText: {
    color: '#dc2626',
    fontWeight: '500',
    fontSize: '13px'
  }
};

// Ajout de l'animation CSS pour le spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ProfilEtudiant;