import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, QrCode, Search, Download, Users, BookOpen, Clock, Settings, Trash2, Edit } from 'lucide-react';
import QRCode from 'qrcode';

function QrWeekPlanningAdmin() {
  const [coursList, setCoursList] = useState([]);
  const [allPlannings, setAllPlannings] = useState({});
  const [professeursParCours, setProfesseursParCours] = useState({});
  const [message, setMessage] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [qrDate, setQrDate] = useState(new Date().toISOString().split('T')[0]);
  // ✅ إضافة state لعرض محتوى JSON للتحقق
  const [qrJsonContent, setQrJsonContent] = useState('');
  // ✅ إضافة state للتحكم في اليوم المختار
  const [selectedDay, setSelectedDay] = useState('');
  // ✅ Nouveaux states pour les fonctionnalités ajoutées
  const [daySessionsData, setDaySessionsData] = useState([]);
  const [showDaySessions, setShowDaySessions] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const horairesParJour = [
    { heure: '08:00-10:00', periode: 'matin1' },
    { heure: '10:00-12:00', periode: 'matin2' },
    { heure: '14:00-16:00', periode: 'soir1' },
    { heure: '16:00-18:00', periode: 'soir2' }
  ];

  const getDateFromJourWithReference = (jour, referenceDate) => {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const refDate = new Date(referenceDate);
    const referenceJourIndex = refDate.getDay();
    const targetIndex = jours.indexOf(jour.toLowerCase());
    
    let diff = targetIndex - referenceJourIndex;
    
    const targetDate = new Date(refDate);
    targetDate.setDate(refDate.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  };

  const transformer = (periode) => {
    if (periode.startsWith('matin')) return 'matin';
    if (periode.startsWith('soir')) return 'soir';
    return periode;
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/cours', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(async data => {
        setCoursList(data);
        const profData = {};
        for (const cours of data) {
          const res = await fetch(`http://localhost:5000/api/admin/professeurs-par-cours/${cours.nom}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const profs = await res.json();
          profData[cours.nom] = profs;
        }
        setProfesseursParCours(profData);
      });
  }, []);

  const handleChangeCell = (coursNom, jour, periode, field, value) => {
    setAllPlannings(prev => {
      const key = `${coursNom}_${jour}_${periode}`;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          [field]: value,
          jour,
          periode,
          cours: coursNom
        }
      };
    });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const payload = Object.values(allPlannings)
      .filter(cell => cell.professeur && cell.matiere && cell.cours)
 .map(cell => {
  const horaireObj = horairesParJour.find(h => h.periode === cell.periode);
  return {
    ...cell,
    periode: cell.periode.startsWith('matin') ? 'matin' : 'soir', // pour le backend
    horaire: horaireObj?.heure || '' // obligé d'avoir ce champ
  };
});


    try {
      const res = await fetch('http://localhost:5000/api/admin/qr-week-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planning: payload })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('✅ Planning confirmé avec succès');
    } catch (err) {
      console.error('❌ Erreur bulk qr-week:', err);
      setMessage('❌ Erreur serveur lors de lenregistrement du planning');
    }
  };

  const getJourFromDate = (dateString) => {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const date = new Date(dateString);
    return jours[date.getDay()];
  };

  // ✅ دالة لتوليد QR Code ليوم واحد فقط - مُحدثة للتوافق مع الـ backend
  const handleGenerateQrCode = async () => {
    if (!selectedDay) {
      setMessage('❌ Veuillez sélectionner un jour');
      return;
    }

    const token = localStorage.getItem('token');
    const dayDate = getDateFromJourWithReference(selectedDay, qrDate);
    
    try {
      const res = await fetch('http://localhost:5000/api/admin/qr-day-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: dayDate })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // ✅ التحقق من صحة الرد من الـ backend
      if (!data.qrSessions || !Array.isArray(data.qrSessions)) {
        throw new Error('Invalid response format from server');
      }

      // ✅ تكوين البيانات بنفس الشكل الذي يرسله الـ backend
      const qrData = {
        type: data.type, // 'qr-day'
        date: data.date,
        jour: data.jour,
        qrSessions: data.qrSessions // البيانات كما هي من الـ backend
      };

      const qrText = JSON.stringify(qrData);
      console.log('✅ QR JSON Content (Day):', qrText);
      setQrJsonContent(qrText);

      // ✅ التحقق من عدم وجود HTML في الرد
      if (qrText.includes('<') || qrText.includes('<!DOCTYPE')) {
        throw new Error('Server returned HTML instead of JSON data');
      }

      // ✅ توليد QR Code
      const qrImageUrl = await QRCode.toDataURL(qrText, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrImage(qrImageUrl);
      setMessage(`✅ QR Code pour ${selectedDay} (${dayDate}) généré avec succès - ${data.qrSessions.length} sessions`);

    } catch (err) {
      console.error('❌ Erreur génération QR day:', err);
      setMessage(`❌ Erreur lors de la génération du QR: ${err.message}`);
      if (err.message.includes('HTML')) {
        setMessage('❌ Le serveur retourne du HTML au lieu de JSON. Vérifiez l\'endpoint API.');
      }
    }
  };

  // ✅ دالة لاختبار قراءة QR Code
  const testQrReading = () => {
    try {
      if (qrJsonContent) {
        const parsedData = JSON.parse(qrJsonContent);
        console.log('✅ QR Data parsed successfully:', parsedData);
        
        // ✅ التحقق من البنية المتوقعة
        if (parsedData.type === 'qr-day' && parsedData.qrSessions) {
          setMessage(`✅ QR Code content is valid! Found ${parsedData.qrSessions.length} sessions for ${parsedData.jour} (${parsedData.date})`);
        } else {
          setMessage('⚠️ QR content format may be incorrect');
        }
      } else {
        setMessage('❌ No QR content to test');
      }
    } catch (err) {
      console.error('❌ Failed to parse QR content:', err);
      setMessage(`❌ QR content is not valid JSON: ${err.message}`);
    }
  };

  // ✅ دالة حذف QR Code
  const handleDeleteQrCode = async () => {
    if (!selectedDay) {
      setMessage('❌ Veuillez choisir un jour pour supprimer le QR Code associé');
      return;
    }

    const dayDate = getDateFromJourWithReference(selectedDay, qrDate);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/admin/qr-day-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ date: dayDate })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(`✅ QR Code et sessions du ${selectedDay} (${dayDate}) ont été supprimés`);
      setQrImage(null);
      setQrJsonContent('');
    } catch (err) {
      console.error('❌ Erreur suppression QR:', err);
      setMessage(`❌ Échec suppression QR: ${err.message}`);
    }
  };

  // ✅ NOUVELLE FONCTION: Récupérer les sessions d'un jour
  const handleGetDaySessions = async () => {
    if (!selectedDay) {
      setMessage('❌ Veuillez sélectionner un jour');
      return;
    }

    const dayDate = getDateFromJourWithReference(selectedDay, qrDate);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/admin/qr-day-sessions?date=${dayDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setDaySessionsData(data.qrSessions);
      setShowDaySessions(true);
      setMessage(`✅ ${data.qrSessions.length} sessions trouvées pour ${selectedDay} (${dayDate})`);
    } catch (err) {
      console.error('❌ Erreur récupération sessions:', err);
      setMessage(`❌ Erreur lors de la récupération des sessions: ${err.message}`);
    }
  };

  // ✅ NOUVELLE FONCTION: Modifier une session individuelle
  const handleUpdateSession = async (sessionId, updatedData) => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/admin/qr-session/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage('✅ Session modifiée avec succès');
      setEditingSession(null);
      // Rafraîchir la liste des sessions
      handleGetDaySessions();
    } catch (err) {
      console.error('❌ Erreur modification session:', err);
      setMessage(`❌ Erreur lors de la modification: ${err.message}`);
    }
  };

  // ✅ NOUVELLE FONCTION: Supprimer une session individuelle
  const handleDeleteSession = async (sessionId) => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/admin/qr-session/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage('✅ Session supprimée avec succès');
      // Rafraîchir la liste des sessions
      handleGetDaySessions();
    } catch (err) {
      console.error('❌ Erreur suppression session:', err);
      setMessage(`❌ Erreur lors de la suppression: ${err.message}`);
    }
  };

  const getPreviewDates = () => {
    return jours.map(jour => ({
      jour,
      date: getDateFromJourWithReference(jour, qrDate)
    }));
  };

  return (
    <>
      <style jsx>{`
        .container {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .title {
          font-size: 1.875rem;
          font-weight: bold;
          margin-bottom: 2rem;
          text-align: center;
          color: #1f2937;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .course-card {
          margin-bottom: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
        }

        .course-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #2563eb;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #d1d5db;
        }

        .planning-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .table-header {
          background-color: #f9fafb;
        }

        .table-header th {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .table-row {
          transition: background-color 0.15s ease;
        }

        .table-row:hover {
          background-color: #f9fafb;
        }

        .table-cell {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          vertical-align: top;
        }

        .day-cell {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
          background-color: #f3f4f6;
          color: #374151;
        }

        .input-field {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.15s ease;
        }

        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .select-field {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          background-color: white;
          transition: all 0.15s ease;
        }

        .select-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .config-section {
          margin-top: 2rem;
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          background-color: #eff6ff;
          border-radius: 12px;
          border: 1px solid #bfdbfe;
        }

        .config-title {
          font-weight: 600;
          font-size: 1.125rem;
          margin-bottom: 1rem;
          color: #1e40af;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .config-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .config-label {
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151;
          min-width: 120px;
        }

        .config-input {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.15s ease;
        }

        .config-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .day-selector {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #bfdbfe;
        }

        .buttons-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.15s ease;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .btn-primary {
          background-color: #4f46e5;
          color: white;
        }

        .btn-primary:hover {
          background-color: #4338ca;
          transform: translateY(-1px);
        }

        .btn-success {
          background-color: #059669;
          color: white;
        }

        .btn-success:hover {
          background-color: #047857;
          transform: translateY(-1px);
        }

        .btn-warning {
          background-color: #f59e0b;
          color: white;
        }

        .btn-warning:hover {
          background-color: #d97706;
          transform: translateY(-1px);
        }

        .btn-danger {
          background-color: #dc2626;
          color: white;
        }

        .btn-danger:hover {
          background-color: #b91c1c;
          transform: translateY(-1px);
        }

        .btn-info {
          background-color: #0ea5e9;
          color: white;
        }

        .btn-info:hover {
          background-color: #0284c7;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background-color: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #4b5563;
          transform: translateY(-1px);
        }

        .btn-small {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
        }

        .qr-section {
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .qr-title {
          font-weight: 600;
          font-size: 1.125rem;
          margin-bottom: 1rem;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .qr-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .qr-image-container {
          text-align: center;
        }

        .qr-image {
          width: 256px;
          height: 256px;
          margin: 0 auto;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          display: block;
        }

        .download-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          color: #2563eb;
          text-decoration: underline;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.15s ease;
        }

        .download-link:hover {
          color: #1d4ed8;
        }

        .json-section h4 {
          font-weight: 500;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          color: #4b5563;
        }

        .json-textarea {
          width: 100%;
          height: 256px;
          padding: 0.75rem;
          font-size: 0.75rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          resize: none;
        }

        .json-note {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .sessions-section {
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: #fef3c7;
          border-radius: 12px;
          border: 1px solid #f59e0b;
        }

        .sessions-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }

        .sessions-table th,
        .sessions-table td {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          text-align: left;
        }

        .sessions-table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }

        .sessions-table tr:hover {
          background-color: #f9fafb;
        }

        .edit-form {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          margin-top: 0.5rem;
        }

        .edit-form input,
        .edit-form select {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }

        .message {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .message-success {
          background-color: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .message-error {
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .message-info {
          background-color: #dbeafe;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }

        .date-info {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        @media (min-width: 768px) {
          .container {
            padding: 2rem;
          }

          .config-row {
            flex-wrap: nowrap;
          }

          .qr-grid {
            grid-template-columns: 1fr 1fr;
          }

          .buttons-container {
            flex-wrap: nowrap;
          }
        }

        @media (max-width: 640px) {
          .title {
            font-size: 1.5rem;
            flex-direction: column;
            gap: 0.25rem;
          }

          .course-card {
            padding: 1rem;
          }

          .config-section {
            padding: 1rem;
          }

          .config-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .config-label {
            min-width: auto;
          }

          .config-input {
            width: 100%;
          }

          .buttons-container {
            flex-direction: column;
          }

          .btn {
            justify-content: center;
          }

          .qr-image {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>

      <div className="container">
        <h2 className="title">
          <BookOpen size={28} />
          Planifier tous les cours de la semaine
        </h2>

        {coursList.map(cours => (
          <div key={cours._id} className="course-card">
            <h3 className="course-title">
              <BookOpen size={20} />
              {cours.nom}
            </h3>
            <div className="table-container">
              <table className="planning-table">
                <thead className="table-header">
                  <tr>
                    <th style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} />
                      Jour / Heure
                    </th>
                    {horairesParJour.map(h => (
                      <th key={h.periode}>{h.heure}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jours.map(jour => (
                    <tr key={jour} className="table-row">
                      <td className="day-cell">{jour}</td>
                      {horairesParJour.map(h => {
                        const key = `${cours.nom}_${jour}_${h.periode}`;
                        const cell = allPlannings[key] || {};
                        return (
                          <td key={key} className="table-cell">
                            <input
                              type="text"
                              placeholder="Matière"
                              value={cell.matiere || ''}
                              onChange={e => handleChangeCell(cours.nom, jour, h.periode, 'matiere', e.target.value)}
                              className="input-field"
                            />
                            <select
                              value={cell.professeur || ''}
                              onChange={e => handleChangeCell(cours.nom, jour, h.periode, 'professeur', e.target.value)}
                              className="select-field"
                            >
                              <option value="">-- Sélectionner Prof --</option>
                              {(professeursParCours[cours.nom] || []).map(p => (
                                <option key={p._id} value={p._id}>{p.nom} ({p.matiere})</option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* ✅ قسم اختيار التاريخ واليوم */}
        <div className="config-section">
          <h3 className="config-title">
            <Settings size={20} />
            Configuration QR Code
          </h3>
          
          {/* اختيار التاريخ المرجعي */}
          <div className="config-row">
            <label className="config-label">Date de référence:</label>
            <input
              type="date"
              value={qrDate}
              onChange={e => setQrDate(e.target.value)}
              className="config-input"
            />
            <span className="date-info">
              ({getJourFromDate(qrDate)})
            </span>
          </div>

          {/* ✅ Sélection du jour */}
          <div className="day-selector">
            <div className="config-row">
              <label className="config-label">Choisir le jour:</label>
              <select
                value={selectedDay}
                onChange={e => setSelectedDay(e.target.value)}
                className="config-input"
                style={{ minWidth: '200px' }}
              >
                <option value="">-- Choisir un jour --</option>
                {jours.map(jour => (
                  <option key={jour} value={jour} style={{ textTransform: 'capitalize' }}>
                    {jour} ({getDateFromJourWithReference(jour, qrDate)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ✅ أزرار التحكم */}
        <div className="buttons-container">
          <button onClick={handleSubmit} className="btn btn-primary">
            <CheckCircle size={18} />
            Confirmer tous les plannings
          </button>
          
          <button onClick={handleGenerateQrCode} className="btn btn-success">
            <Calendar size={18} />
            Générer QR Jour
          </button>
          
          <button onClick={handleGetDaySessions} className="btn btn-info">
            <Users size={18} />
            Voir Sessions du Jour
          </button>
          
          <button onClick={handleDeleteQrCode} className="btn btn-danger">
            <Trash2 size={18} />
            Supprimer QR Jour
          </button>
          
          {qrJsonContent && (
            <button onClick={testQrReading} className="btn btn-warning">
              <Search size={18} />
              Test QR Reading
            </button>
          )}
        </div>

        {/* ✅ Section d'affichage des sessions du jour */}
        {showDaySessions && (
          <div className="sessions-section">
            <h3 className="qr-title">
              <Users size={20} />
              Sessions pour {selectedDay} ({getDateFromJourWithReference(selectedDay, qrDate)})
            </h3>
            
            {daySessionsData.length === 0 ? (
              <p>Aucune session trouvée pour ce jour.</p>
            ) : (
              <table className="sessions-table">
                <thead>
                  <tr>
                    <th>Cours</th>
                    <th>Matière</th>
                    <th>Professeur</th>
                    <th>Période</th>
                    <th>Horaire</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {daySessionsData.map(session => (
                    <tr key={session._id}>
                      <td>{session.cours}</td>
                      <td>{session.matiere}</td>
                      <td>{session.professeur?.nom || 'N/A'}</td>
                      <td>{session.periode}</td>
                      <td>{session.horaire}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setEditingSession(session)}
                            className="btn btn-secondary btn-small"
                          >
                            <Edit size={14} />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session._id)}
                            className="btn btn-danger btn-small"
                          >
                            <Trash2 size={14} />
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={() => setShowDaySessions(false)}
                className="btn btn-secondary"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* ✅ Formulaire d'édition de session */}
        {editingSession && (
          <div className="sessions-section">
            <h3 className="qr-title">
              <Edit size={20} />
              Modifier la session
            </h3>
            
            <div className="edit-form">
              <input
                type="text"
                value={editingSession.matiere}
                onChange={e => setEditingSession({...editingSession, matiere: e.target.value})}
                placeholder="Matière"
              />
              
              <select
                value={editingSession.professeur?._id || editingSession.professeur || ''}
                onChange={e => setEditingSession({...editingSession, professeur: e.target.value})}
              >
                <option value="">-- Sélectionner Professeur --</option>
                {Object.values(professeursParCours).flat().map(prof => (
                  <option key={prof._id} value={prof._id}>
                    {prof.nom} ({prof.matiere})
                  </option>
                ))}
              </select>
              
              <select
                value={editingSession.periode}
                onChange={e => setEditingSession({...editingSession, periode: e.target.value})}
              >
                <option value="">-- Sélectionner Période --</option>
                <option value="matin">Matin</option>
                <option value="soir">Soir</option>
              </select>
              
              <input
                type="text"
                value={editingSession.horaire}
                onChange={e => setEditingSession({...editingSession, horaire: e.target.value})}
                placeholder="Horaire (ex: 08:00-10:00)"
              />
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => handleUpdateSession(editingSession._id, {
                    matiere: editingSession.matiere,
                    professeur: editingSession.professeur,
                    periode: editingSession.periode,
                    horaire: editingSession.horaire
                  })}
                  className="btn btn-success"
                >
                  <CheckCircle size={16} />
                  Sauvegarder
                </button>
                
                <button
                  onClick={() => setEditingSession(null)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ عرض QR Code والمحتوى */}
        {qrImage && (
          <div className="qr-section">
            <h3 className="qr-title">
              <QrCode size={20} />
              QR pour {selectedDay} ({getDateFromJourWithReference(selectedDay, qrDate)})
            </h3>
            
            <div className="qr-grid">
              {/* QR Image */}
              <div className="qr-image-container">
                <img src={qrImage} alt="QR Code" className="qr-image" />
                <a 
                  href={qrImage} 
                  download={`qr-${selectedDay}-${getDateFromJourWithReference(selectedDay, qrDate)}.png`} 
                  className="download-link"
                >
                  <Download size={16} />
                  Télécharger QR-{selectedDay}-{getDateFromJourWithReference(selectedDay, qrDate)}.png
                </a>
              </div>
              
              {/* JSON Content Preview */}
              <div className="json-section">
                <h4>QR Content (JSON):</h4>
                <textarea
                  value={qrJsonContent}
                  readOnly
                  className="json-textarea"
                  placeholder="QR JSON content will appear here..."
                />
                <p className="json-note">
                  ✅ Ce JSON sera inclus dans le QR Code. Format backend compatible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ رسائل التحديث */}
        {message && (
          <div className={`message ${
            message.includes('✅') ? 'message-success' : 
            message.includes('❌') ? 'message-error' : 
            'message-info'
          }`}>
            {message}
          </div>
        )}
      </div>
    </>
  );
}

export default QrWeekPlanningAdmin;