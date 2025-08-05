import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Sidebar from '../components/sidebaretudiant'; // Composant sidebar pour professeu

import { 
  QrCode, 
  Camera, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  BookOpen, 
  Calendar,
  Info,
  Settings,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '30px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderRadius: '20px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  },
  subtitle: {
    fontSize: '16px',
    opacity: '0.9',
    marginTop: '10px',
    fontWeight: '400'
  },
  scannerSection: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  scannerTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  qrReader: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    border: '3px solid #3b82f6',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '30px'
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0'
  },
  infoCardBlue: {
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    border: '1px solid #93c5fd'
  },
  infoCardYellow: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '1px solid #f59e0b'
  },
  infoCardGray: {
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    border: '1px solid #9ca3af'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  periodInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  periodItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '500'
  },
  periodMorning: {
    borderLeft: '4px solid #f59e0b',
    backgroundColor: '#fffbeb'
  },
  periodEvening: {
    borderLeft: '4px solid #3b82f6',
    backgroundColor: '#eff6ff'
  },
  debugList: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#4b5563',
    listStyle: 'none',
    padding: '0'
  },
  debugItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '8px',
    padding: '8px 12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  codeBlock: {
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    fontSize: '12px',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    overflow: 'auto',
    lineHeight: '1.5',
    color: '#374151',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  statusMessage: {
    padding: '16px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px'
  },
  successMessage: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0'
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5'
  },
  currentTime: {
    textAlign: 'center',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px solid #3b82f6',
    marginBottom: '20px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937'
  },
  // Responsive styles
  '@media (max-width: 768px)': {
    container: {
      padding: '15px'
    },
    title: {
      fontSize: '24px'
    },
    scannerSection: {
      padding: '20px'
    },
    infoGrid: {
      gridTemplateColumns: '1fr'
    }
  }
};

function QREtudiant() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusMessage, setStatusMessage] = useState('');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get current period
  const getCurrentPeriod = () => {
    const hour = currentTime.getHours();
    if (hour >= 8 && hour < 12) {
      return 'matin';
    } else if (hour >= 14 && hour < 18) {
      return 'soir';
    }
    return hour < 12 ? 'matin' : 'soir';
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { 
      fps: 10, 
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0
    }, false);

    scanner.render(
      async (decodedText, decodedResult) => {
        try {
          console.log("🔍 DecodedText:", decodedText);
          console.log("📦 Length:", decodedText.length);
          console.log("🎯 First 100 chars:", decodedText.substring(0, 100));
          
          let qrData;
          try {
            qrData = JSON.parse(decodedText);
          } catch (parseError) {
            console.error("⚠️ Échec du parsing JSON:", parseError);
            console.error("📄 Raw text:", decodedText);
            setStatusMessage({ type: 'error', text: 'QR invalide ❌ (JSON malformé)' });
            return;
          }

          console.log("✅ QR Data parsed:", qrData);

          if (!qrData.qrSessions || !Array.isArray(qrData.qrSessions)) {
            console.error("❌ qrSessions missing or not array:", qrData);
            setStatusMessage({ type: 'error', text: 'QR invalide ❌ (structure incorrecte)' });
            return;
          }

          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const heureActuelle = now.toTimeString().slice(0, 5);
          const hour = now.getHours();
          
          let periode = '';
          if (hour >= 8 && hour < 12) {
            periode = 'matin';
          } else if (hour >= 14 && hour < 18) {
            periode = 'soir';
          } else {
            periode = hour < 12 ? 'matin' : 'soir';
          }

          console.log(`🕐 Current time: ${heureActuelle} (${hour}h), période: ${periode}, date: ${todayStr}`);

          const validSessions = qrData.qrSessions.filter(sess =>
            sess.date === todayStr && sess.periode === periode
          );

          console.log("🔍 Available sessions for today:", validSessions);

          if (validSessions.length === 0) {
            console.warn(`❌ No sessions found for ${todayStr} - ${periode}`);
            setStatusMessage({ 
              type: 'error', 
              text: `Aucune session trouvée pour aujourd'hui (${todayStr}) et période ${periode}` 
            });
            return;
          }

          let currentSession = null;
          for (const session of validSessions) {
            if (session.horaire) {
              const [startTime, endTime] = session.horaire.split('-');
              if (heureActuelle >= startTime && heureActuelle <= endTime) {
                currentSession = session;
                break;
              }
            }
          }

          if (!currentSession && validSessions.length > 0) {
            currentSession = validSessions[0];
            console.warn("⚠️ No session matches current time, using first available session");
          }

          if (!currentSession) {
            console.warn(`❌ No valid session found`);
            setStatusMessage({ type: 'error', text: 'Aucune session valide trouvée pour cette période' });
            return;
          }

          console.log("🎯 Selected session:", currentSession);

          if (!currentSession.cours || !currentSession.horaire) {
            console.error("❌ Session incomplete - missing cours or horaire:", currentSession);
            setStatusMessage({ type: 'error', text: 'QR invalide ❌ (données de session incomplètes)' });
            return;
          }

          const token = localStorage.getItem('token');
          if (!token) {
            setStatusMessage({ type: 'error', text: 'Token manquant - veuillez vous reconnecter' });
            return;
          }

          console.log("📤 Sending presence data:", {
            date: currentSession.date,
            periode: currentSession.periode,
            cours: currentSession.cours,
            horaire: currentSession.horaire
          });

          const res = await fetch('http://localhost:5000/api/etudiant/qr-presence', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              date: currentSession.date,
              periode: currentSession.periode,
              cours: currentSession.cours,
              horaire: currentSession.horaire
            })
          });

          const result = await res.json();
          console.log("📥 Server response:", result);
          
          if (res.ok) {
            setStatusMessage({ type: 'success', text: '✅ ' + result.message });
            scanner.clear();
          } else {
            setStatusMessage({ type: 'error', text: '❌ ' + result.message });
          }
        } catch (error) {
          console.error("🚨 Error complete:", error);
          console.error("📄 Raw decodedText:", decodedText);
          setStatusMessage({ type: 'error', text: 'QR invalide ou format inconnu ❌' });
        }
      },
      error => {
        console.warn("Erreur scan:", error);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div style={styles.container}>
              <Sidebar onLogout={handleLogout} />

      <div style={styles.header}>
        <h2 style={styles.title}>
          <User size={32} />
          Scanner QR Code
          <QrCode size={32} />
        </h2>
        <p style={styles.subtitle}>
          Scannez le QR Code généré par l'administration pour enregistrer votre présence
        </p>
      </div>

      <div style={styles.currentTime}>
        <Clock size={20} style={{ display: 'inline', marginRight: '10px' }} />
        {formatDate(currentTime)} - {formatTime(currentTime)}
        <br />
        <span style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px', display: 'inline-block' }}>
          Période actuelle: <strong>{getCurrentPeriod()}</strong>
        </span>
      </div>

      <div style={styles.scannerSection}>
        <h3 style={styles.scannerTitle}>
          <Camera size={24} />
          Scanner de QR Code
        </h3>
        <div style={{ textAlign: 'center' }}>
          <div id="qr-reader" style={styles.qrReader}></div>
        </div>
      </div>

      {statusMessage && (
        <div style={{
          ...styles.statusMessage,
          ...(statusMessage.type === 'success' ? styles.successMessage : styles.errorMessage)
        }}>
          {statusMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {statusMessage.text}
        </div>
      )}

      <div style={styles.infoGrid}>
        <div style={{ ...styles.infoCard, ...styles.infoCardBlue }}>
          <h3 style={styles.cardTitle}>
            <Clock size={20} />
            Horaires des Périodes
          </h3>
          <div style={styles.periodInfo}>
            <div style={{ ...styles.periodItem, ...styles.periodMorning }}>
              <Sun size={18} style={{ color: '#f59e0b' }} />
              <div>
                <strong>Matin:</strong> 08:00 - 12:00
              </div>
            </div>
            <div style={{ ...styles.periodItem, ...styles.periodEvening }}>
              <Moon size={18} style={{ color: '#3b82f6' }} />
              <div>
                <strong>Soir:</strong> 14:00 - 18:00
              </div>
            </div>
          </div>
          <p style={{ 
            marginTop: '16px', 
            fontSize: '14px', 
            color: '#1e40af', 
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Zap size={16} />
            Le système vérifie automatiquement l'heure actuelle
          </p>
        </div>

        <div style={{ ...styles.infoCard, ...styles.infoCardGray }}>
          <h3 style={styles.cardTitle}>
            <Settings size={20} />
            Instructions Debug
          </h3>
          <ul style={styles.debugList}>
            <li style={styles.debugItem}>
              <QrCode size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              Format QR attendu: JSON avec qrSessions[]
            </li>
            <li style={styles.debugItem}>
              <BookOpen size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              Chaque session: date, periode, cours, horaire
            </li>
            <li style={styles.debugItem}>
              <Clock size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              Vérification horaire exacte (ex: 08:00-10:00)
            </li>
            <li style={styles.debugItem}>
              <Info size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              Consultez la Console (F12) pour plus de détails
            </li>
          </ul>
        </div>

        <div style={{ ...styles.infoCard, ...styles.infoCardYellow }}>
          <h3 style={styles.cardTitle}>
            <Calendar size={20} />
            Format QR Attendu
          </h3>
          <pre style={styles.codeBlock}>
{`{
  "qrSessions": [
    {
      "date": "2025-07-26",
      "periode": "matin",
      "cours": "L1",
      "horaire": "08:00-10:00"
    }
  ]
}`}
          </pre>
          <p style={{ 
            marginTop: '12px', 
            fontSize: '12px', 
            color: '#92400e', 
            fontStyle: 'italic' 
          }}>
            💡 Scannez le QR pendant la période et l'horaire spécifiés
          </p>
        </div>
      </div>
    </div>
  );
}

export default QREtudiant;