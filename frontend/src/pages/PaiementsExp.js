import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import {
  Search, AlertTriangle, User, Calendar, BookOpen, DollarSign, Filter, X, RefreshCw, Grid3X3, TableProperties, Eye,
  Mail, Phone, CreditCard, FileText, Clock, Info, CheckCircle, XCircle, MapPin, Settings
} from 'lucide-react';


 
// 🆕 3. FONCTION DEBOUNCE (déplacer AVANT le composant)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const PaiementsExp = () => {
  const [expirés, setExpirés] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'table'
  const [showModal, setShowModal] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);

  // 🆕 1. AJOUTS D'ÉTATS
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [searchHistory, setSearchHistory] = useState([]);
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });

  // ✅ يجب أن يكون هنا
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchExpirés();
  }, []);

  useEffect(() => {
    let results = [...expirés];
    
    // 🔍 RECHERCHE AMÉLIORÉE
    if (debouncedSearchTerm) {
      const term = normalizeString(debouncedSearchTerm);
      results = results.filter(p => {
        const nomComplet = normalizeString(p.etudiant?.nomComplet || '');
        const cours = normalizeString(p.cours || '');
        const note = normalizeString(p.note || '');
        const telephone = normalizeString(p.etudiant?.telephone || '');
        const montant = p.montant?.toString() || '';
        return nomComplet.includes(term) ||
          cours.includes(term) ||
          note.includes(term) ||
          telephone.includes(term) ||
          montant.includes(term);
      });
    }

    // 🎯 FILTRE PAR MONTANT AMÉLIORÉ
    if (filterBy !== 'all') {
      if (filterBy === 'low') {
        results = results.filter(p => p.montant < 1500);
      } else if (filterBy === 'medium') {
        results = results.filter(p => p.montant >= 1500 && p.montant <= 2500);
      } else if (filterBy === 'high') {
        results = results.filter(p => p.montant > 2500);
      }
    }

    // 🆕 FILTRE PAR PLAGE DE MONTANT PERSONNALISÉE
    if (amountRange.min || amountRange.max) {
      results = results.filter(p => {
        const montant = p.montant || 0;
        const min = amountRange.min ? parseFloat(amountRange.min) : 0;
        const max = amountRange.max ? parseFloat(amountRange.max) : Infinity;
        return montant >= min && montant <= max;
      });
    }

    // 🆕 FILTRE PAR URGENCE
    if (urgencyFilter !== 'all') {
      results = results.filter(p => {
        const urgency = getUrgencyLevel(p.moisDebut, p.nombreMois);
        return urgency === urgencyFilter;
      });
    }

    // 🆕 FILTRE PAR COURS
    if (courseFilter !== 'all') {
      results = results.filter(p => p.cours === courseFilter);
    }

    // 🆕 FILTRE PAR PÉRIODE D'EXPIRATION
    if (dateRangeFilter !== 'all') {
      results = results.filter(p => {
        const joursExpirés = calculerJoursExpirés(p.moisDebut, p.nombreMois);
        switch (dateRangeFilter) {
          case 'week':
            return joursExpirés <= 7;
          case 'month':
            return joursExpirés <= 30;
          case 'quarter':
            return joursExpirés <= 90;
          case 'old':
            return joursExpirés > 90;
          default:
            return true;
        }
      });
    }

    // TRI (existant avec améliorations)
    results.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.etudiant?.nomComplet || '').localeCompare(b.etudiant?.nomComplet || '');
        case 'amount':
          return b.montant - a.montant;
        case 'course':
          return a.cours.localeCompare(b.cours);
        case 'expired':
          const aExpired = calculerJoursExpirés(a.moisDebut, a.nombreMois);
          const bExpired = calculerJoursExpirés(b.moisDebut, b.nombreMois);
          return bExpired - aExpired;
        case 'urgency':
          const urgencyOrder = { 'critique': 3, 'urgent': 2, 'recent': 1 };
          const aUrgency = urgencyOrder[getUrgencyLevel(a.moisDebut, a.nombreMois)];
          const bUrgency = urgencyOrder[getUrgencyLevel(b.moisDebut, b.nombreMois)];
          return bUrgency - aUrgency;
        default:
          return new Date(b.moisDebut) - new Date(a.moisDebut);
      }
    });

    setFiltered(results);
  }, [debouncedSearchTerm, expirés, sortBy, filterBy, urgencyFilter, courseFilter, dateRangeFilter, amountRange]);

  const fetchExpirés = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token d\'authentification manquant');
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/paiements/exp', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const data = await res.json();
      setExpirés(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur fetch expirés:', err);
      setError('Erreur lors du chargement des données: ' + err.message);
      setExpirés([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '—';
    return new Date(isoDate).toLocaleDateString('fr-FR');
  };

  const calculerDateFin = (debut, mois) => {
    if (!debut || !mois) return '—';
    const d = new Date(debut);
    d.setMonth(d.getMonth() + Number(mois));
    return d.toLocaleDateString('fr-FR');
  };

  const calculerJoursExpirés = (debut, mois) => {
    if (!debut || !mois) return 0;
    const dateFin = new Date(debut);
    dateFin.setMonth(dateFin.getMonth() + Number(mois));
    const maintenant = new Date();
    const diffTime = maintenant - dateFin;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // 🆕 Fonction pour pré-remplir le paiement
  const payerEtudiant = (etudiantId, cours) => {
    localStorage.setItem('paiementPreRempli', JSON.stringify({
      etudiant: etudiantId,
      cours: cours
    }));
    window.location.href = '/ajouter-paiement';
  };
const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };
  // 🆕 Fonction pour voir les détails
  const voirDetails = (paiement) => {
    setSelectedPaiement(paiement);
    setShowModal(true);
  };

  // 🆕 2. FONCTION DE NORMALISATION
  const normalizeString = (str) => {
    if (typeof str !== 'string') {
      if (str === null || str === undefined) return '';
      return String(str);
    }
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

 
  // 🆕 5. FONCTION POUR OBTENIR LES COURS UNIQUES
  const uniqueCourses = useMemo(() => {
    const courses = [...new Set(expirés.map(p => p.cours).filter(Boolean))];
    return courses.sort();
  }, [expirés]);

  // 🆕 6. FONCTION POUR CALCULER L'URGENCE
  const getUrgencyLevel = (debut, mois) => {
    const joursExpirés = calculerJoursExpirés(debut, mois);
    if (joursExpirés > 30) return 'critique';
    if (joursExpirés >= 15) return 'urgent';
    return 'recent';
  };

  // 🆕 8. FONCTION POUR SAUVEGARDER L'HISTORIQUE DE RECHERCHE
  const saveSearchHistory = useCallback((term) => {
    if (term.length > 2) {
      setSearchHistory(prev => {
        const newHistory = [term, ...prev.filter(item => item !== term)].slice(0, 5);
        sessionStorage.setItem('paiements_search_history', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, []);

  // 🆕 9. FONCTION POUR CHARGER L'HISTORIQUE
  useEffect(() => {
    const saved = sessionStorage.getItem('paiements_search_history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // 🆕 10. FONCTION POUR RÉINITIALISER TOUS LES FILTRES
  const resetAllFilters = () => {
    setSearchTerm('');
    setFilterBy('all');
    setSortBy('date');
    setUrgencyFilter('all');
    setCourseFilter('all');
    setDateRangeFilter('all');
    setAmountRange({ min: '', max: '' });
  };

  // 🆕 11. FONCTION POUR COMPTER LES FILTRES ACTIFS
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filterBy !== 'all') count++;
    if (urgencyFilter !== 'all') count++;
    if (courseFilter !== 'all') count++;
    if (dateRangeFilter !== 'all') count++;
    if (amountRange.min || amountRange.max) count++;
    return count;
  }, [searchTerm, filterBy, urgencyFilter, courseFilter, dateRangeFilter, amountRange]);

  // 🆕 12. RACCOURCI CLAVIER
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector('input[placeholder*="Rechercher"]')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)',
           padding: '24px'
    },
    header: {
      background: 'white',
      padding: '32px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px',
      border: '1px solid #e2e8f0'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
      justifyContent: 'center'
    },
    statsRow: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    statCard: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '10px',
        justifyContent: 'center',

      minWidth: '160px',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '14px',
      opacity: 0.9
    },
    searchContainer: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    searchInputWrapper: {
      position: 'relative',
      flex: '1',
      minWidth: '300px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 48px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      background: '#ffffff'
    },
    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b'
    },
    actionButton: {
      padding: '12px 20px',
      background: 'white',
      color: '#374151',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500',
      fontSize: '14px'
    },
    actionButtonActive: {
      background: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    },
    filtersPanel: {
      display: showFilters ? 'flex' : 'none',
      gap: '20px',
      marginTop: '20px',
      padding: '20px',
      background: '#f1f5f9',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      flexWrap: 'wrap'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minWidth: '160px'
    },
    filterLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151'
    },
    select: {
      padding: '10px 14px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      background: 'white',
      fontSize: '14px',
      cursor: 'pointer',
      color: '#374151'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '20px'
    },
    card: {
      background: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      borderLeft: '4px solid #ef4444',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    cardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
    },
    studentHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    studentInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    avatar: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '18px',
      fontWeight: '600'
    },
    studentName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b'
    },
    expiredBadge: {
      background: '#fef2f2',
      color: '#dc2626',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      border: '1px solid #fecaca'
    },
    courseInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px',
      background: '#f8fafc',
      borderRadius: '8px',
      marginBottom: '16px'
    },
    courseName: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#374151'
    },
    detailsGrid: {
      display: 'grid',
      gap: '12px'
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9'
    },
    detailIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    detailText: {
      fontSize: '14px',
      color: '#374151'
    },
    detailValue: {
      fontWeight: '600'
    },
    loading: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '300px',
      gap: '16px'
    },
    loadingSpinner: {
      animation: 'spin 1s linear infinite'
    },
    error: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '10px',
      padding: '20px',
      color: '#dc2626',
      textAlign: 'center'
    },
    noResults: {
      textAlign: 'center',
      padding: '60px 20px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    },
    table: {
      width: '100%',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    },
    tableHeader: {
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0'
    },
    tableRow: {
      borderBottom: '1px solid #f1f5f9',
      transition: 'background-color 0.2s ease'
    },
    tableCell: {
      padding: '16px',
      fontSize: '14px',
      color: '#374151',
      verticalAlign: 'middle'
    },
    tableCellHeader: {
      padding: '16px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
      background: '#f8fafc'
    },
    studentCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    smallAvatar: {
      width: '32px',
      height: '32px',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      background: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca'
    },
    viewToggle: {
      display: 'flex',
      background: '#f1f5f9',
      borderRadius: '8px',
      padding: '4px',
      gap: '4px'
    },
    viewButton: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#64748b',
      transition: 'all 0.2s ease'
    },
    viewButtonActive: {
      background: 'white',
      color: '#374151',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <RefreshCw size={32} color="#6366f1" style={styles.loadingSpinner} />
          <p style={{ fontSize: '18px', color: '#64748b' }}>
            Chargement des paiements expirés...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <AlertTriangle size={24} style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '16px', fontWeight: '500' }}>{error}</p>
          <button
            onClick={fetchExpirés}
            style={{
              ...styles.actionButton,
              marginTop: '16px',
              background: '#dc2626',
              color: 'white',
              borderColor: '#dc2626'
            }}
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const totalMontant = filtered.reduce((sum, p) => sum + (p.montant || 0), 0);

  // 🆕 13. NOUVEAU JSX POUR LA ZONE DE RECHERCHE AMÉLIORÉE
  const searchContainerNew = (
    <div style={styles.searchContainer}>
      <div style={styles.searchInputWrapper}>
        <Search size={20} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Rechercher par nom, cours, note, téléphone, montant... (Ctrl+F)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value === '') {
              saveSearchHistory(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveSearchHistory(searchTerm);
            }
          }}
          style={styles.searchInput}
          list="search-history"
        />
        <datalist id="search-history">
          {searchHistory.map((item, index) => (
            <option key={index} value={item} />
          ))}
        </datalist>
      </div>
      <button
        style={{
          ...styles.actionButton,
          ...(showFilters ? styles.actionButtonActive : {})
        }}
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter size={16} />
        Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </button>
      <button
        style={styles.actionButton}
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
      >
        <Settings size={16} />
        Avancé
      </button>
      {activeFiltersCount > 0 && (
        <button
          onClick={resetAllFilters}
          style={{
            ...styles.actionButton,
            background: '#ef4444',
            color: 'white',
            borderColor: '#ef4444'
          }}
        >
          <X size={16} />
          Effacer tout
        </button>
      )}
      <button onClick={fetchExpirés} style={styles.actionButton}>
        <RefreshCw size={16} />
        Actualiser
      </button>
      <div style={styles.viewToggle}>
        <button
          style={{
            ...styles.viewButton,
            ...(viewMode === 'cards' ? styles.viewButtonActive : {})
          }}
          onClick={() => setViewMode('cards')}
        >
          <Grid3X3 size={16} />
          Cartes
        </button>
        <button
          style={{
            ...styles.viewButton,
            ...(viewMode === 'table' ? styles.viewButtonActive : {})
          }}
          onClick={() => setViewMode('table')}
        >
          <TableProperties size={16} />
          Tableau
        </button>
      </div>
    </div>
  );

  // 🆕 14. NOUVEAU PANNEAU DE FILTRES AVANCÉS
  const advancedFiltersPanel = showAdvancedFilters && (
    <div style={styles.filtersPanel}>
      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Niveau d'urgence :</label>
        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">Tous les niveaux</option>
          <option value="critique">Critique (&gt;30 jours)</option>
          <option value="urgent">Urgent (15-30 jours)</option>
          <option value="recent">Récent (&lt;15 jours)</option>
        </select>
      </div>
      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Cours :</label>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">Tous les cours</option>
          {uniqueCourses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>
      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Période d'expiration :</label>
        <select
          value={dateRangeFilter}
          onChange={(e) => setDateRangeFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">Toutes les périodes</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="quarter">Ces 3 mois</option>
          <option value="old">Plus de 3 mois</option>
        </select>
      </div>
      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>Plage de montant :</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Min"
            value={amountRange.min}
            onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
            style={{ ...styles.select, width: '80px' }}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={amountRange.max}
            onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
            style={{ ...styles.select, width: '80px' }}
          />
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Dh</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
        <Sidebar onLogout={handleLogout} />
      <div style={styles.header}>
        <h1 style={styles.title}>
          <AlertTriangle size={32} color="#ef4444" />
          Gestion des Paiements Expirés
        </h1>
        
        <div>
          {/* Remplacer la searchContainer par la nouvelle */}
          {searchContainerNew}
        </div>

        <div style={styles.filtersPanel}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Trier par :</label>
            {/* 🆕 15. AMÉLIORER LE SELECT DE TRI */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
            >
              <option value="date">Date de début</option>
              <option value="name">Nom étudiant</option>
              <option value="course">Cours</option>
              <option value="amount">Montant</option>
              <option value="expired">Plus expiré</option>
              <option value="urgency">Niveau d'urgence</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filtrer par montant :</label>
            {/* 🆕 16. NOUVEAU SELECT POUR FILTRAGE PAR MONTANT */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              style={styles.select}
            >
              <option value="all">Tous les montants</option>
              <option value="low">Moins de 1500 Dh</option>
              <option value="medium">1500 - 2500 Dh</option>
              <option value="high">Plus de 2500 Dh</option>
            </select>
          </div>
        </div>

        {/* 🆕 14. NOUVEAU PANNEAU DE FILTRES AVANCÉS */}
        {advancedFiltersPanel}
      </div>

      {filtered.length === 0 ? (
        <div style={styles.noResults}>
          <AlertTriangle size={64} color="#9ca3af" style={{marginBottom: '16px', opacity: 0.5}} />
          <h3 style={{ color: '#374151', marginBottom: '8px' }}>
            Aucun paiement expiré trouvé
          </h3>
          <p style={{ color: '#6b7280' }}>
            {searchTerm || filterBy !== 'all' 
              ? 'Essayez de modifier vos critères de recherche.' 
              : 'Excellente nouvelle ! Aucun paiement n\'est actuellement expiré.'
            }
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div style={styles.grid}>
          {filtered.map(p => {
            const joursExpirés = calculerJoursExpirés(p.moisDebut, p.nombreMois);
            const initiales = p.etudiant?.nomComplet 
              ? p.etudiant.nomComplet.split(' ').map(n => n[0]).join('').toUpperCase()
              : '?';
            
            return (
              <div
                key={p._id}
                style={styles.card}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, styles.cardHover);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={styles.studentHeader}>
                  <div style={styles.studentInfo}>
                    {p.etudiant?.image ? (
                      <img
                        src={`http://localhost:5000${p.etudiant.image}`}
                        alt="Avatar"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          border: '2px solid #e5e7eb'
                        }}
                      />
                    ) : (
                      <div style={styles.avatar}>
                        {initiales}
                      </div>
                    )}
                    <div style={styles.studentName}>
                      {p.etudiant?.nomComplet || 'Nom indisponible'}
                    </div>
                  </div>
                  {/* Remplacer le badge d'urgence dans les cartes */}
                  {(() => {
                    const urgencyLevel = getUrgencyLevel(p.moisDebut, p.nombreMois);
                    const urgencyColors = {
                      critique: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
                      urgent: { bg: '#fef3c7', color: '#d97706', border: '#fed7aa' },
                      recent: { bg: '#ecfdf5', color: '#059669', border: '#bbf7d0' }
                    };
                    const urgencyLabels = {
                      critique: 'Critique',
                      urgent: 'Urgent',
                      recent: 'Récent'
                    };
                    return (
                      <div style={{
                        background: urgencyColors[urgencyLevel].bg,
                        color: urgencyColors[urgencyLevel].color,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: `1px solid ${urgencyColors[urgencyLevel].border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {urgencyLabels[urgencyLevel]} • {joursExpirés} jour{joursExpirés > 1 ? 's' : ''}
                      </div>
                    );
                  })()}
                </div>
                
                <div style={styles.courseInfo}>
                  <BookOpen size={20} color="#6366f1" />
                  <span style={styles.courseName}>{p.cours || 'Cours non spécifié'}</span>
                </div>
                
                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <div style={{...styles.detailIcon, background: '#ecfdf5'}}>
                      <DollarSign size={16} color="#059669" />
                    </div>
                    <div style={styles.detailText}>
                      <span>Montant : </span>
                      <span style={{...styles.detailValue, color: '#059669'}}>
                        {(p.montant || 0).toLocaleString()} Dh
                      </span>
                    </div>
                  </div>
                  <div style={styles.detailItem}>
                    <div style={{...styles.detailIcon, background: '#eff6ff'}}>
                      <Calendar size={16} color="#3b82f6" />
                    </div>
                    <div style={styles.detailText}>
                      <span>Période : </span>
                      <span style={styles.detailValue}>
                        {formatDate(p.moisDebut)} • {p.nombreMois || 0} mois
                      </span>
                    </div>
                  </div>
                  <div style={{...styles.detailItem, borderBottom: 'none'}}>
                    <div style={{...styles.detailIcon, background: '#fef2f2'}}>
                      <AlertTriangle size={16} color="#dc2626" />
                    </div>
                    <div style={styles.detailText}>
                      <span>Expiré le : </span>
                      <span style={{...styles.detailValue, color: '#dc2626'}}>
                        {calculerDateFin(p.moisDebut, p.nombreMois)}
                      </span>
                    </div>
                  </div>
                  {/* Note affichage */}
                  {p.note && (
                    <div style={{...styles.detailItem, borderBottom: 'none'}}>
                      <div style={{...styles.detailIcon, background: '#fef3c7'}}>
                        📝
                      </div>
                      <div style={styles.detailText}>
                        <span>Note : </span>
                        <span style={{...styles.detailValue, color: '#92400e'}}>
                          {p.note}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* 🧩 Bouton Payer maintenant */}
                  <button
                    onClick={() => payerEtudiant(p.etudiant?._id, p.cours)}
                    style={{
                      marginTop: '16px',
                      width: '100%',
                      background: '#059669',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  >
                     Payer maintenant
                  </button>

                  {/* 🆕 Bouton Voir détails */}
                  <button
                    onClick={() => voirDetails(p)}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      background: '#3b82f6',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                  >
                    <Eye size={16} />
                    Voir détails
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.table}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableCellHeader}>Étudiant</th>
                <th style={styles.tableCellHeader}>Cours</th>
                <th style={styles.tableCellHeader}>Montant</th>
                <th style={styles.tableCellHeader}>Période</th>
                <th style={styles.tableCellHeader}>Date d'expiration</th>
                <th style={styles.tableCellHeader}>Jours expirés</th>
                <th style={styles.tableCellHeader}>Note</th>
                <th style={styles.tableCellHeader}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const joursExpirés = calculerJoursExpirés(p.moisDebut, p.nombreMois);
                const initiales = p.etudiant?.nomComplet 
                  ? p.etudiant.nomComplet.split(' ').map(n => n[0]).join('').toUpperCase()
                  : '?';
                
                return (
                  <tr 
                    key={p._id} 
                    style={styles.tableRow}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={styles.tableCell}>
                      <div style={styles.studentCell}>
                        {p.etudiant?.image ? (
                          <img
                            src={`http://localhost:5000${p.etudiant.image}`}
                            alt="Avatar"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={styles.smallAvatar}>{initiales}</div>
                        )}
                        <span style={{fontWeight: '500'}}>
                          {p.etudiant?.nomComplet || 'Nom indisponible'}
                        </span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{fontWeight: '500', color: '#6366f1'}}>
                        {p.cours || 'Cours non spécifié'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{fontWeight: '600', color: '#059669'}}>
                        {(p.montant || 0).toLocaleString()} Dh
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div>
                        <div>{formatDate(p.moisDebut)}</div>
                        <div style={{fontSize: '12px', color: '#6b7280'}}>
                          {p.nombreMois || 0} mois
                        </div>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{color: '#dc2626', fontWeight: '500'}}>
                        {calculerDateFin(p.moisDebut, p.nombreMois)}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.statusBadge}>
                        {joursExpirés} jour{joursExpirés > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      {p.note ? (
                        <span style={{ fontStyle: 'italic', color: '#92400e' }}>
                          {p.note}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => payerEtudiant(p.etudiant?._id, p.cours)}
                          style={{
                            padding: '8px 14px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '500',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                        >
                          Payer
                        </button>
                        {/* 🆕 Bouton Voir détails */}
                        <button
                          onClick={() => voirDetails(p)}
                          style={{
                            padding: '8px 14px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '500',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                          <Eye size={14} />
                          Détails
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* 🆕 Modal Détails */}
      {showModal && selectedPaiement && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
            
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Eye size={28} color="#3b82f6" />
              Détails du Paiement Expiré
            </h2>
            
            {/* 🆕 Section avec image et infos étudiant */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '24px',
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              {selectedPaiement.etudiant?.image ? (
                <img
                  src={`http://localhost:5000${selectedPaiement.etudiant.image}`}
                  alt="Photo étudiant"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '3px solid #e5e7eb'
                  }}
                />
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: '700'
                }}>
                  {selectedPaiement.etudiant?.nomComplet 
                    ? selectedPaiement.etudiant.nomComplet.split(' ').map(n => n[0]).join('').toUpperCase()
                    : '?'
                  }
                </div>
              )}
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '4px'
                }}>
                  {selectedPaiement.etudiant?.nomComplet || 'Nom indisponible'}
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <User size={16} />
                  Étudiant
                </p>
              </div>
            </div>
            
            {/* Détails du paiement */}
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#ecfdf5',
                borderRadius: '8px'
              }}>
                <BookOpen size={20} color="#059669" />
                <div>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Cours : </span>
                  <span style={{ fontWeight: '600', color: '#059669' }}>
                    {selectedPaiement.cours}
                  </span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#f0f9ff',
                borderRadius: '8px'
              }}>
                <DollarSign size={20} color="#0ea5e9" />
                <div>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Montant : </span>
                  <span style={{ fontWeight: '600', color: '#0ea5e9' }}>
                    {selectedPaiement.montant?.toLocaleString()} Dh
                  </span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#fef3c7',
                borderRadius: '8px'
              }}>
                <Calendar size={20} color="#d97706" />
                <div>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Période : </span>
                  <span style={{ fontWeight: '600', color: '#d97706' }}>
                    {formatDate(selectedPaiement.moisDebut)} • {selectedPaiement.nombreMois} mois
                  </span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#fef2f2',
                borderRadius: '8px'
              }}>
                <AlertTriangle size={20} color="#dc2626" />
                <div>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Expiré le : </span>
                  <span style={{ fontWeight: '600', color: '#dc2626' }}>
                    {calculerDateFin(selectedPaiement.moisDebut, selectedPaiement.nombreMois)}
                  </span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#fef2f2',
                borderRadius: '8px'
              }}>
                <Clock size={20} color="#dc2626" />
                <div>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Jours expirés : </span>
                  <span style={{ fontWeight: '600', color: '#dc2626' }}>
                    {calculerJoursExpirés(selectedPaiement.moisDebut, selectedPaiement.nombreMois)} jours
                  </span>
                </div>
              </div>
              
              {selectedPaiement.note && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#fffbeb',
                  borderRadius: '8px'
                }}>
                  <FileText size={20} color="#d97706" />
                  <div>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Note : </span>
                    <span style={{ fontWeight: '600', color: '#d97706' }}>
                      {selectedPaiement.note}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Boutons d'action dans la modal */}
            <div style={{
              marginTop: '24px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  payerEtudiant(selectedPaiement.etudiant?._id, selectedPaiement.cours);
                  setShowModal(false);
                }}
                style={{
                  padding: '12px 20px',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <DollarSign size={16} />
                Payer maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .search-container {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 12px !important;
            }
            .search-input-wrapper {
              min-width: auto !important;
            }
            .filters-panel {
              flex-direction: column !important;
              gap: 16px !important;
            }
            .grid {
              grid-template-columns: 1fr !important;
            }
            .stats-row {
              flex-direction: column !important;
              gap: 12px !important;
            }
          }
          
          .search-input:focus {
            outline: none;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          }
          
          .action-button:hover {
            background: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
          }
          
          .action-button-active:hover {
            background: #2563eb !important;
          }
        `}
      </style>
    </div>
  );
};

export default PaiementsExp;