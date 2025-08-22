import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebarmanager'; // ✅ استيراد صحيح

// CSS pour l'animation du spinner
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    input:focus, textarea:focus, select:focus {
      border-color: #007bff !important;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.1) !important;
    }
    
    .admin-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }
    
    .admin-table tbody tr:hover {
      background-color: #f8f9fa !important;
    }
    
    .admin-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
    
    .admin-button:active {
      transform: translateY(0);
    }
  `;
  document.head.appendChild(styleSheet);
}

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};
const AdminActualitesmanager = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'evenements',
    author: '',
    tags: '',
    type: 'article',
    isPinned: false
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [actualites, setActualites] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // États pour les filtres avec debounce
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin' && role !== 'paiement_manager') navigate('/');
    fetchActualites();
  }, [navigate]);

  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

  const fetchActualites = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/actualites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setActualites(Array.isArray(data) ? data : data.actualites || []);
    } catch (err) {
      console.error('Erreur chargement actualités:', err);
      setMessage('Erreur lors du chargement des actualités');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire optimisé pour les changements de formulaire
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (image) formData.append('image', image);

    const url = editingId ? `http://localhost:5000/api/actualites/${editingId}` : 'http://localhost:5000/api/actualites';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(editingId ? 'Actualité modifiée avec succès' : 'Actualité ajoutée avec succès');
        resetForm();
        setShowModal(false);
        fetchActualites();
      } else {
        setMessage(`Erreur: ${data.message}`);
      }
    } catch (err) {
      setMessage(`Erreur réseau: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      excerpt: '',
      content: '',
      category: 'evenements',
      author: '',
      tags: '',
      type: 'article',
      isPinned: false
    });
    setImage(null);
    setEditingId(null);
  };

  const handleAdd = () => {
    resetForm();
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (actu) => {
    setForm({
      title: actu.title || '',
      excerpt: actu.excerpt || '',
      content: actu.content || '',
      category: actu.category || 'evenements',
      author: actu.author || '',
      tags: actu.tags || '',
      type: actu.type || 'article',
      isPinned: actu.isPinned || false
    });
    setEditingId(actu._id);
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (actu) => {
    setSelectedItem(actu);
    setModalType('view');
    setShowModal(true);
  };

  const handleDeleteConfirm = (actu) => {
    setSelectedItem(actu);
    setModalType('delete');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/actualites/${selectedItem._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessage('Actualité supprimée avec succès');
        setShowModal(false);
        fetchActualites();
      } else {
        const data = await res.json();
        setMessage(`Erreur: ${data.message}`);
      }
    } catch (err) {
      setMessage(`Erreur réseau: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Fonction de filtrage optimisée avec useMemo
  const filteredActualites = useMemo(() => {
    return actualites.filter(actu => {
      const safeStringCheck = (value, searchTerm) => {
        if (!value || typeof value !== 'string') return false;
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      };

      const matchesSearch = debouncedSearchTerm === '' || 
        safeStringCheck(actu.title, debouncedSearchTerm) ||
        safeStringCheck(actu.content, debouncedSearchTerm) ||
        safeStringCheck(actu.excerpt, debouncedSearchTerm) ||
        safeStringCheck(actu.author, debouncedSearchTerm) ||
        safeStringCheck(actu.tags, debouncedSearchTerm);

      const matchesCategory = filterCategory === '' || actu.category === filterCategory;
      const matchesType = filterType === '' || actu.type === filterType;
      const matchesAuthor = filterAuthor === '' || actu.author === filterAuthor;
      const matchesPinned = !showPinnedOnly || actu.isPinned;

      return matchesSearch && matchesCategory && matchesType && matchesAuthor && matchesPinned;
    });
  }, [actualites, debouncedSearchTerm, filterCategory, filterType, filterAuthor, showPinnedOnly]);

  // Obtenir les auteurs uniques pour le filtre
  const uniqueAuthors = useMemo(() => {
    return [...new Set(actualites.map(actu => actu.author))].filter(Boolean);
  }, [actualites]);

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilterCategory('');
    setFilterType('');
    setFilterAuthor('');
    setShowPinnedOnly(false);
  };

  // Composant Modal optimisé
  const Modal = React.memo(() => {
    if (!showModal) return null;

    return (
      <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>
              {modalType === 'add' && 'Ajouter une actualité'}
              {modalType === 'edit' && 'Modifier l\'actualité'}
              {modalType === 'view' && 'Détails de l\'actualité'}
              {modalType === 'delete' && 'Confirmer la suppression'}
            </h3>
            <button 
              style={styles.closeButton}
              onClick={() => setShowModal(false)}
            >
              Fermer
            </button>
          </div>
          
          <div style={styles.modalContent}>
            {(modalType === 'add' || modalType === 'edit') && (
              <div style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Titre *</label>
                  <input 
                    style={styles.input}
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    placeholder="Entrez le titre de l'actualité"
                    required 
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Extrait *</label>
                  <input 
                    style={styles.input}
                    name="excerpt" 
                    value={form.excerpt} 
                    onChange={handleChange} 
                    placeholder="Résumé court de l'actualité"
                    required 
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contenu *</label>
                  <textarea 
                    style={{...styles.input, minHeight: '120px', resize: 'vertical'}}
                    name="content" 
                    value={form.content} 
                    onChange={handleChange} 
                    placeholder="Contenu détaillé de l'actualité"
                    required 
                  />
                </div>
                
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Catégorie</label>
                    <select 
                      style={styles.input}
                      name="category" 
                      value={form.category} 
                      onChange={handleChange}
                    >
                      <option value="evenements">Événements</option>
                      <option value="resultats">Résultats</option>
                      <option value="pedagogie">Pédagogie</option>
                      <option value="communaute">Communauté</option>
                      <option value="partenariats">Partenariats</option>
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Type</label>
                    <select 
                      style={styles.input}
                      name="type" 
                      value={form.type} 
                      onChange={handleChange}
                    >
                      <option value="article">Article</option>
                      <option value="event">Événement</option>
                      <option value="announcement">Annonce</option>
                      <option value="achievement">Succès</option>
                      <option value="project">Projet</option>
                    </select>
                  </div>
                </div>
                
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Auteur *</label>
                    <input 
                      style={styles.input}
                      name="author" 
                      value={form.author} 
                      onChange={handleChange} 
                      placeholder="Nom de l'auteur"
                      required 
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Tags</label>
                    <input 
                      style={styles.input}
                      name="tags" 
                      value={form.tags} 
                      onChange={handleChange} 
                      placeholder="sport, education, innovation (séparés par virgule)"
                    />
                  </div>
                </div>
                
                <div style={styles.checkboxGroup}>
                  <input 
                    type="checkbox" 
                    name="isPinned" 
                    checked={form.isPinned} 
                    onChange={handleChange} 
                    id="isPinned"
                  />
                  <label htmlFor="isPinned" style={styles.checkboxLabel}>
                    Épingler cette actualité (sera affichée en priorité)
                  </label>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Image</label>
                  <input 
                    type="file" 
                    onChange={e => setImage(e.target.files[0])} 
                    accept="image/*" 
                    style={styles.fileInput}
                  />
                  <small style={styles.fileHint}>
                    Formats acceptés: JPG, PNG, GIF (max 5MB)
                  </small>
                </div>
                
                <div style={styles.modalActions}>
                  <button type="button" style={styles.cancelButton} onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    style={{
                      ...styles.submitButton,
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'En cours...' : (modalType === 'edit' ? 'Modifier' : 'Ajouter')}
                  </button>
                </div>
              </div>
            )}
            
            {modalType === 'view' && selectedItem && (
              <div style={styles.viewContent}>
                <div style={styles.viewSection}>
                  <strong>Titre:</strong> {selectedItem.title}
                </div>
                <div style={styles.viewSection}>
                  <strong>Auteur:</strong> {selectedItem.author}
                </div>
                <div style={styles.viewSection}>
                  <strong>Catégorie:</strong> {selectedItem.category}
                </div>
                <div style={styles.viewSection}>
                  <strong>Type:</strong> {selectedItem.type}
                </div>
                <div style={styles.viewSection}>
                  <strong>Date de création:</strong> {formatDate(selectedItem.createdAt)}
                </div>
                <div style={styles.viewSection}>
                  <strong>Épinglé:</strong> {selectedItem.isPinned ? 'Oui' : 'Non'}
                </div>
                <div style={styles.viewSection}>
                  <strong>Tags:</strong> {selectedItem.tags || 'Aucun'}
                </div>
                {selectedItem.image && (
                  <div style={styles.viewSection}>
                    <strong>Image:</strong>
                    <img 
                      src={`http://localhost:5000${selectedItem.image}`} 
                      alt="Aperçu" 
                      style={styles.viewImage}
                    />
                  </div>
                )}
                <div style={styles.viewSection}>
                  <strong>Extrait:</strong>
                  <p style={styles.excerpt}>{selectedItem.excerpt}</p>
                </div>
                <div style={styles.viewSection}>
                  <strong>Contenu:</strong>
                  <p style={styles.content}>{selectedItem.content}</p>
                </div>
              </div>
            )}
            
            {modalType === 'delete' && selectedItem && (
              <div style={styles.deleteContent}>
                <p>Êtes-vous sûr de vouloir supprimer cette actualité ?</p>
                <p style={styles.deleteTitle}>"{selectedItem.title}"</p>
                <p style={styles.deleteWarning}>Cette action est irréversible.</p>
                <div style={styles.modalActions}>
                  <button style={styles.cancelButton} onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button 
                    style={{
                      ...styles.deleteButton,
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    onClick={confirmDelete}
                    disabled={loading}
                  >
                    {loading ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

  const TableView = () => (
    <div style={styles.tableContainer}>
      <table style={styles.table} className="admin-table">
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>Image</th>
            <th style={styles.th}>Titre</th>
            <th style={styles.th}>Auteur</th>
            <th style={styles.th}>Catégorie</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredActualites.map(actu => (
            <tr key={actu._id} style={styles.tableRow}>
              <td style={styles.td}>
                {actu.image ? (
                  <img 
                    src={`http://localhost:5000${actu.image}`} 
                    alt="Aperçu" 
                    style={styles.thumbnailImage}
                  />
                ) : (
                  'Aucune'
                )}
              </td>
              <td style={styles.td}>
                {actu.isPinned && <span style={styles.pinnedText}>📌 </span>}
                {actu.title}
              </td>
              <td style={styles.td}>{actu.author}</td>
              <td style={styles.td}>{actu.category}</td>
              <td style={styles.td}>{actu.type}</td>
              <td style={styles.td}>{formatDate(actu.createdAt)}</td>
              <td style={styles.td}>
                <div style={styles.actionButtons}>
                  <button 
                    style={styles.viewButton}
                    className="admin-button"
                    onClick={() => handleView(actu)}
                  >
                    Voir
                  </button>
                  <button 
                    style={styles.editButton}
                    className="admin-button"
                    onClick={() => handleEdit(actu)}
                  >
                    Modifier
                  </button>
                  <button 
                    style={styles.deleteActionButton}
                    className="admin-button"
                    onClick={() => handleDeleteConfirm(actu)}
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const CardsView = () => (
    <div style={styles.cardsContainer}>
      {filteredActualites.map(actu => (
        <div key={actu._id} style={styles.card} className="admin-card">
          {actu.isPinned && <div style={styles.pinnedBadge}>📌 ÉPINGLÉ</div>}
          
          {actu.image && (
            <img 
              src={`http://localhost:5000${actu.image}`} 
              alt="Image actualité" 
              style={styles.cardImage}
            />
          )}
          
          <div style={styles.cardHeader}>
            <h4 style={styles.cardTitle}>{actu.title}</h4>
            <span style={styles.cardDate}>{formatDate(actu.createdAt)}</span>
          </div>
          
          <div style={styles.cardMeta}>
            <span style={styles.cardCategory}>{actu.category}</span>
            <span style={styles.cardType}>{actu.type}</span>
          </div>
          
          <p style={styles.cardAuthor}>Par: {actu.author}</p>
          <p style={styles.cardExcerpt}>{actu.excerpt}</p>
          
          {actu.tags && (
            <div style={styles.cardTags}>Tags: {actu.tags}</div>
          )}
          
          <div style={styles.cardActions}>
            <button 
              style={styles.viewButton}
              className="admin-button"
              onClick={() => handleView(actu)}
            >
              Voir détails
            </button>
            <button 
              style={styles.editButton}
              className="admin-button"
              onClick={() => handleEdit(actu)}
            >
              Modifier
            </button>
            <button 
              style={styles.deleteActionButton}
              className="admin-button"
              onClick={() => handleDeleteConfirm(actu)}
            >
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={styles.container}>
    <Sidebar onLogout={handleLogout} />
      <div style={styles.header}>
        <h2 style={styles.title}>Gestion des Actualités</h2>
        <button style={styles.addButton} className="admin-button" onClick={handleAdd}>
           Ajouter une actualité
        </button>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.includes('Erreur') ? '#f8d7da' : '#d4edda',
          color: message.includes('Erreur') ? '#721c24' : '#155724',
          borderColor: message.includes('Erreur') ? '#f5c6cb' : '#c3e6cb'
        }}>
          {message}
        </div>
      )}

      <div style={styles.controls}>
        <div style={styles.viewToggle}>
          <button 
            style={{
              ...styles.toggleButton,
              ...(viewMode === 'table' ? styles.toggleButtonActive : {})
            }}
            className="admin-button"
            onClick={() => setViewMode('table')}
          >
             Vue Tableau
          </button>
          <button 
            style={{
              ...styles.toggleButton,
              ...(viewMode === 'cards' ? styles.toggleButtonActive : {})
            }}
            className="admin-button"
            onClick={() => setViewMode('cards')}
          >
             Vue Cartes
          </button>
        </div>
        
        <div style={styles.statsInfo}>
          {filteredActualites.length} sur {actualites.length} actualité{actualites.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Section de recherche et filtres */}
      <div style={styles.searchAndFilters}>
        <div style={styles.searchSection}>
          <input
            type="text"
            placeholder="Rechercher dans les actualités..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <small style={styles.searchHint}>
              Recherche en cours... ({debouncedSearchTerm === searchTerm ? 'terminée' : 'en cours'})
            </small>
          )}
        </div>

        <div style={styles.filtersSection}>
          <h4 style={styles.filtersTitle}> Filtres</h4>
          
          <div style={styles.filtersRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Catégorie</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">Toutes les catégories</option>
                <option value="evenements">Événements</option>
                <option value="resultats">Résultats</option>
                <option value="pedagogie">Pédagogie</option>
                <option value="communaute">Communauté</option>
                <option value="partenariats">Partenariats</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">Tous les types</option>
                <option value="article">Article</option>
                <option value="event">Événement</option>
                <option value="announcement">Annonce</option>
                <option value="achievement">Succès</option>
                <option value="project">Projet</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Auteur</label>
              <select
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">Tous les auteurs</option>
                {uniqueAuthors.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Statut</label>
              <div style={styles.checkboxFilter}>
                <input
                  type="checkbox"
                  id="pinnedOnly"
                  checked={showPinnedOnly}
                  onChange={(e) => setShowPinnedOnly(e.target.checked)}
                />
                <label htmlFor="pinnedOnly" style={styles.checkboxFilterLabel}>
                  📌 Épinglées seulement
                </label>
              </div>
            </div>
          </div>

          <div style={styles.filtersActions}>
            <button 
              onClick={clearFilters}
              style={styles.clearFiltersButton}
              className="admin-button"
            >
              Effacer les filtres
            </button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}>⏳</div>
            <p>Chargement des actualités...</p>
          </div>
        ) : filteredActualites.length === 0 ? (
          <div style={styles.emptyState}>
            {searchTerm || filterCategory || filterType || filterAuthor || showPinnedOnly ? (
              <>
                <div style={styles.emptyIcon}>🔍</div>
                <p>Aucune actualité ne correspond aux critères de recherche</p>
                <button style={styles.clearFiltersButton} className="admin-button" onClick={clearFilters}>
                  Effacer les filtres
                </button>
              </>
            ) : (
              <>
                <div style={styles.emptyIcon}>📰</div>
                <p>Aucune actualité trouvée</p>
                <button style={styles.addButton} className="admin-button" onClick={handleAdd}>
                  Créer la première actualité
                </button>
              </>
            )}
          </div>
        ) : (
          viewMode === 'table' ? <TableView /> : <CardsView />
        )}
      </div>

      <Modal />
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  title: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '28px',
    fontWeight: '700'
  },
  addButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid'
  },
  controls: {
    marginBottom: '25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    backgroundColor: 'white',
    padding: '15px 20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  viewToggle: {
    display: 'flex',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  toggleButton: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  toggleButtonActive: {
    backgroundColor: '#007bff',
    color: 'white'
  },
  statsInfo: {
    color: '#6c757d',
    fontSize: '14px',
    fontWeight: '500'
  },
  content: {
    minHeight: '400px'
  },
  loadingState: {
    textAlign: 'center',
    padding: '60px',
    color: '#6c757d',
    backgroundColor: 'white',
    borderRadius: '12px',
    fontSize: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  spinner: {
    fontSize: '32px',
    marginBottom: '15px',
    animation: 'spin 1s linear infinite'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#6c757d',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '20px'
  },
  searchAndFilters: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  searchSection: {
    marginBottom: '25px'
  },
  searchInput: {
    width: '100%',
    padding: '15px 20px',
    border: '2px solid #e9ecef',
    borderRadius: '10px',
    fontSize: '16px',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.2s',
    outline: 'none'
  },
  searchHint: {
    display: 'block',
    marginTop: '8px',
    color: '#6c757d',
    fontSize: '12px',
    fontStyle: 'italic'
  },
  filtersSection: {
    borderTop: '2px solid #e9ecef',
    paddingTop: '25px'
  },
  filtersTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c3e50'
  },
  filtersRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#495057'
  },
  filterSelect: {
    padding: '10px 15px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.2s'
  },
  checkboxFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '6px'
  },
  checkboxFilterLabel: {
    fontSize: '14px',
    color: '#495057',
    cursor: 'pointer'
  },
  filtersActions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  clearFiltersButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#f8f9fa'
  },
  th: {
    padding: '18px 15px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    fontWeight: '600',
    color: '#495057',
    fontSize: '14px'
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '15px',
    verticalAlign: 'top',
    fontSize: '14px'
  },
  thumbnailImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '2px solid #e9ecef'
  },
  pinnedText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: '14px'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  viewButton: {
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  editButton: {
    backgroundColor: '#ffc107',
    color: '#212529',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  deleteActionButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '25px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    position: 'relative',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #e9ecef'
  },
  pinnedBadge: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '2px solid #e9ecef'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    gap: '15px'
  },
  cardTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#2c3e50',
    fontWeight: '600',
    lineHeight: '1.3',
    flex: 1
  },
  cardDate: {
    color: '#6c757d',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  cardMeta: {
    display: 'flex',
    gap: '12px',
    marginBottom: '15px',
    flexWrap: 'wrap'
  },
  cardCategory: {
    backgroundColor: '#e9ecef',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#495057',
    fontWeight: '500'
  },
  cardType: {
    backgroundColor: '#d1ecf1',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#0c5460',
    fontWeight: '500'
  },
  cardAuthor: {
    color: '#6c757d',
    fontSize: '14px',
    margin: '10px 0',
    fontWeight: '500'
  },
  cardExcerpt: {
    color: '#495057',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '15px 0',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  cardTags: {
    color: '#6c757d',
    fontSize: '13px',
    fontStyle: 'italic',
    marginBottom: '20px',
    padding: '8px 12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px'
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '25px 30px',
    borderBottom: '2px solid #e9ecef',
    backgroundColor: '#f8f9fa'
  },
  modalTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#2c3e50',
    fontWeight: '600'
  },
  closeButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  modalContent: {
    padding: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formRow: {
    display: 'flex',
    gap: '25px'
  },
  label: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '15px'
  },
  input: {
    padding: '15px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '15px',
    resize: 'vertical',
    transition: 'all 0.2s',
    outline: 'none'
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '2px solid #e9ecef'
  },
  checkboxLabel: {
    color: '#495057',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  fileInput: {
    padding: '12px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#f8f9fa'
  },
  fileHint: {
    color: '#6c757d',
    fontSize: '12px',
    fontStyle: 'italic',
    marginTop: '5px'
  },
  modalActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end',
    marginTop: '30px',
    paddingTop: '25px',
    borderTop: '2px solid #e9ecef'
  },
  cancelButton: {
    padding: '15px 30px',
    border: '2px solid #6c757d',
    backgroundColor: 'white',
    color: '#6c757d',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  submitButton: {
    padding: '15px 30px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
  },
  deleteButton: {
    padding: '15px 30px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    boxShadow: '0 4px 12px rgba(220,53,69,0.3)'
  },
  viewContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  viewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  viewImage: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginTop: '10px',
    border: '2px solid #e9ecef'
  },
  excerpt: {
    margin: '10px 0 0 0',
    padding: '20px',
    backgroundColor: '#e7f3ff',
    borderRadius: '8px',
    fontSize: '15px',
    lineHeight: '1.6',
    borderLeft: '4px solid #007bff'
  },
  content: {
    margin: '10px 0 0 0',
    padding: '20px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    fontSize: '15px',
    lineHeight: '1.7',
    borderLeft: '4px solid #28a745'
  },
  deleteContent: {
    textAlign: 'center',
    padding: '25px 0'
  },
  deleteTitle: {
    fontWeight: '600',
    color: '#dc3545',
    margin: '20px 0',
    fontSize: '18px'
  },
  deleteWarning: {
    color: '#6c757d',
    fontSize: '15px',
    fontStyle: 'italic',
    marginBottom: '25px'
  }
};

export default AdminActualitesmanager;