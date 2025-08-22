import React, { useEffect, useState } from 'react';
import { 
  Mail, 
  User, 
  MessageSquare, 
  Clock, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  Grid, 
  List,
  Phone,
  GraduationCap,
  Tag,
  X
} from 'lucide-react';
import Sidebar from '../components/Sidebar'; // ✅ استيراد صحيح

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' ou 'cards'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Import axios pour les appels API
  const axios = require('axios'); // Assure-toi d'avoir installé axios

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token'); // JWT token d'admin
        const response = await fetch('http://localhost:5000/api/admin/contact-messages', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setMessages(data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des messages:', err);
        setError('Erreur de chargement des messages');
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/contact-messages/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur lors de la suppression: ${response.status}`);
        }

        const result = await response.json();
        
        // Mise à jour de la liste locale après suppression réussie
        setMessages(messages.filter(msg => msg._id !== id));
        
        // Optionnel: afficher un message de succès
        alert(result.message || 'Message supprimé avec succès');
        
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression du message');
      }
    }
  };

  const openModal = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  // Filtrage des messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = searchTerm === '' || 
      msg.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterSubject === '' || msg.subject === filterSubject;
    
    return matchesSearch && matchesFilter;
  });

  const uniqueSubjects = [...new Set(messages.map(msg => msg.subject))];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Chargement des messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
              <Sidebar onLogout={handleLogout} />
        
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion des Messages</h1>
        <div style={styles.headerControls}>
          <div style={styles.searchContainer}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.filterContainer}>
            <Filter size={20} style={styles.filterIcon} />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Tous les sujets</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                ...styles.toggleButton,
                ...(viewMode === 'table' ? styles.toggleButtonActive : {})
              }}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                ...styles.toggleButton,
                ...(viewMode === 'cards' ? styles.toggleButtonActive : {})
              }}
            >
              <Grid size={20} />
            </button>
          </div>
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div style={styles.emptyState}>
          <MessageSquare size={48} style={styles.emptyIcon} />
          <p>Aucun message trouvé</p>
        </div>
      ) : (
        <div style={styles.content}>
          {viewMode === 'table' ? (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Contact</th>
                    <th style={styles.th}>Sujet</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((msg) => (
                    <tr key={msg._id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.contactInfo}>
                          <User size={16} style={styles.contactIcon} />
                          <div>
                            <div style={styles.contactName}>
                              {msg.firstName} {msg.lastName}
                            </div>
                            <div style={styles.contactEmail}>{msg.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.subject}>{msg.subject}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.dateInfo}>
                          <Clock size={14} />
                          {new Date(msg.date).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            onClick={() => openModal(msg)}
                            style={styles.actionButton}
                            title="Voir détails"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(msg._id)}
                            style={{...styles.actionButton, ...styles.deleteButton}}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.cardsContainer}>
              {filteredMessages.map((msg) => (
                <div key={msg._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardContact}>
                      <User size={18} />
                      <span>{msg.firstName} {msg.lastName}</span>
                    </div>
                    <div style={styles.cardDate}>
                      <Clock size={14} />
                      {new Date(msg.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  
                  <div style={styles.cardBody}>
                    <div style={styles.cardMeta}>
                      <div style={styles.metaItem}>
                        <Mail size={14} />
                        <span>{msg.email}</span>
                      </div>
                      {msg.phone && (
                        <div style={styles.metaItem}>
                          <Phone size={14} />
                          <span>{msg.phone}</span>
                        </div>
                      )}
                      {msg.cycle && (
                        <div style={styles.metaItem}>
                          <GraduationCap size={14} />
                          <span>{msg.cycle}</span>
                        </div>
                      )}
                      <div style={styles.metaItem}>
                        <Tag size={14} />
                        <span>{msg.subject}</span>
                      </div>
                    </div>
                    
                    <div style={styles.cardMessage}>
                      <MessageSquare size={16} />
                      <p>{msg.message.substring(0, 100)}...</p>
                    </div>
                  </div>
                  
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => openModal(msg)}
                      style={styles.cardActionButton}
                    >
                      <Eye size={16} />
                      Voir détails
                    </button>
                    <button
                      onClick={() => handleDelete(msg._id)}
                      style={{...styles.cardActionButton, ...styles.cardDeleteButton}}
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedMessage && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Détails du Message</h2>
              <button onClick={closeModal} style={styles.closeButton}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.modalContact}>
                <User size={20} />
                <div>
                  <h3>{selectedMessage.firstName} {selectedMessage.lastName}</h3>
                  <p>{selectedMessage.email}</p>
                </div>
              </div>
              
              <div style={styles.modalMeta}>
                {selectedMessage.phone && (
                  <div style={styles.modalMetaItem}>
                    <Phone size={16} />
                    <span>{selectedMessage.phone}</span>
                  </div>
                )}
                {selectedMessage.cycle && (
                  <div style={styles.modalMetaItem}>
                    <GraduationCap size={16} />
                    <span>{selectedMessage.cycle}</span>
                  </div>
                )}
                <div style={styles.modalMetaItem}>
                  <Tag size={16} />
                  <span>{selectedMessage.subject}</span>
                </div>
                <div style={styles.modalMetaItem}>
                  <Clock size={16} />
                  <span>{new Date(selectedMessage.date).toLocaleString('fr-FR')}</span>
                </div>
              </div>
              
              <div style={styles.modalMessage}>
                <h4>Message :</h4>
                <p>{selectedMessage.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)',
    minHeight: '100vh'
  },
  
  header: {
    marginBottom: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    backgroundColor: 'white',
    borderRadius: '15px'
  },
  
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0',
    textAlign: 'center'
  },
  
  headerControls: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  
  searchContainer: {
    position: 'relative',
    flex: '1',
    minWidth: '250px'
  },
  
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666'
  },
  
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  
  filterContainer: {
    position: 'relative',
    minWidth: '180px'
  },
  
  filterIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
    pointerEvents: 'none'
  },
  
  filterSelect: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white'
  },
  
  viewToggle: {
    display: 'flex',
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  
  toggleButton: {
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s'
  },
  
  toggleButtonActive: {
    backgroundColor: '#007bff',
    color: 'white'
  },
  
  content: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  
  tableContainer: {
    overflowX: 'auto'
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  
  tableHeader: {
    backgroundColor: '#f8f9fa'
  },
  
  th: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#333',
    borderBottom: '1px solid #eee'
  },
  
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s'
  },
  
  td: {
    padding: '16px',
    verticalAlign: 'top'
  },
  
  contactInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  
  contactIcon: {
    color: '#666'
  },
  
  contactName: {
    fontWeight: '600',
    marginBottom: '4px'
  },
  
  contactEmail: {
    fontSize: '13px',
    color: '#666'
  },
  
  subject: {
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  
  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#666'
  },
  
  actions: {
    display: 'flex',
    gap: '8px'
  },
  
  actionButton: {
    padding: '8px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s'
  },
  
  deleteButton: {
    backgroundColor: '#ffebee',
    color: '#d32f2f'
  },
  
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    padding: '20px'
  },
  
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: 'white',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  
  cardContact: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600'
  },
  
  cardDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#666'
  },
  
  cardBody: {
    marginBottom: '16px'
  },
  
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#555'
  },
  
  cardMessage: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#333'
  },
  
  cardActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  },
  
  cardActionButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    transition: 'background-color 0.2s'
  },
  
  cardDeleteButton: {
    backgroundColor: '#dc3545'
  },
  
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '1000',
    padding: '20px'
  },
  
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee'
  },
  
  modalTitle: {
    margin: '0',
    fontSize: '20px',
    fontWeight: '600'
  },
  
  closeButton: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    color: '#666'
  },
  
  modalBody: {
    padding: '20px'
  },
  
  modalContact: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  
  modalMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px'
  },
  
  modalMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#555'
  },
  
  modalMessage: {
    marginTop: '20px'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px'
  },
  
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  },
  
  errorText: {
    color: '#d32f2f',
    fontSize: '16px'
  },
  
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    gap: '16px',
    color: '#666'
  },
  
  emptyIcon: {
    color: '#ccc'
  }
};

// Animation CSS pour le spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  table tbody tr:hover {
    background-color: #f8f9fa;
  }
  
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  button:hover {
    opacity: 0.8;
  }
  
  input:focus, select:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
  
  @media (max-width: 768px) {
    .headerControls {
      flex-direction: column;
      align-items: stretch;
    }
    
    .searchContainer, .filterContainer {
      min-width: auto;
    }
    
    .table {
      font-size: 14px;
    }
    
    .th, .td {
      padding: 12px 8px;
    }
    
    .cardsContainer {
      grid-template-columns: 1fr;
      padding: 16px;
    }
    
    .modal {
      margin: 10px;
      max-height: 90vh;
    }
  }
`;
document.head.appendChild(styleSheet);

export default AdminMessages;