import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QREtudiant() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);

    scanner.render(
      async (decodedText, decodedResult) => {
        try {
          // ✅ إضافة تسجيل للتحقق من محتوى QR
          console.log("🔍 DecodedText:", decodedText);
          console.log("📦 Length:", decodedText.length);
          console.log("🎯 First 100 chars:", decodedText.substring(0, 100));
          
          let qrData;
          try {
            qrData = JSON.parse(decodedText);
          } catch (parseError) {
            console.error("⚠️ Échec du parsing JSON:", parseError);
            console.error("📄 Raw text:", decodedText);
            alert("QR invalide ❌ (JSON malformé)");
            return;
          }

          console.log("✅ QR Data parsed:", qrData);

          if (!qrData.qrSessions || !Array.isArray(qrData.qrSessions)) {
            console.error("❌ qrSessions missing or not array:", qrData);
            alert("QR invalide ❌ (structure incorrecte)");
            return;
          }

          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const hour = now.getHours();
          
          // ✅ تحديد الفترة بالنظام الجديد (matin/soir فقط)
          let periode = '';
          if (hour >= 8 && hour < 12) {
            periode = 'matin'; // ✅ matin1 و matin2 أصبحا matin
          } else if (hour >= 14 && hour < 18) {
            periode = 'soir';  // ✅ soir1 و soir2 أصبحا soir
          } else {
            // ✅ fallback للأوقات خارج النطاق
            periode = hour < 12 ? 'matin' : 'soir';
          }

          console.log(`🕐 Current time: ${hour}h, période: ${periode}, date: ${todayStr}`);

          // ✅ البحث عن الجلسة بالنظام الجديد
          const found = qrData.qrSessions.find(sess =>
            sess.date === todayStr && sess.periode === periode
          );

          console.log("🔍 Available sessions:", qrData.qrSessions);
          console.log("🎯 Found session:", found);

          if (!found) {
            console.warn(`❌ No session found for ${todayStr} - ${periode}`);
            alert(`Aucune session trouvée pour aujourd'hui (${todayStr}) et période ${periode}`);
            return;
          }

          const token = localStorage.getItem('token');
          if (!token) {
            alert("❌ Token manquant - veuillez vous reconnecter");
            return;
          }

          console.log("📤 Sending presence data:", {
            date: found.date,
            periode: found.periode,
            cours: found.cours
          });

          // ✅ إرسال البيانات للباكند
          const res = await fetch('http://localhost:5000/api/etudiant/qr-presence', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              date: found.date,
              periode: found.periode, // ✅ سيكون matin أو soir
              cours: found.cours
            })
          });

          const result = await res.json();
          console.log("📥 Server response:", result);
          
          if (res.ok) {
            alert('✅ ' + result.message);
            scanner.clear(); // توقف المسح بعد النجاح
          } else {
            alert('❌ ' + result.message);
          }
        } catch (error) {
          console.error("🚨 Error complete:", error);
          console.error("📄 Raw decodedText:", decodedText);
          alert('QR invalide ou format inconnu ❌');
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

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">🎓 Scanner le QR de la semaine</h2>
      <div id="qr-reader" style={{ width: "100%" }}></div>
      
      {/* ✅ معلومات إضافية للطالب */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">📋 معلومات الفترات:</h3>
        <div className="space-y-1">
          <div><strong>الصباح (matin):</strong> 08:00 - 12:00</div>
          <div><strong>المساء (soir):</strong> 14:00 - 18:00</div>
        </div>
        <p className="mt-2 text-gray-600">
          💡 امسح QR Code خلال الفترة المحددة لتسجيل حضورك
        </p>
      </div>

      {/* ✅ معلومات Debug للمطور */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
        <h4 className="font-bold mb-2">🔧 Debug Info:</h4>
        <div className="space-y-1 text-gray-600">
          <div>• Format QR attendu: JSON avec qrSessions[]</div>
          <div>• Vérifiez la Console (F12) pour les détails</div>
          <div>• Token requis dans localStorage</div>
        </div>
      </div>
    </div>
  );
}

export default QREtudiant;