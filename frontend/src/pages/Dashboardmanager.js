import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Calendar,
  TrendingUp,
  Activity,
  Bell,
  ChevronRight,
  BarChart3,
  PieChart,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  UserCheck,
  BookOpen,
  Award,
  Target,
  Zap
} from 'lucide-react';
import Sidebar from '../components/Sidebarmanager';

// Import des styles CSS
import './AdminDashboard.css';

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    actualites: {
      total: 0,
      pinned: 0,
      categories: {},
      types: {},
      recentActivity: []
    },
    vieScolaire: {
      total: 0,
      byCategory: {},
      byCycle: {},
      upcomingEvents: [],
      monthlyActivity: {}
    },
    messages: {
      total: 0,
      bySubject: {},
      recent: [],
      unread: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const token = localStorage.getItem('token');

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Chargement des données
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Chargement des actualités
        const actualitesRes = await fetch('http://localhost:5000/api/actualites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const actualitesData = await actualitesRes.json();
        const actualites = Array.isArray(actualitesData) ? actualitesData : actualitesData.actualites || [];

        // Chargement de la vie scolaire
        const vieScolaireRes = await fetch('http://localhost:5000/api/vie-scolaire');
        const vieScolaireData = await vieScolaireRes.json();
        const vieScolaire = vieScolaireData.data || [];

        // Chargement des messages
        const messagesRes = await fetch('http://localhost:5000/api/admin/contact-messages', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const messages = await messagesRes.json();

        // Traitement des statistiques d'actualités
        const actualitesStats = {
          total: actualites.length,
          pinned: actualites.filter(a => a.isPinned).length,
          categories: actualites.reduce((acc, a) => {
            acc[a.category] = (acc[a.category] || 0) + 1;
            return acc;
          }, {}),
          types: actualites.reduce((acc, a) => {
            acc[a.type] = (acc[a.type] || 0) + 1;
            return acc;
          }, {}),
          recentActivity: actualites
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        };

        // Traitement des statistiques de vie scolaire
        const vieScolaireStats = {
          total: vieScolaire.length,
          byCategory: vieScolaire.reduce((acc, v) => {
            acc[v.category] = (acc[v.category] || 0) + 1;
            return acc;
          }, {}),
          byCycle: vieScolaire.reduce((acc, v) => {
            acc[v.cycle] = (acc[v.cycle] || 0) + 1;
            return acc;
          }, {}),
          upcomingEvents: vieScolaire
            .filter(v => new Date(v.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5),
          monthlyActivity: vieScolaire.reduce((acc, v) => {
            const month = new Date(v.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {})
        };

        // Traitement des statistiques de messages
        const messagesStats = {
          total: messages.length,
          bySubject: messages.reduce((acc, m) => {
            acc[m.subject] = (acc[m.subject] || 0) + 1;
            return acc;
          }, {}),
          recent: messages
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5),
          unread: messages.filter(m => !m.read).length
        };

        setStats({
          actualites: actualitesStats,
          vieScolaire: vieScolaireStats,
          messages: messagesStats
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Sidebar onLogout={handleLogout} />
        <div className="dashboard-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6B7280', fontSize: '18px' }}>Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Sidebar onLogout={handleLogout} />
      
      {/* Header */}
      <header className="dashboard-header">
  <div className="container">
    <div className="header-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '160px' }}>
      <div className="header-info">
        <h1 style={{ margin: '0 auto', fontWeight: 'bold', fontSize: '2.2rem' }}>Tableau de Bord Manager</h1>
        <p style={{ margin: '8px 0 16px 0', fontSize: '1.1rem', color: '#374151' }}>Vue d'ensemble complète de la plateforme</p>
        <div className="connection-status" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', fontSize: '1rem', color: '#6366f1', gap: '8px' }}>
          <Clock size={18} style={{ marginRight: '6px' }} />
          {currentTime.toLocaleString('fr-FR')}
        </div>
      </div>
    </div>
  </div>
</header>

      <div className="dashboard-container">
        <div className="dashboard-content">
          
          {/* Alerte section */}
          {stats.messages.unread > 0 && (
            <div className="alert-section">
              <div className="alert-content">
                <Bell />
                <div className="alert-text">
                  <h3>Messages non lus</h3>
                  <p>Vous avez {stats.messages.unread} nouveau(x) message(s) en attente de traitement.</p>
                </div>
              </div>
            </div>
          )}

          {/* Statistiques principales */}
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-card-content">
                <div className="stat-card-info">
                  <div className="stat-card-title">Actualités Totales</div>
                  <div className="stat-card-value">{stats.actualites.total}</div>
                  <div className="stat-card-subtitle">Articles publiés</div>
                  <div className="stat-card-trend">
                    <TrendingUp size={14} />
                    +{stats.actualites.pinned} épinglées
                  </div>
                </div>
                <div className="stat-card-icon">
                  <FileText />
                </div>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-card-content">
                <div className="stat-card-info">
                  <div className="stat-card-title">Activités Scolaires</div>
                  <div className="stat-card-value">{stats.vieScolaire.total}</div>
                  <div className="stat-card-subtitle">Événements organisés</div>
                  <div className="stat-card-trend">
                    <Activity size={14} />
                    {stats.vieScolaire.upcomingEvents.length} à venir
                  </div>
                </div>
                <div className="stat-card-icon">
                  <Calendar />
                </div>
              </div>
            </div>

            <div className="stat-card purple">
              <div className="stat-card-content">
                <div className="stat-card-info">
                  <div className="stat-card-title">Messages Reçus</div>
                  <div className="stat-card-value">{stats.messages.total}</div>
                  <div className="stat-card-subtitle">Communications</div>
                  <div className="stat-card-trend">
                    <AlertTriangle size={14} />
                    {stats.messages.unread} non lus
                  </div>
                </div>
                <div className="stat-card-icon">
                  <MessageSquare />
                </div>
              </div>
            </div>

            <div className="stat-card yellow">
              <div className="stat-card-content">
                <div className="stat-card-info">
                  <div className="stat-card-title">Engagement Global</div>
                  <div className="stat-card-value">
                    {((stats.actualites.total + stats.vieScolaire.total + stats.messages.total) / 3).toFixed(0)}
                  </div>
                  <div className="stat-card-subtitle">Score d'activité</div>
                  <div className="stat-card-trend">
                    <Zap size={14} />
                    Très actif
                  </div>
                </div>
                <div className="stat-card-icon">
                  <Target />
                </div>
              </div>
            </div>
          </div>

          {/* Résumé des sections */}
          <div className="summary-card">
            <h2 className="summary-header">Répartition par Sections</h2>
            <div className="summary-grid">
              <div className="summary-item blue">
                <div className="summary-item-label">Actualités par Catégorie</div>
                <div className="summary-item-value">
                  {Object.keys(stats.actualites.categories).length}
                </div>
                <div className="summary-item-detail">
                  Catégories actives: {Object.keys(stats.actualites.categories).join(', ')}
                </div>
              </div>
              
              <div className="summary-item green">
                <div className="summary-item-label">Activités par Cycle</div>
                <div className="summary-item-value">
                  {Object.keys(stats.vieScolaire.byCycle).length}
                </div>
                <div className="summary-item-detail">
                  Cycles couverts: {Object.keys(stats.vieScolaire.byCycle).join(', ')}
                </div>
              </div>
              
              <div className="summary-item purple">
                <div className="summary-item-label">Messages par Sujet</div>
                <div className="summary-item-value">
                  {Object.keys(stats.messages.bySubject).length}
                </div>
                <div className="summary-item-detail">
                  Sujets traités: {Object.keys(stats.messages.bySubject).join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="charts-grid">
            {/* Graphique des actualités */}
            <div className="chart-card">
              <div className="chart-header">
                <BarChart3 />
                <h3>Actualités par Catégorie</h3>
              </div>
              {Object.keys(stats.actualites.categories).length > 0 ? (
                <div style={{ height: '300px', padding: '20px' }}>
                  {Object.entries(stats.actualites.categories).map(([category, count], index) => (
                    <div key={category} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '15px',
                      fontSize: '14px'
                    }}>
                      <div style={{ 
                        width: '120px', 
                        textTransform: 'capitalize',
                        color: '#374151',
                        fontWeight: '600'
                      }}>
                        {category}
                      </div>
                      <div style={{ 
                        flex: 1, 
                        height: '25px', 
                        backgroundColor: '#f3f4f6', 
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginRight: '10px'
                      }}>
                        <div style={{ 
                          width: `${(count / Math.max(...Object.values(stats.actualites.categories))) * 100}%`,
                          height: '100%',
                          backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'][index % 5],
                          borderRadius: '12px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <div style={{ 
                        minWidth: '30px', 
                        textAlign: 'right',
                        fontWeight: '700',
                        color: '#1F2937'
                      }}>
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chart-empty">
                  <FileText />
                  <h4>Aucune actualité</h4>
                  <p>Les données apparaîtront ici une fois les actualités créées</p>
                </div>
              )}
            </div>

            {/* Graphique des activités scolaires */}
            <div className="chart-card">
              <div className="chart-header">
                <PieChart />
                <h3>Activités par Cycle</h3>
              </div>
              {Object.keys(stats.vieScolaire.byCycle).length > 0 ? (
                <div style={{ height: '300px', padding: '20px' }}>
                  {Object.entries(stats.vieScolaire.byCycle).map(([cycle, count], index) => (
                    <div key={cycle} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '15px',
                      fontSize: '14px'
                    }}>
                      <div style={{ 
                        width: '120px', 
                        textTransform: 'capitalize',
                        color: '#374151',
                        fontWeight: '600'
                      }}>
                        {cycle}
                      </div>
                      <div style={{ 
                        flex: 1, 
                        height: '25px', 
                        backgroundColor: '#f3f4f6', 
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginRight: '10px'
                      }}>
                        <div style={{ 
                          width: `${(count / Math.max(...Object.values(stats.vieScolaire.byCycle))) * 100}%`,
                          height: '100%',
                          backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'][index % 5],
                          borderRadius: '12px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <div style={{ 
                        minWidth: '30px', 
                        textAlign: 'right',
                        fontWeight: '700',
                        color: '#1F2937'
                      }}>
                        {count}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chart-empty">
                  <Calendar />
                  <h4>Aucune activité</h4>
                  <p>Les données apparaîtront ici une fois les activités créées</p>
                </div>
              )}
            </div>
          </div>

          {/* Activités récentes */}
          <div className="charts-grid">
            {/* Actualités récentes */}
            <div className="chart-card">
              <div className="chart-header">
                <FileText />
                <h3>Actualités Récentes</h3>
              </div>
              {stats.actualites.recentActivity.length > 0 ? (
                <div style={{ padding: '10px 0' }}>
                  {stats.actualites.recentActivity.map((article, index) => (
                    <div key={article._id || index} style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      ':last-child': { borderBottom: 'none' }
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#1f2937',
                          marginBottom: '4px',
                          fontSize: '14px'
                        }}>
                          {article.title}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ 
                            padding: '2px 6px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '4px',
                            textTransform: 'capitalize'
                          }}>
                            {article.category}
                          </span>
                          <span>{article.author}</span>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#9ca3af',
                        textAlign: 'right'
                      }}>
                        {formatDate(article.createdAt)}
                        {article.isPinned && (
                          <div style={{ color: '#ef4444', fontWeight: '600' }}>📌 Épinglé</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chart-empty">
                  <FileText />
                  <h4>Aucune actualité récente</h4>
                  <p>Les actualités récentes apparaîtront ici</p>
                </div>
              )}
            </div>

            {/* Prochains événements */}
            <div className="chart-card">
              <div className="chart-header">
                <Calendar />
                <h3>Prochains Événements</h3>
              </div>
              {stats.vieScolaire.upcomingEvents.length > 0 ? (
                <div style={{ padding: '10px 0' }}>
                  {stats.vieScolaire.upcomingEvents.map((event, index) => (
                    <div key={event._id || index} style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#1f2937',
                          marginBottom: '4px',
                          fontSize: '14px'
                        }}>
                          {event.title}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ 
                            padding: '2px 6px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            borderRadius: '4px',
                            textTransform: 'capitalize'
                          }}>
                            {event.category}
                          </span>
                          <span>{event.cycle}</span>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#9ca3af',
                        textAlign: 'right'
                      }}>
                        <div style={{ color: '#059669', fontWeight: '600' }}>
                          {formatDate(event.date)}
                        </div>
                        {event.time && (
                          <div>{event.time}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chart-empty">
                  <Calendar />
                  <h4>Aucun événement à venir</h4>
                  <p>Les prochains événements apparaîtront ici</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages récents */}
          {stats.messages.recent.length > 0 && (
            <div className="chart-card">
              <div className="chart-header">
                <MessageSquare />
                <h3>Messages Récents</h3>
              </div>
              <div style={{ padding: '10px 0' }}>
                {stats.messages.recent.map((message, index) => (
                  <div key={message._id || index} style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#1f2937',
                        marginBottom: '4px',
                        fontSize: '14px'
                      }}>
                        {message.firstName} {message.lastName}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#6b7280',
                        marginBottom: '6px'
                      }}>
                        {message.subject}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#9ca3af',
                        lineHeight: '1.4'
                      }}>
                        {message.message.substring(0, 80)}...
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#9ca3af',
                      textAlign: 'right'
                    }}>
                      {formatDate(message.date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;