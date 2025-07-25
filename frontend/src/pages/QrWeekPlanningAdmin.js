import React, { useState, useEffect } from 'react';
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
      .map(cell => ({
        ...cell,
        periode: transformer(cell.periode),
      }));

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

  // ✅ دالة لتوليد QR Code ليوم واحد فقط
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

      if (!data.qrSessions || !Array.isArray(data.qrSessions)) {
        throw new Error('Invalid response format from server');
      }

      const qrData = {
        date: dayDate,
        jour: selectedDay,
        type: 'qr-day',
        qrSessions: data.qrSessions.map(session => ({
          date: dayDate,
          cours: session.cours,
          periode: session.periode,
          professeur: session.professeur,
          matiere: session.matiere,
          jour: selectedDay
        }))
      };

      const qrText = JSON.stringify(qrData);
      console.log('✅ QR JSON Content (Day):', qrText);
      setQrJsonContent(qrText);

      if (qrText.includes('<') || qrText.includes('<!DOCTYPE')) {
        throw new Error('Server returned HTML instead of JSON data');
      }

      const qrImageUrl = await QRCode.toDataURL(qrText, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrImage(qrImageUrl);
      setMessage(`✅ QR Code pour ${selectedDay} (${dayDate}) généré avec succès`);

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
        setMessage('✅ QR Code content is valid JSON!');
      } else {
        setMessage('❌ No QR content to test');
      }
    } catch (err) {
      console.error('❌ Failed to parse QR content:', err);
      setMessage(`❌ QR content is not valid JSON: ${err.message}`);
    }
  };

  const getPreviewDates = () => {
    return jours.map(jour => ({
      jour,
      date: getDateFromJourWithReference(jour, qrDate)
    }));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">📋 Planifier tous les cours de la semaine</h2>

      {coursList.map(cours => (
        <div key={cours._id} className="mb-8 bg-white shadow-lg rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-blue-600">📘 {cours.nom}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Jour / Heure</th>
                  {horairesParJour.map(h => (
                    <th key={h.periode} className="border border-gray-300 px-4 py-2">{h.heure}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jours.map(jour => (
                  <tr key={jour} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium capitalize">{jour}</td>
                    {horairesParJour.map(h => {
                      const key = `${cours.nom}_${jour}_${h.periode}`;
                      const cell = allPlannings[key] || {};
                      return (
                        <td key={key} className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            placeholder="Matière"
                            value={cell.matiere || ''}
                            onChange={e => handleChangeCell(cours.nom, jour, h.periode, 'matiere', e.target.value)}
                            className="w-full border border-gray-300 p-2 mb-2 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={cell.professeur || ''}
                            onChange={e => handleChangeCell(cours.nom, jour, h.periode, 'professeur', e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
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
      <div className="mt-8 mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-lg mb-4 text-blue-800">📅 Configuration QR Code</h3>
        
        {/* اختيار التاريخ المرجعي */}
        <div className="flex items-center gap-4 mb-4">
          <label className="font-medium text-sm">التاريخ المرجعي:</label>
          <input
            type="date"
            value={qrDate}
            onChange={e => setQrDate(e.target.value)}
            className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600 font-medium">
            ({getJourFromDate(qrDate)})
          </span>
        </div>

        {/* ✅ اختيار اليوم */}
        <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-lg border border-blue-100">
          <label className="font-medium text-sm">اختر اليوم:</label>
          <select
            value={selectedDay}
            onChange={e => setSelectedDay(e.target.value)}
            className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- اختر يوم --</option>
            {jours.map(jour => (
              <option key={jour} value={jour} className="capitalize">
                {jour} ({getDateFromJourWithReference(jour, qrDate)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ أزرار التحكم */}
      <div className="flex flex-wrap gap-4 mt-8">
        <button 
          onClick={handleSubmit} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          ✅ Confirmer tous les plannings
        </button>
        
        <button 
          onClick={handleGenerateQrCode} 
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          📅 Générer QR Jour
        </button>
        
        {qrJsonContent && (
          <button 
            onClick={testQrReading} 
            className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            🔍 Test QR Reading
          </button>
        )}
      </div>

      {/* ✅ عرض QR Code والمحتوى */}
      {qrImage && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">
            📌 QR pour {selectedDay} ({getDateFromJourWithReference(selectedDay, qrDate)})
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Image */}
            <div className="text-center">
              <img src={qrImage} alt="QR Code" className="w-64 h-64 mx-auto border border-gray-300 rounded-lg" />
              <a 
                href={qrImage} 
                download={`qr-${selectedDay}-${getDateFromJourWithReference(selectedDay, qrDate)}.png`} 
                className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm underline font-medium"
              >
                📥 Télécharger QR-{selectedDay}-{getDateFromJourWithReference(selectedDay, qrDate)}.png
              </a>
            </div>
            
            {/* JSON Content Preview */}
            <div>
              <h4 className="font-medium text-sm mb-2 text-gray-700">QR Content (JSON):</h4>
              <textarea
                value={qrJsonContent}
                readOnly
                className="w-full h-64 p-3 text-xs font-mono bg-white border border-gray-300 rounded resize-none"
                placeholder="QR JSON content will appear here..."
              />
              <p className="text-xs text-gray-500 mt-2">
                ✅ Ce JSON sera inclus dans le QR Code. Vérifiez qu'il ne contient pas de HTML.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ رسائل التحديث */}
      {message && (
        <div className={`mt-6 p-4 rounded-lg font-medium ${
          message.includes('✅') ? 'bg-green-100 text-green-800 border border-green-200' : 
          message.includes('❌') ? 'bg-red-100 text-red-800 border border-red-200' : 
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {message}
        </div>
      )}
      
      {/* ✅ تعليمات للمطور المحدثة */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">🔧 تعليمات للمطور:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>QR Day:</strong> يستخدم <code>/api/admin/qr-day-generate</code> لتوليد يوم واحد</li>
          <li>• تأكد من أن الـ backend endpoint هو <code>/api/etudiant/qr-presence</code> وليس <code>/api/etudiant/qr-presencec</code></li>
          <li>• اختبر QR Content قبل الإرسال باستخدام زر "Test QR Reading"</li>
          <li>• تأكد من أن JSON لا يحتوي على HTML أو روابط</li>
          <li>• استخدم <code>JSON.stringify()</code> مباشرة على البيانات</li>
        </ul>
      </div>
    </div>
  );
}

export default QrWeekPlanningAdmin;