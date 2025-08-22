import React, { useState, useEffect } from 'react';
import { 
  Trash2, Edit, Plus, X, Phone, Mail, AlertCircle, Eye, 
  CheckCircle, XCircle, CreditCard, EyeOff, Save, UserPlus
} from 'lucide-react';
import './CommercialPage.css';
import Sidebar from '../components/Sidebar';

const handleLogout = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('token');
  }
  window.location.href = '/';
};

const PaymentManagerPage = () => {
  const [managers, setManagers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [editingManager, setEditingManager] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newManager, setNewManager] = useState({ 
    nom: '', 
    telephone: '', 
    email: '',
    motDePasse: '',
    confirmPassword: '',
    actif: true
  });

  // Get token from localStorage
  const token = typeof window !== 'undefined' ? window.localStorage?.getItem('token') : null;
  const headers = { 
    'Authorization': `Bearer ${token}`, 
    'Content-Type': 'application/json' 
  };

  const fetchManagers = async () => {
    try {
      console.log('Fetching managers...');
      setLoading(true);
      
      const res = await fetch('http://localhost:5000/api/admin/paiement-managers', { 
        headers,
        method: 'GET'
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`Erreur ${res.status}: ${errorText || 'Erreur serveur'}`);
      }
      
      const data = await res.json();
      console.log('Received data:', data);
      
      // Handle both array response and object with data property
      const managersArray = Array.isArray(data) ? data : (data.data || []);
      setManagers(managersArray);
      setError('');
      
    } catch (error) {
      console.error('Erreur fetchManagers:', error);
      setError('Impossible de charger les gestionnaires: ' + error.message);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Reset errors
    setError('');
    
    if (!newManager.nom || !newManager.nom.trim()) {
      setError('Le nom est requis');
      return false;
    }
    
    if (!newManager.email || !newManager.email.trim()) {
      setError('L\'email est requis');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newManager.email.trim())) {
      setError('Format d\'email invalide');
      return false;
    }
    
    if (!newManager.telephone || !newManager.telephone.trim()) {
      setError('Le téléphone est requis');
      return false;
    }
    
    // Validation du mot de passe pour les nouveaux managers
    if (!editingManager && (!newManager.motDePasse || !newManager.motDePasse.trim())) {
      setError('Le mot de passe est requis');
      return false;
    }
    
    // Si un mot de passe est fourni, valider
    if (newManager.motDePasse && newManager.motDePasse.trim()) {
      if (newManager.motDePasse.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return false;
      }
      
      // Vérification de la confirmation du mot de passe
      if (newManager.motDePasse !== newManager.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return false;
      }
    }
    
    return true;
  };

  const handleCreateOrUpdateManager = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const url = editingManager 
        ? `http://localhost:5000/api/admin/paiement-managers/${editingManager._id}`
        : 'http://localhost:5000/api/admin/paiement-managers';
      
      const method = editingManager ? 'PUT' : 'POST';
      
      // Préparer les données à envoyer
      const dataToSend = {
        nom: newManager.nom.trim(),
        telephone: newManager.telephone.trim(),
        email: newManager.email.trim().toLowerCase(),
        actif: Boolean(newManager.actif)
      };
      
      // Inclure le mot de passe seulement s'il est fourni et non vide
      if (newManager.motDePasse && newManager.motDePasse.trim() !== '') {
        dataToSend.motDePasse = newManager.motDePasse.trim();
      }
      
      console.log('Sending request:', { 
        method, 
        url, 
        data: { ...dataToSend, motDePasse: dataToSend.motDePasse ? '[PROVIDED]' : '[NOT PROVIDED]' } 
      });
      
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(dataToSend)
      });
      
      console.log('Response status:', res.status);
      
      if (res.ok) {
        const responseData = await res.json();
        console.log('Success response:', responseData);
        
        setSuccess(editingManager ? 'Manager modifié avec succès!' : 'Manager créé avec succès!');
        resetForm();
        await fetchManagers();
        setShowModal(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
        
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Erreur serveur' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Erreur HTTP ${res.status}`);
      }
    } catch (error) {
      console.error('Erreur création/modification manager:', error);
      setError(error.message || 'Impossible de sauvegarder le gestionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManager = async () => {
    if (!managerToDelete) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/paiement-managers/${managerToDelete._id}`, {
        method: 'DELETE',
        headers
      });
      
      if (res.ok) {
        setSuccess('Manager supprimé avec succès!');
        await fetchManagers();
        setShowDeleteModal(false);
        setManagerToDelete(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
        
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Erreur serveur' }));
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression manager:', error);
      setError('Impossible de supprimer le gestionnaire: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (manager) => {
    if (loading) return; // Prevent multiple clicks
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const res = await fetch(`http://localhost:5000/api/admin/paiement-managers/${manager._id}/toggle-active`, {
        method: 'PATCH',
        headers
      });
      
      if (res.ok) {
        const newStatus = !manager.actif;
        setSuccess(`Manager ${newStatus ? 'activé' : 'désactivé'} avec succès!`);
        await fetchManagers();
        
        // Clear success message after 2 seconds
        setTimeout(() => setSuccess(''), 2000);
        
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Erreur serveur' }));
        throw new Error(errorData.message || 'Erreur lors de la modification du statut');
      }
    } catch (error) {
      console.error('Erreur toggle actif:', error);
      setError('Impossible de modifier le statut: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewManager({ 
      nom: '', 
      telephone: '', 
      email: '',
      motDePasse: '',
      confirmPassword: '',
      actif: true
    });
    setEditingManager(null);
    setShowPassword(false);
    setError('');
    setSuccess('');
  };

  const openEditModal = (manager) => {
    setEditingManager(manager);
    setNewManager({
      nom: manager.nom || '',
      telephone: manager.telephone || '',
      email: manager.email || '',
      motDePasse: '',
      confirmPassword: '',
      actif: manager.actif !== false
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setManagerToDelete(null);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  // Clear messages after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="commercial-page">
      <Sidebar onLogout={handleLogout} />
      
      <div className="container">
        {/* Header */}
        <div className="header-card">
          <div className="header-content">
            <div className="header-info">
              <h1 className="page-title">
                <CreditCard size={28} />
                Gestion des Managers de Site
              </h1>
              <p className="page-subtitle">
                Gérez les comptes des gestionnaires de site
              </p>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={openAddModal}
              disabled={loading}
            >
              <UserPlus size={20} />
              Nouveau Manager
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message" style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '12px 16px',
            margin: '16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={20} />
            {success}
            <button 
              onClick={() => setSuccess('')}
              className="btn-close"
              style={{ 
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#155724'
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            {error}
            <button 
              onClick={() => setError('')}
              className="btn-close"
              style={{ marginLeft: 'auto' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Managers List */}
        <div className="commercials-card">
          <div className="section-header">
            <h2 className="section-title">
              <CreditCard size={24} className="icon-green" />
              Gestionnaires de Site ({managers.length})
            </h2>
            
            {managers.length > 0 && (
              <button 
                className="btn btn-outline" 
                onClick={fetchManagers}
                disabled={loading}
                title="Actualiser la liste"
              >
                🔄 Actualiser
              </button>
            )}
          </div>
          
          {loading && managers.length === 0 ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Chargement des gestionnaires...</p>
            </div>
          ) : (
            <>
              {managers.length > 0 ? (
                <div className="commercials-grid">
                  {managers.map(manager => (
                    <div key={manager._id} className="commercial-item">
                      <div className="commercial-header">
                        <div className="commercial-name-section">
                          <h3 className="commercial-name">{manager.nom}</h3>
                          <div className="commercial-status">
                            <button
                              onClick={() => handleToggleActive(manager)}
                              className={`badge ${manager.actif ? 'green-badge' : 'red-badge'}`}
                              title={`Cliquer pour ${manager.actif ? 'désactiver' : 'activer'}`}
                              disabled={loading}
                              style={{ 
                                cursor: loading ? 'not-allowed' : 'pointer',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                opacity: loading ? 0.6 : 1
                              }}
                            >
                              {manager.actif ? (
                                <>
                                  <CheckCircle size={12} />
                                  Actif
                                </>
                              ) : (
                                <>
                                  <XCircle size={12} />
                                  Inactif
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="commercial-actions">
                          <button
                            onClick={() => openEditModal(manager)}
                            className="btn-icon yellow"
                            title="Modifier"
                            disabled={loading}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setManagerToDelete(manager);
                              setShowDeleteModal(true);
                            }}
                            className="btn-icon red"
                            title="Supprimer"
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="commercial-details">
                        {manager.telephone && (
                          <div className="detail-item">
                            <Phone size={14} />
                            <span>{manager.telephone}</span>
                          </div>
                        )}
                        {manager.email && (
                          <div className="detail-item">
                            <Mail size={14} />
                            <span>{manager.email}</span>
                          </div>
                        )}
                        {manager.createdAt && (
                          <div className="detail-small">
                            Créé le {formatDate(manager.createdAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-students">
                  <CreditCard size={48} />
                  <h3>Aucun gestionnaire de Site</h3>
                  <p>Commencez par créer votre premier gestionnaire de Site</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={openAddModal}
                    disabled={loading}
                  >
                    <UserPlus size={20} />
                    Créer le premier gestionnaire
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal for Add/Edit Manager */}
        {showModal && (
          <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}>
            <div className="modal">
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingManager ? (
                    <>
                      <Edit size={24} />
                      Modifier le Manager
                    </>
                  ) : (
                    <>
                      <UserPlus size={24} />
                      Nouveau Manager
                    </>
                  )}
                </h3>
                <button
                  onClick={closeModal}
                  className="btn-close"
                  disabled={loading}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleCreateOrUpdateManager}>
                  <div className="form-group">
                    <label htmlFor="nom">Nom complet *</label>
                    <input
                      id="nom"
                      type="text"
                      value={newManager.nom}
                      onChange={e => setNewManager({ ...newManager, nom: e.target.value })}
                      placeholder="Nom et prénom du gestionnaire"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="telephone">Téléphone *</label>
                    <input
                      id="telephone"
                      type="tel"
                      value={newManager.telephone}
                      onChange={e => setNewManager({ ...newManager, telephone: e.target.value })}
                      placeholder="Numéro de téléphone"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      id="email"
                      type="email"
                      value={newManager.email}
                      onChange={e => setNewManager({ ...newManager, email: e.target.value })}
                      placeholder="Adresse email"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">
                      {editingManager ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newManager.motDePasse}
                        onChange={e => setNewManager({ ...newManager, motDePasse: e.target.value })}
                        required={!editingManager}
                        placeholder={editingManager ? "Laisser vide pour ne pas changer" : "Minimum 6 caractères"}
                        style={{ paddingRight: '45px' }}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          color: '#6b7280',
                          padding: '4px'
                        }}
                        title={showPassword ? "Masquer" : "Afficher"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {newManager.motDePasse && (
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={newManager.confirmPassword}
                        onChange={e => setNewManager({ ...newManager, confirmPassword: e.target.value })}
                        placeholder="Retaper le mot de passe"
                        required
                        disabled={loading}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={newManager.actif}
                        onChange={e => setNewManager({ ...newManager, actif: e.target.checked })}
                        disabled={loading}
                      />
                      <CheckCircle size={16} />
                      Compte actif
                    </label>
                    <small style={{ color: '#6b7280', marginLeft: '24px' }}>
                      Les comptes inactifs ne peuvent pas se connecter
                    </small>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {loading ? (
                        <>
                          <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                          {editingManager ? 'Modification...' : 'Création...'}
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          {editingManager ? 'Modifier' : 'Créer'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && managerToDelete && (
          <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}>
            <div className="modal small">
              <div className="modal-header">
                <h3 className="modal-title" style={{ color: '#dc3545' }}>
                  <Trash2 size={24} />
                  Confirmer la suppression
                </h3>
                <button
                  onClick={closeDeleteModal}
                  className="btn-close"
                  disabled={loading}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="modal-body">
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ 
                    backgroundColor: '#ffeaea', 
                    borderRadius: '50%', 
                    width: '60px', 
                    height: '60px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 16px' 
                  }}>
                    <Trash2 size={24} color="#dc3545" />
                  </div>
                  
                  <h4 style={{ margin: '0 0 8px', color: '#333' }}>
                    Supprimer le gestionnaire ?
                  </h4>
                  
                  <p className="modal-text" style={{ margin: '0 0 16px' }}>
                    Êtes-vous sûr de vouloir supprimer <strong>{managerToDelete.nom}</strong> ?
                  </p>
                  
                  <div style={{ 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeaa7',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '20px'
                  }}>
                    <small style={{ color: '#856404' }}>
                      ⚠️ Cette action est irréversible et supprimera définitivement ce gestionnaire.
                    </small>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button
                    onClick={handleDeleteManager}
                    disabled={loading}
                    className="btn btn-danger"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Supprimer définitivement
                      </>
                    )}
                  </button>
                  <button
                    onClick={closeDeleteModal}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagerPage;