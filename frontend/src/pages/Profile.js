import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Phone, 
  User, 
  CheckCircle, 
  XCircle, 
  BookOpen,
  GraduationCap,
  MapPin,
  Hash,
  Users,
  DollarSign,
  Percent,
  Receipt,
  CreditCard
} from 'lucide-react';
import Sidebar from '../components/sidebaretudiant';
import { useNavigate } from 'react-router-dom';

const handleLogout = () => {
  // Note: In production, use React state instead of localStorage
  localStorage.removeItem('token');
  window.location.href = '/';
};

const ProfileEtudiant = () => {
  const [etudiant, setEtudiant] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (role !== 'etudiant' || !token) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/etudiant/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('Échec de chargement du profil');
        }

        const data = await res.json();
        setEtudiant(data);
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const calculerAge = (dateNaissance) => {
    if (!dateNaissance) return 'N/A';
    const dob = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  const formatDate = (date) => {
    if (!date) return 'Non renseigné';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Ajout du calcul du montant à payer après bourse
  const getMontantAPayer = () => {
    if (!etudiant || !etudiant.prixTotal) return 0;
    const reduction = (etudiant.prixTotal * (etudiant.pourcentageBourse || 0)) / 100;
    return etudiant.prixTotal - reduction;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Chargement du profil...</p>
      </div>
    );
  }

  if (!etudiant) {
    return (
      <div style={styles.errorContainer}>
        <XCircle size={48} color="#ef4444" />
        <p style={styles.errorText}>Étudiant non trouvé</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Sidebar onLogout={handleLogout} />
      <div style={styles.header}>
        <div style={{ ...styles.headerContent, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h1 style={{ ...styles.headerTitle, textAlign: 'center', width: '100%' }}>Mon Profil</h1>
        </div>
      </div>
      <div style={styles.mainContent}>
        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.avatarContainer}>
              {etudiant.image ? (
                <img
                  src={`http://localhost:5000${etudiant.image}`}
                  alt="Profil"
                  style={styles.avatar}
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <User size={40} color="#6b7280" />
                </div>
              )}
              <div style={styles.statusBadge}>
                {etudiant.actif ? (
                  <CheckCircle size={16} color="#10b981" />
                ) : (
                  <XCircle size={16} color="#ef4444" />
                )}
              </div>
            </div>
            <div style={styles.profileInfo}>
              <h2 style={styles.profileName}>{etudiant.nomComplet}</h2>
              <p style={styles.profileEmail}>{etudiant.email}</p>
              <div style={styles.statusContainer}>
                <span style={{
                  ...styles.statusText,
                  color: etudiant.actif ? '#10b981' : '#ef4444'
                }}>
                  {etudiant.actif ? 'Compte Actif' : 'Compte Inactif'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div style={styles.cardsGrid}>
          {/* Personal Information */}
          <div style={styles.infoCard}>
            <div style={styles.cardHeader}>
              <User size={20} color="#4f46e5" />
              <h3 style={styles.cardTitle}>Informations Personnelles</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.infoItem}>
                <GraduationCap size={18} color="#6b7280" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Genre</span>
                  <span style={styles.infoValue}>{etudiant.genre || 'Non renseigné'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Calendar size={18} color="#6b7280" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Date de naissance</span>
                  <span style={styles.infoValue}>
                    {etudiant.dateNaissance ? (
                      `${formatDate(etudiant.dateNaissance)} (${calculerAge(etudiant.dateNaissance)})`
                    ) : 'Non renseigné'}
                  </span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Hash size={18} color="#6b7280" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Code Massar</span>
                  <span style={styles.infoValue}>{etudiant.codeMassar || 'Non renseigné'}</span>
                </div>
              </div>
              {etudiant.adresse && (
                <div style={styles.infoItem}>
                  <MapPin size={18} color="#6b7280" />
                  <div style={styles.infoDetails}>
                    <span style={styles.infoLabel}>Adresse</span>
                    <span style={styles.infoValue}>{etudiant.adresse}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div style={styles.infoCard}>
            <div style={styles.cardHeader}>
              <Phone size={20} color="#059669" />
              <h3 style={styles.cardTitle}>Informations de Contact</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.infoItem}>
                <Phone size={18} color="#6b7280" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Téléphone Étudiant</span>
                  <span style={styles.infoValue}>{etudiant.telephoneEtudiant || 'Non renseigné'}</span>
                </div>
              </div>
              {etudiant.telephonePere && (
                <div style={styles.infoItem}>
                  <Users size={18} color="#6b7280" />
                  <div style={styles.infoDetails}>
                    <span style={styles.infoLabel}>Téléphone Père</span>
                    <span style={styles.infoValue}>{etudiant.telephonePere}</span>
                  </div>
                </div>
              )}
              {etudiant.telephoneMere && (
                <div style={styles.infoItem}>
                  <Users size={18} color="#6b7280" />
                  <div style={styles.infoDetails}>
                    <span style={styles.infoLabel}>Téléphone Mère</span>
                    <span style={styles.infoValue}>{etudiant.telephoneMere}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Courses Information */}
          <div style={styles.infoCard}>
            <div style={styles.cardHeader}>
              <BookOpen size={20} color="#dc2626" />
              <h3 style={styles.cardTitle}>Mes Classe</h3>
            </div>
            <div style={styles.cardContent}>
              {etudiant.cours && etudiant.cours.length > 0 ? (
                <div style={styles.coursesList}>
                  {etudiant.cours.map((cours, index) => (
                    <div key={index} style={styles.courseItem}>
                      <div style={styles.courseIcon}>
                        <BookOpen size={16} color="#dc2626" />
                      </div>
                      <span style={styles.courseName}>{cours}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.noCourses}>
                  <BookOpen size={32} color="#d1d5db" />
                  <p style={styles.noCoursesText}>Aucun classe inscrit</p>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div style={styles.infoCard}>
            <div style={styles.cardHeader}>
              <CheckCircle size={20} color="#7c3aed" />
              <h3 style={styles.cardTitle}>Informations du Compte</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.infoItem}>
                <Calendar size={18} color="#6b7280" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Créé le</span>
                  <span style={styles.infoValue}>
                    {etudiant.createdAt ? formatDate(etudiant.createdAt) : 'Non disponible'}
                  </span>
                </div>
              </div>
              {etudiant.lastSeen && (
                <div style={styles.infoItem}>
                  <CheckCircle size={18} color="#6b7280" />
                  <div style={styles.infoDetails}>
                    <span style={styles.infoLabel}>Dernière connexion</span>
                    <span style={styles.infoValue}>{formatDate(etudiant.lastSeen)}</span>
                  </div>
                </div>
              )}
              <div style={styles.infoItem}>
                <User size={18} color="#6b7280" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Statut du compte</span>
                  <span style={{
                    ...styles.infoValue,
                    color: etudiant.actif ? '#059669' : '#dc2626',
                    fontWeight: '600'
                  }}>
                    {etudiant.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations financières */}
          <div style={styles.infoCard}>
            <div style={styles.cardHeader}>
              <DollarSign size={20} color="#059669" />
              <h3 style={styles.cardTitle}>Informations financières</h3>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.infoItem}>
                <DollarSign size={18} color="#059669" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Prix total</span>
                  <span style={styles.infoValue}>{etudiant.prixTotal ?? 0} Dh</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Percent size={18} color="#f59e0b" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Bourse</span>
                  <span style={styles.infoValue}>
                    {etudiant.pourcentageBourse ?? 0}%
                    {etudiant.pourcentageBourse > 0 && (
                      <span> (Réduction: {((etudiant.prixTotal ?? 0) * (etudiant.pourcentageBourse ?? 0) / 100).toFixed(2)} Dh)</span>
                    )}
                  </span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Receipt size={18} color="#3b82f6" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Montant à payer</span>
                  <span style={styles.infoValue}>{getMontantAPayer()} Dh</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <CreditCard size={18} color="#8b5cf6" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Type paiement</span>
                  <span style={styles.infoValue}>{etudiant.typePaiement || 'Cash'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <Calendar size={18} color="#10b981" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Année scolaire</span>
                  <span style={styles.infoValue}>{etudiant.anneeScolaire || 'N/A'}</span>
                </div>
              </div>
              <div style={styles.infoItem}>
                <CheckCircle size={18} color="#059669" />
                <div style={styles.infoDetails}>
                  <span style={styles.infoLabel}>Statut paiement</span>
                  <span style={styles.infoValue}>
                    {etudiant.paye ? 'Payé' : (etudiant.prixTotal === 0 ? 'Gratuit' : 'En attente')}
                  </span>
                </div>
              </div>
            </div>
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  
  headerTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  },
  
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  
  profileHeader: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  
  avatarContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #e5e7eb',
  },
  
  avatarPlaceholder: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid #e5e7eb',
  },
  
  statusBadge: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    padding: '0.25rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  
  profileName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 0.25rem 0',
  },
  
  profileEmail: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: '0 0 0.5rem 0',
  },
  
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  statusText: {
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f3f4f6',
  },
  
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  
  infoDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
  },
  
  infoLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  
  infoValue: {
    fontSize: '0.875rem',
    color: '#1f2937',
    fontWeight: '500',
  },
  
  coursesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  
  courseItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#fef2f2',
    borderRadius: '0.5rem',
    border: '1px solid #fecaca',
  },
  
  courseIcon: {
    padding: '0.375rem',
    backgroundColor: '#ffffff',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  courseName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#991b1b',
  },
  
  noCourses: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '2rem',
    textAlign: 'center',
  },
  
  noCoursesText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '1rem',
  },
  
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f4f6',
    borderTop: '3px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  loadingText: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: 0,
  },
  
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '1rem',
  },
  
  errorText: {
    fontSize: '1rem',
    color: '#ef4444',
    margin: 0,
  },
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .profile-header {
      flex-direction: column;
      text-align: center;
    }
    
    .cards-grid {
      grid-template-columns: 1fr;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ProfileEtudiant;