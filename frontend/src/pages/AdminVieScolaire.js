import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  Package, 
  FileText, 
  X, 
  Grid3X3, 
  List,
  Save,
  Upload,
  Activity,
  Palette,
  Microscope,
  Brush,
  Bus,
  PartyPopper,
  GraduationCap,
  School,
  BookOpen,
  Baby,
  ClipboardList,
  Settings,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar'; // ✅ استيراد صحيح

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};
const AdminVieScolaire = () => {
  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    fullDescription: '',
    lieu: '',
    organisateur: '',
    materiel: '',
    category: '',
    cycle: '',
    year: '',
    participants: ''
  });
  const [images, setImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('cards');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const token = localStorage.getItem('token');

  const fetchActivities = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/vie-scolaire');
      const data = await res.json();
      setActivities(data.data);
    } catch (err) {
      console.error('Erreur fetch:', err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSubmit = async () => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    images.forEach((img) => data.append('images', img));

    const url = editingId
      ? `http://localhost:5000/api/vie-scolaire/${editingId}`
      : 'http://localhost:5000/api/vie-scolaire';

    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) throw new Error('Erreur de création/mise à jour');

      await fetchActivities();
      setEditingId(null);
      setFormData({
        title: '',
        date: '',
        time: '',
        description: '',
        fullDescription: '',
        lieu: '',
        organisateur: '',
        materiel: '',
        category: '',
        cycle: '',
        year: '',
        participants: ''
      });
      setImages([]);
      setShowAddModal(false);
      alert(editingId ? '✅ Activité mise à jour' : '✅ Activité ajoutée');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette activité ?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/vie-scolaire/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Échec de suppression');
      await fetchActivities();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleEdit = (activity) => {
    setFormData({
      title: activity.title || '',
      date: activity.date?.substring(0, 10) || '',
      time: activity.time || '',
      description: activity.description || '',
      fullDescription: activity.fullDescription || '',
      lieu: activity.lieu || '',
      organisateur: activity.organisateur || '',
      materiel: activity.materiel || '',
      category: activity.category || '',
      cycle: activity.cycle || '',
      year: activity.year || '',
      participants: activity.participants || ''
    });
    setEditingId(activity._id);
    setImages([]);
    setShowAddModal(true);
  };

  const handleAddNew = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      description: '',
      fullDescription: '',
      lieu: '',
      organisateur: '',
      materiel: '',
      category: '',
      cycle: '',
      year: '',
      participants: ''
    });
    setEditingId(null);
    setImages([]);
    setShowAddModal(true);
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setCurrentImageIndex(0);
    setShowDetails(true);
  };

  const getCategoryColor = (category) => {
    const colors = {
      sport: '#e74c3c',
      culture: '#9b59b6',
      science: '#3498db',
      art: '#e67e22',
      sortie: '#27ae60',
      ceremonie: '#f39c12'
    };
    return colors[category] || '#95a5a6';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      sport: <Activity size={16} />,
      culture: <Palette size={16} />,
      science: <Microscope size={16} />,
      art: <Brush size={16} />,
      sortie: <Bus size={16} />,
      ceremonie: <PartyPopper size={16} />
    };
    return icons[category] || <ClipboardList size={16} />;
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f3e8ff 100%)',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '30px',
      backgroundColor: 'white',
      borderRadius: '15px',
      gap: '20px'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#2c3e50',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '15px'
    },
    headerControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    countBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      backgroundColor: '#6366f1',
      color: 'white',
      borderRadius: '25px',
      fontSize: '14px',
      fontWeight: '600',
      border: 'none'
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    viewToggle: {
      display: 'flex',
      backgroundColor: 'white',
      borderRadius: '25px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    toggleBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      color: '#6b7280'
    },
    toggleBtnActive: {
      backgroundColor: '#6366f1',
      color: 'white'
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    categoryBadge: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '6px 12px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      borderRadius: '20px'
    },
    cardTitle: {
      fontSize: '1.4rem',
      fontWeight: '700',
      color: '#2c3e50',
      marginBottom: '15px',
      marginTop: '10px',
      paddingRight: '100px'
    },
    cardMeta: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '15px',
      fontSize: '14px',
      color: '#7f8c8d'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    cardDescription: {
      color: '#5a6c7d',
      lineHeight: '1.6',
      marginBottom: '20px'
    },
    cardActions: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    actionBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '8px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    detailBtn: {
      backgroundColor: '#27ae60',
      color: 'white'
    },
    editBtn: {
      backgroundColor: '#f39c12',
      color: 'white'
    },
    deleteBtn: {
      backgroundColor: '#e74c3c',
      color: 'white'
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '800px'
    },
    th: {
      padding: '20px 15px',
      backgroundColor: '#34495e',
      color: 'white',
      fontWeight: '600',
      textAlign: 'left',
      fontSize: '14px'
    },
    td: {
      padding: '15px',
      borderBottom: '1px solid #ecf0f1',
      fontSize: '14px',
      color: '#2c3e50'
    },
    modal: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000',
      padding: '20px'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '0',
      maxWidth: '900px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '25px 30px',
      borderBottom: '1px solid #ecf0f1',
      backgroundColor: '#f8f9fa'
    },
    modalTitle: {
      fontSize: '1.8rem',
      color: '#2c3e50',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    closeBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      background: 'none',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      color: '#7f8c8d',
      transition: 'all 0.3s ease'
    },
    modalBody: {
      padding: '30px',
      overflowY: 'auto',
      flex: '1'
    },
    form: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#34495e',
      fontSize: '14px'
    },
    input: {
      padding: '12px 15px',
      border: '2px solid #ecf0f1',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    textarea: {
      padding: '12px 15px',
      border: '2px solid #ecf0f1',
      borderRadius: '8px',
      fontSize: '16px',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit',
      outline: 'none'
    },
    select: {
      padding: '12px 15px',
      border: '2px solid #ecf0f1',
      borderRadius: '8px',
      fontSize: '16px',
      backgroundColor: 'white',
      outline: 'none'
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      padding: '25px 30px',
      borderTop: '1px solid #ecf0f1',
      backgroundColor: '#f8f9fa'
    },
    cancelBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: '#95a5a6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    saveBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    detailGroup: {
      marginBottom: '20px'
    },
    detailLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600',
      color: '#34495e',
      marginBottom: '8px',
      fontSize: '14px'
    },
    detailValue: {
      color: '#5a6c7d',
      lineHeight: '1.6',
      paddingLeft: '24px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px',
      color: '#7f8c8d'
    },
    emptyIcon: {
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'center'
    },
    emptyTitle: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#34495e'
    },
    emptyText: {
      fontSize: '16px',
      marginBottom: '30px'
    },
    cardImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      borderRadius: '8px',
      marginBottom: '15px'
    },
    imageGallery: {
      position: 'relative',
      marginBottom: '20px'
    },
    galleryImage: {
      width: '100%',
      height: '300px',
      objectFit: 'cover',
      borderRadius: '8px'
    },
    imageNavigation: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(0,0,0,0.5)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    prevBtn: {
      left: '10px'
    },
    nextBtn: {
      right: '10px'
    },
    imageCounter: {
      position: 'absolute',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px'
    },
    imageThumbnails: {
      display: 'flex',
      gap: '8px',
      marginTop: '10px',
      overflowX: 'auto',
      paddingBottom: '5px'
    },
    thumbnail: {
      width: '60px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '4px',
      cursor: 'pointer',
      border: '2px solid transparent',
      transition: 'all 0.3s ease',
      flexShrink: 0
    },
    thumbnailActive: {
      border: '2px solid #3498db'
    },
    noImage: {
      width: '100%',
      height: '200px',
      backgroundColor: '#ecf0f1',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#7f8c8d',
      marginBottom: '15px',
      flexDirection: 'column',
      gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
            <Sidebar onLogout={handleLogout} />
      
      <div style={styles.header}>
        <h1 style={styles.title}>
          Gestion des Activités Vie Scolaire
        </h1>
        
        <div style={styles.headerControls}>
          <div style={styles.countBadge}>
            <ClipboardList size={16} />
            Total: {activities.length} activités
          </div>
          
          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                ...styles.toggleBtn,
                ...(viewMode === 'table' ? styles.toggleBtnActive : {})
              }}
            >
              <List size={16} />
              Tableau
            </button>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                ...styles.toggleBtn,
                ...(viewMode === 'cards' ? styles.toggleBtnActive : {})
              }}
            >
              <Grid3X3 size={16} />
              Cartes
            </button>
          </div>
          
          <button onClick={handleAddNew} style={styles.addButton}>
            <Plus size={16} />
            Ajouter une activité
          </button>
        </div>
      </div>

      {activities.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <ClipboardList size={64} color="#bdc3c7" />
          </div>
          <h3 style={styles.emptyTitle}>Aucune activité enregistrée</h3>
          <p style={styles.emptyText}>Commencez par ajouter votre première activité !</p>
          <button onClick={handleAddNew} style={styles.addButton}>
            <Plus size={16} />
            Ajouter une activité
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {viewMode === 'cards' ? (
            <div style={styles.cardsContainer}>
              {activities.map((act) => (
            <div key={act._id} style={styles.card}>
              <div
                style={{
                  ...styles.categoryBadge,
                  backgroundColor: getCategoryColor(act.category)
                }}
              >
                {getCategoryIcon(act.category)}
                {act.category}
              </div>
              
              {/* Image de l'activité */}
              {act.images && act.images.length > 0 ? (
                <img
                  src={`http://localhost:5000${act.images[0]}`}
                  alt={act.title}
                  style={styles.cardImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{...styles.noImage, display: (!act.images || act.images.length === 0) ? 'flex' : 'none'}}>
                <ImageIcon size={32} />
                <span>Aucune image</span>
              </div>
              
              <h3 style={styles.cardTitle}>{act.title}</h3>
              <div style={styles.cardMeta}>
                <div style={styles.metaItem}>
                  <Calendar size={16} />
                  <span>{act.date?.substring(0, 10)}</span>
                </div>
                {act.time && (
                  <div style={styles.metaItem}>
                    <Clock size={16} />
                    <span>{act.time}</span>
                  </div>
                )}
                {act.lieu && (
                  <div style={styles.metaItem}>
                    <MapPin size={16} />
                    <span>{act.lieu}</span>
                  </div>
                )}
                {act.participants && (
                  <div style={styles.metaItem}>
                    <Users size={16} />
                    <span>{act.participants} participants</span>
                  </div>
                )}
              </div>
              <p style={styles.cardDescription}>{act.description}</p>
              <div style={styles.cardActions}>
                <button
                  onClick={() => handleViewDetails(act)}
                  style={{ ...styles.actionBtn, ...styles.detailBtn }}
                >
                  <Eye size={14} />
                  Détails
                </button>
                <button
                  onClick={() => handleEdit(act)}
                  style={{ ...styles.actionBtn, ...styles.editBtn }}
                >
                  <Edit size={14} />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(act._id)}
                  style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </div>
            </div>
              ))}
            </div>
          ) : (
            <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Titre</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Catégorie</th>
                <th style={styles.th}>Cycle</th>
                <th style={styles.th}>Participants</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => (
                <tr key={act._id}>
                  <td style={styles.td}><strong>{act.title}</strong></td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} />
                      {act.date?.substring(0, 10)}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '12px',
                        backgroundColor: getCategoryColor(act.category),
                        width: 'fit-content'
                      }}
                    >
                      <span>{getCategoryIcon(act.category)}</span>
                      {act.category}
                    </span>
                  </td>
                  <td style={styles.td}>{act.cycle}</td>
                  <td style={styles.td}>
                    {act.participants ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={14} />
                        {act.participants}
                      </div>
                    ) : '-'}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleViewDetails(act)}
                        style={{ 
                          ...styles.actionBtn, 
                          ...styles.detailBtn, 
                          fontSize: '12px', 
                          padding: '6px 8px' 
                        }}
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => handleEdit(act)}
                        style={{ 
                          ...styles.actionBtn, 
                          ...styles.editBtn, 
                          fontSize: '12px', 
                          padding: '6px 8px' 
                        }}
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(act._id)}
                        style={{ 
                          ...styles.actionBtn, 
                          ...styles.deleteBtn, 
                          fontSize: '12px', 
                          padding: '6px 8px' 
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {/* Modal d'ajout/modification */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingId ? <Edit size={24} /> : <Plus size={24} />}
                {editingId ? 'Modifier l\'activité' : 'Ajouter une activité'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={styles.closeBtn}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FileText size={16} />
                    Titre *
                  </label>
                  <input
                    type="text"
                    placeholder="Titre de l'activité"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Calendar size={16} />
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Clock size={16} />
                    Heure
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <MapPin size={16} />
                    Lieu
                  </label>
                  <input
                    type="text"
                    placeholder="Lieu de l'activité"
                    value={formData.lieu}
                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <User size={16} />
                    Organisateur
                  </label>
                  <input
                    type="text"
                    placeholder="Nom de l'organisateur"
                    value={formData.organisateur}
                    onChange={(e) => setFormData({ ...formData, organisateur: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Package size={16} />
                    Matériel nécessaire
                  </label>
                  <input
                    type="text"
                    placeholder="Matériel requis"
                    value={formData.materiel}
                    onChange={(e) => setFormData({ ...formData, materiel: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <BookOpen size={16} />
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={styles.select}
                  >
                    <option value="">-- Sélectionner une catégorie --</option>
                    <option value="sport">Sport</option>
                    <option value="culture">Culture</option>
                    <option value="science">Science</option>
                    <option value="art">Art</option>
                    <option value="sortie">Sortie</option>
                    <option value="ceremonie">Cérémonie</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <GraduationCap size={16} />
                    Cycle *
                  </label>
                  <select
                    required
                    value={formData.cycle}
                    onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                    style={styles.select}
                  >
                    <option value="">-- Sélectionner un cycle --</option>
                    <option value="creche">Crèche & Préscolaire</option>
                    <option value="primaire">École Primaire</option>
                    <option value="college">Collège</option>
                    <option value="lycee">Lycée</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <School size={16} />
                    Année scolaire *
                  </label>
                  <select
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    style={styles.select}
                  >
                    <option value="">-- Sélectionner une année --</option>
                    <option value="2023/2024">2023 / 2024</option>
                    <option value="2024/2025">2024 / 2025</option>
                    <option value="2025/2026">2025 / 2026</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Users size={16} />
                    Nombre de participants
                  </label>
                  <input
                    type="number"
                    placeholder="Nombre de participants"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FileText size={16} />
                    Description courte *
                  </label>
                  <textarea
                    placeholder="Description brève de l'activité"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <FileText size={16} />
                    Description complète
                  </label>
                  <textarea
                    placeholder="Description détaillée de l'activité"
                    value={formData.fullDescription}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Upload size={16} />
                    Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files))}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowAddModal(false)}
                style={styles.cancelBtn}
              >
                <X size={16} />
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                style={styles.saveBtn}
              >
                <Save size={16} />
                {editingId ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetails && selectedActivity && (
        <div style={styles.modal} onClick={() => setShowDetails(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Eye size={24} />
                Détails de l'activité
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                style={styles.closeBtn}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              {/* Galerie d'images */}
              {selectedActivity.images && selectedActivity.images.length > 0 && (
                <div style={styles.imageGallery}>
                  <img
                    src={`http://localhost:5000${selectedActivity.images[currentImageIndex]}`}
                    alt={selectedActivity.title}
                    style={styles.galleryImage}
                  />
                  
                  {selectedActivity.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(
                          currentImageIndex === 0 
                            ? selectedActivity.images.length - 1 
                            : currentImageIndex - 1
                        )}
                        style={{...styles.imageNavigation, ...styles.prevBtn}}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      <button
                        onClick={() => setCurrentImageIndex(
                          currentImageIndex === selectedActivity.images.length - 1 
                            ? 0 
                            : currentImageIndex + 1
                        )}
                        style={{...styles.imageNavigation, ...styles.nextBtn}}
                      >
                        <ChevronRight size={20} />
                      </button>
                      
                      <div style={styles.imageCounter}>
                        {currentImageIndex + 1} / {selectedActivity.images.length}
                      </div>
                    </>
                  )}
                  
                  {selectedActivity.images.length > 1 && (
                    <div style={styles.imageThumbnails}>
                      {selectedActivity.images.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000${image}`}
                          alt={`${selectedActivity.title} ${index + 1}`}
                          style={{
                            ...styles.thumbnail,
                            ...(index === currentImageIndex ? styles.thumbnailActive : {})
                          }}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div style={styles.detailGroup}>
                <div style={styles.detailLabel}>
                  <FileText size={16} />
                  Titre
                </div>
                <div style={styles.detailValue}>
                  <h3 style={{ margin: '0', color: '#2c3e50' }}>{selectedActivity.title}</h3>
                </div>
              </div>

              <div style={styles.detailGroup}>
                <div style={styles.detailLabel}>
                  <Calendar size={16} />
                  Date et heure
                </div>
                <div style={styles.detailValue}>
                  {selectedActivity.date?.substring(0, 10)}
                  {selectedActivity.time && ` à ${selectedActivity.time}`}
                </div>
              </div>

              {selectedActivity.lieu && (
                <div style={styles.detailGroup}>
                  <div style={styles.detailLabel}>
                    <MapPin size={16} />
                    Lieu
                  </div>
                  <div style={styles.detailValue}>{selectedActivity.lieu}</div>
                </div>
              )}

              {selectedActivity.organisateur && (
                <div style={styles.detailGroup}>
                  <div style={styles.detailLabel}>
                    <User size={16} />
                    Organisateur
                  </div>
                  <div style={styles.detailValue}>{selectedActivity.organisateur}</div>
                </div>
              )}

              <div style={styles.detailGroup}>
                <div style={styles.detailLabel}>
                  <BookOpen size={16} />
                  Catégorie
                </div>
                <div style={styles.detailValue}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: getCategoryColor(selectedActivity.category)
                    }}
                  >
                    {getCategoryIcon(selectedActivity.category)}
                    {selectedActivity.category}
                  </span>
                </div>
              </div>

              <div style={styles.detailGroup}>
                <div style={styles.detailLabel}>
                  <GraduationCap size={16} />
                  Cycle
                </div>
                <div style={styles.detailValue}>{selectedActivity.cycle}</div>
              </div>

              <div style={styles.detailGroup}>
                <div style={styles.detailLabel}>
                  <School size={16} />
                  Année scolaire
                </div>
                <div style={styles.detailValue}>{selectedActivity.year}</div>
              </div>

              {selectedActivity.participants && (
                <div style={styles.detailGroup}>
                  <div style={styles.detailLabel}>
                    <Users size={16} />
                    Nombre de participants
                  </div>
                  <div style={styles.detailValue}>
                    <strong>{selectedActivity.participants}</strong> participants
                  </div>
                </div>
              )}

              <div style={styles.detailGroup}>
                <div style={styles.detailLabel}>
                  <FileText size={16} />
                  Description
                </div>
                <div style={styles.detailValue}>
                  <p style={{ margin: '0', lineHeight: '1.6' }}>{selectedActivity.description}</p>
                </div>
              </div>

              {selectedActivity.fullDescription && (
                <div style={styles.detailGroup}>
                  <div style={styles.detailLabel}>
                    <FileText size={16} />
                    Description complète
                  </div>
                  <div style={styles.detailValue}>
                    <p style={{ margin: '0', lineHeight: '1.6' }}>{selectedActivity.fullDescription}</p>
                  </div>
                </div>
              )}

              {selectedActivity.materiel && (
                <div style={styles.detailGroup}>
                  <div style={styles.detailLabel}>
                    <Package size={16} />
                    Matériel nécessaire
                  </div>
                  <div style={styles.detailValue}>{selectedActivity.materiel}</div>
                </div>
              )}

              {selectedActivity.images && selectedActivity.images.length > 0 && (
                <div style={styles.detailGroup}>
                  <div style={styles.detailLabel}>
                    <ImageIcon size={16} />
                    Images ({selectedActivity.images.length})
                  </div>
                  <div style={styles.detailValue}>
                    <div style={styles.imageThumbnails}>
                      {selectedActivity.images.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000${image}`}
                          alt={`${selectedActivity.title} ${index + 1}`}
                          style={{
                            ...styles.thumbnail,
                            width: '80px',
                            height: '80px',
                            ...(index === currentImageIndex ? styles.thumbnailActive : {})
                          }}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={styles.modalFooter}>
              <button
                onClick={() => {
                  setShowDetails(false);
                  handleEdit(selectedActivity);
                }}
                style={styles.editBtn}
              >
                <Edit size={16} />
                Modifier cette activité
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVieScolaire;