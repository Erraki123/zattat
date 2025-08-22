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
  FileText,
  Filter,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Hash,
  UserCheck,
  Percent,
  Receipt
} from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

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
  
  // États pour les filtres de présence
  const [presenceFilter, setPresenceFilter] = useState('all');
  const [showPresenceStats, setShowPresenceStats] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Récupération des données de l'étudiant
        const resEtudiant = await axios.get(`http://localhost:5000/api/etudiants/${id}`, config);
        setEtudiant(resEtudiant.data);

        // Récupération des paiements spécifiques à cet étudiant (OPTIMISÉ)
        const resPaiements = await axios.get(`http://localhost:5000/api/paiements/etudiant/${id}`, config);
        setPaiements(resPaiements.data);

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
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fonction pour calculer les statistiques de présence
  const getPresenceStats = () => {
    const total = presences.length;
    const present = presences.filter(p => p.present).length;
    const absent = total - present;
    const tauxPresence = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    
    return { total, present, absent, tauxPresence };
  };

  // Fonction pour filtrer les présences
  const getFilteredPresences = () => {
    switch (presenceFilter) {
      case 'present':
        return presences.filter(p => p.present);
      case 'absent':
        return presences.filter(p => !p.present);
      default:
        return presences;
    }
  };

  // Fonction pour calculer le montant à payer après bourse
  const getMontantAPayer = () => {
    if (!etudiant || !etudiant.prixTotal) return 0;
    const reduction = (etudiant.prixTotal * (etudiant.pourcentageBourse || 0)) / 100;
    return etudiant.prixTotal - reduction;
  };

  // Fonction pour obtenir le statut de paiement
  const getStatutPaiement = () => {
    if (!etudiant) return 'Inconnu';
    if (etudiant.paye) return 'Payé';
    if (etudiant.prixTotal === 0) return 'Gratuit';
    return 'En attente';
  };

  // Ajout des calculs de paiement total et déjà payé
  const getPaiementStats = () => {
    const totalPaye = paiements.reduce((acc, p) => acc + (p.montant || 0), 0);
    const prixTotal = etudiant?.prixTotal || 0;
    const reste = Math.max(0, prixTotal - totalPaye);
    return { prixTotal, totalPaye, reste };
  };

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

  const filteredPresences = getFilteredPresences();
  const stats = getPresenceStats();
  const montantAPayer = getMontantAPayer();
  const statutPaiement = getStatutPaiement();
  const paiementStats = getPaiementStats();

  return (
    <div style={styles.pageContainer}>
      {/* Header avec informations principales */}      <Sidebar onLogout={handleLogout} />
      
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
              
              {/* Informations personnelles de base */}
              <div style={styles.infoCards}>
                <div style={styles.infoCard}>
                  <User size={18} color="#8b5cf6" />
                  <div>
                    <span style={styles.infoLabel}>Genre</span>
                    <span style={styles.infoValue}>{etudiant.genre}</span>
                  </div>
                </div>

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
                  <Mail size={18} color="#06b6d4" />
                  <div>
                    <span style={styles.infoLabel}>Email</span>
                    <span style={styles.infoValue}>{etudiant.email}</span>
                  </div>
                </div>

                <div style={styles.infoCard}>
                  <Hash size={18} color="#f59e0b" />
                  <div>
                    <span style={styles.infoLabel}>Code Massar</span>
                    <span style={styles.infoValue}>{etudiant.codeMassar}</span>
                  </div>
                </div>
              </div>

              {/* Informations de contact */}
              <div style={styles.contactSection}>
                <h3 style={styles.sectionSubtitle}>Contacts</h3>
                <div style={styles.infoCards}>
                  <div style={styles.infoCard}>
                    <Phone size={18} color="#10b981" />
                    <div>
                      <span style={styles.infoLabel}>Téléphone étudiant</span>
                      <span style={styles.infoValue}>{etudiant.telephoneEtudiant}</span>
                    </div>
                  </div>

                  {etudiant.telephonePere && (
                    <div style={styles.infoCard}>
                      <Phone size={18} color="#3b82f6" />
                      <div>
                        <span style={styles.infoLabel}>Téléphone père</span>
                        <span style={styles.infoValue}>{etudiant.telephonePere}</span>
                      </div>
                    </div>
                  )}

                  {etudiant.telephoneMere && (
                    <div style={styles.infoCard}>
                      <Phone size={18} color="#ec4899" />
                      <div>
                        <span style={styles.infoLabel}>Téléphone mère</span>
                        <span style={styles.infoValue}>{etudiant.telephoneMere}</span>
                      </div>
                    </div>
                  )}

                  {etudiant.adresse && (
                    <div style={styles.infoCard}>
                      <MapPin size={18} color="#ef4444" />
                      <div>
                        <span style={styles.infoLabel}>Adresse</span>
                        <span style={styles.infoValue}>{etudiant.adresse}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations académiques */}
              <div style={styles.contactSection}>
                <h3 style={styles.sectionSubtitle}>Informations académiques</h3>
                <div style={styles.infoCards}>
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

                  {etudiant.lastSeen && (
                    <div style={styles.infoCard}>
                      <UserCheck size={18} color="#059669" />
                      <div>
                        <span style={styles.infoLabel}>Dernière connexion</span>
                        <span style={styles.infoValue}>
                          {new Date(etudiant.lastSeen).toLocaleDateString('fr-FR')} à {new Date(etudiant.lastSeen).toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content principal */}
      <div style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          {/* Section Informations Financières */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>
                <DollarSign size={24} color="#059669" />
                <h2>Informations financières</h2>
              </div>
              <div style={{
                ...styles.counter,
                backgroundColor: statutPaiement === 'Payé' ? '#d1fae5' : statutPaiement === 'Gratuit' ? '#e0f2fe' : '#fef3c7',
                color: statutPaiement === 'Payé' ? '#065f46' : statutPaiement === 'Gratuit' ? '#0369a1' : '#92400e'
              }}>
                {statutPaiement}
              </div>
            </div>

            <div style={styles.sectionContent}>
              <div style={styles.financialGrid}>
                <div style={styles.financialCard}>
                  <div style={styles.financialIcon}>
                    <DollarSign size={20} color="#059669" />
                  </div>
                  <div style={styles.financialContent}>
                    <span style={styles.financialLabel}>Prix total</span>
                    <span style={styles.financialValue}>{paiementStats.prixTotal} DH</span>
                  </div>
                </div>
                <div style={styles.financialCard}>
                  <div style={styles.financialIcon}>
                    <CheckCircle size={20} color="#10b981" />
                  </div>
                  <div style={styles.financialContent}>
                    <span style={styles.financialLabel}>Déjà payé</span>
                    <span style={styles.financialValue}>{paiementStats.totalPaye} DH</span>
                  </div>
                </div>
                <div style={styles.financialCard}>
                  <div style={styles.financialIcon}>
                    <AlertTriangle size={20} color="#dc2626" />
                  </div>
                  <div style={styles.financialContent}>
                    <span style={styles.financialLabel}>Reste à payer</span>
                    <span style={styles.financialValue}>{paiementStats.reste} DH</span>
                  </div>
                </div>

                {etudiant.pourcentageBourse > 0 && (
                  <div style={styles.financialCard}>
                    <div style={styles.financialIcon}>
                      <Percent size={20} color="#f59e0b" />
                    </div>
                    <div style={styles.financialContent}>
                      <span style={styles.financialLabel}>Bourse</span>
                      <span style={styles.financialValue}>{etudiant.pourcentageBourse}%</span>
                    </div>
                  </div>
                )}

                <div style={styles.financialCard}>
                  <div style={styles.financialIcon}>
                    <Receipt size={20} color="#3b82f6" />
                  </div>
                  <div style={styles.financialContent}>
                    <span style={styles.financialLabel}>Montant à payer</span>
                    <span style={styles.financialValue}>{montantAPayer} DH</span>
                  </div>
                </div>

                <div style={styles.financialCard}>
                  <div style={styles.financialIcon}>
                    <CreditCard size={20} color="#8b5cf6" />
                  </div>
                  <div style={styles.financialContent}>
                    <span style={styles.financialLabel}>Type de paiement</span>
                    <span style={styles.financialValue}>{etudiant.typePaiement || 'Cash'}</span>
                  </div>
                </div>

                {etudiant.dateEtReglement && (
                  <div style={styles.financialCard}>
                    <div style={styles.financialIcon}>
                      <Calendar size={20} color="#10b981" />
                    </div>
                    <div style={styles.financialContent}>
                      <span style={styles.financialLabel}>Date de règlement</span>
                      <span style={styles.financialValue}>{etudiant.dateEtReglement}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
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
              <div style={styles.presenceHeaderControls}>
                <button
                  onClick={() => setShowPresenceStats(!showPresenceStats)}
                  style={styles.toggleStatsBtn}
                >
                  {showPresenceStats ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPresenceStats ? 'Masquer stats' : 'Voir stats'}
                </button>
                
                <div style={styles.filterContainer}>
                  <Filter size={16} color="#6b7280" />
                  <select
                    value={presenceFilter}
                    onChange={(e) => setPresenceFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="all">Tout afficher ({presences.length})</option>
                    <option value="present">Présent ({stats.present})</option>
                    <option value="absent">Absent ({stats.absent})</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Statistiques de présence */}
            {showPresenceStats && presences.length > 0 && (
              <div style={styles.presenceStatsContainer}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    <CheckCircle size={20} color="#22c55e" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statLabel}>Présences</span>
                    <span style={styles.statValue}>{stats.present}</span>
                  </div>
                </div>
                
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    <XCircle size={20} color="#ef4444" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statLabel}>Absences</span>
                    <span style={styles.statValue}>{stats.absent}</span>
                  </div>
                </div>
                
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    <Users size={20} color="#8b5cf6" />
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statLabel}>Total sessions</span>
                    <span style={styles.statValue}>{stats.total}</span>
                  </div>
                </div>
                
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: `conic-gradient(#22c55e 0% ${stats.tauxPresence}%, #e5e7eb ${stats.tauxPresence}% 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#374151'
                    }}>
                      %
                    </div>
                  </div>
                  <div style={styles.statContent}>
                    <span style={styles.statLabel}>Taux présence</span>
                    <span style={styles.statValue}>{stats.tauxPresence}%</span>
                  </div>
                </div>
              </div>
            )}

            <div style={styles.sectionContent}>
              {filteredPresences.length === 0 ? (
                <div style={styles.emptyState}>
                  <Users size={48} color="#94a3b8" />
                  <h3>
                    {presenceFilter === 'all' 
                      ? 'Aucun enregistrement de présence'
                      : presenceFilter === 'present'
                      ? 'Aucune présence trouvée'
                      : 'Aucune absence trouvée'
                    }
                  </h3>
                  <p>
                    {presenceFilter === 'all'
                      ? "L'historique de présence de cet étudiant apparaîtra ici."
                      : `Aucun enregistrement de type "${presenceFilter}" pour cet étudiant.`
                    }
                  </p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Cours</th>
                        <th style={styles.th}>Matière</th>
                        <th style={styles.th}>Période & Heure</th>
                        <th style={styles.th}>Statut</th>
                        <th style={styles.th}>Remarque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPresences.map(p => (
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
                            <div style={styles.periodeHeureContainer}>
                              <span style={styles.periodeBadge}>
                                {p.periode === 'matin' ? 'Matin' : p.periode === 'soir' ? 'Soir' : '—'}
                              </span>
                              <span style={styles.heureBadge}>
                                {p.heure || '—'}
                              </span>
                            </div>
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

  // Section pour grouper les informations
  contactSection: {
    marginTop: '24px'
  },

  sectionSubtitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 16px 0',
    paddingBottom: '8px',
    borderBottom: '2px solid #e5e7eb'
  },

  infoCards: {
    display: 'grid',
    gap: '16px',
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

  // Nouveaux styles pour les informations financières
  financialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },

  financialCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },

  financialIcon: {
    flexShrink: 0,
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e5e7eb'
  },

  financialContent: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },

  financialLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px'
  },

  financialValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827'
  },

  // Contrôles de présence
  presenceHeaderControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  toggleStatsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  filterSelect: {
    padding: '6px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },

  // Statistiques de présence
  presenceStatsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    padding: '20px 32px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e5e7eb'
  },

  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },

  statIcon: {
    flexShrink: 0
  },

  statContent: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },

  statLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '2px'
  },

  statValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827'
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

  // Styles pour période + heure combinés
  periodeHeureContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  periodeBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#fefce8',
    color: '#92400e',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #fde68a'
  },

  heureBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#eef2ff',
    color: '#4338ca',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #c7d2fe'
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
  
  .toggleStatsBtn:hover {
    background-color: #e5e7eb !important;
    transform: translateY(-1px);
  }
  
  .filterSelect:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  .tableRow:hover {
    background-color: #f9fafb !important;
  }
`;
document.head.appendChild(styleSheet);

export default ProfilEtudiant;