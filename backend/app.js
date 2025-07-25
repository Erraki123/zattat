const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Etudiant = require('./models/etudiantModel');
const multer = require('multer');
const path = require('path');
const uploadMessageFile = require('./middlewares/uploadMessageFile');
const Rappel = require('./models/RappelPaiement');

const Cours = require('./models/coursModel');
const Paiement = require('./models/paiementModel'); // تأكد أنك قمت بإنشاء الملف
const Evenement = require('./models/evenementModel');
const Presence = require('./models/presenceModel');
const Professeur = require('./models/professeurModel'); // تأكد أنك أنشأت هذا الملف
const authAdmin = require('./middlewares/authAdmin');
const authProfesseur = require('./middlewares/authProfesseur');
const authEtudiant = require('./middlewares/authEtudiant');
const Document = require('./models/documentModel');
const Exercice = require('./models/exerciceModel');
const Message = require('./models/messageModel');

const app = express();


// Middlewares
app.use(cors());
app.use(express.json());
app.use('/documents', express.static('documents'));
function genererLienLive(nomCours) {
  const dateStr = new Date().toISOString().split('T')[0]; // ex: 2025-07-07
  const nomSession = `Zettat_${nomCours}_${dateStr}`.replace(/\s+/g, '_');
  return `https://meet.jit.si/${nomSession}`;
}

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connexion à MongoDB réussie'))
.catch((err) => console.error('❌ Erreur MongoDB:', err));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // مجلد الصور
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));
app.get('/api/evenements/public', async (req, res) => {
  try {
    const today = new Date();
    const events = await Evenement.find({
      dateFin: { $gte: today }
    }).sort({ dateDebut: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
const genererToken = (admin) => {
    return jwt.sign({ id: admin._id }, 'jwt_secret_key', { expiresIn: '7d' });
};

// 📁 إعداد رفع الوثائق (PDF, Word)
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'documents/'); // مجلد الوثائق
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + unique + ext);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Seuls les fichiers PDF et Word sont autorisés'));
    }
    cb(null, true);
  }
});
const exerciceUpload = multer({ storage: storage }); // utiliser نفس multer

// ✅ Inscription Admin
app.post('/api/admin/register', async (req, res) => {
    try {
        const { nom, email, motDePasse } = req.body;

        const existe = await Admin.findOne({ email });
        if (existe) return res.status(400).json({ message: 'Email déjà utilisé' });

        const hashed = await bcrypt.hash(motDePasse, 10);
        const admin = new Admin({ nom, email, motDePasse: hashed });
        await admin.save();

        const token = genererToken(admin);
        res.status(201).json({ admin, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🟩 Route: POST /api/documents
// من قبل أستاذ أو مدير
app.post('/api/documents', (req, res, next) => {
  // التحقق من الدور
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token requis' });

  try {
    const decoded = jwt.verify(token, 'jwt_secret_key');
    req.utilisateur = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}, documentUpload.single('fichier'), async (req, res) => {
  try {
    const { titre, cours } = req.body;

    const fichier = `/documents/${req.file.filename}`;

    const doc = new Document({
      titre,
      cours,
      fichier,
      creePar: req.utilisateur.id
    });

    await doc.save();
    res.status(201).json({ message: '📄 Document ajouté', document: doc });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur upload document', error: err.message });
  }
});

// ✅ Login Admin
app.post('/api/login', async (req, res) => {
  const { email, motDePasse } = req.body;

  // ✅ Essayer comme admin
  const admin = await Admin.findOne({ email });
  if (admin && await bcrypt.compare(motDePasse, admin.motDePasse)) {
    const token = jwt.sign({ id: admin._id, role: 'admin' }, 'jwt_secret_key', { expiresIn: '7d' });
    return res.json({ user: admin, token, role: 'admin' });
  }

  // ✅ Essayer comme professeur
const professeur = await Professeur.findOne({ email });
if (professeur && await professeur.comparePassword(motDePasse)) {
  if (!professeur.actif) {
    return res.status(403).json({ message: '⛔️ Votre compte est inactif. Veuillez contacter l’administration.' });
  }

  // ✅ Mise à jour de lastSeen
  professeur.lastSeen = new Date();
  await professeur.save();

  const token = jwt.sign({ id: professeur._id, role: 'prof' }, 'jwt_secret_key', { expiresIn: '7d' });
  return res.json({ user: professeur, token, role: 'prof' });
}



  // ✅ Essayer comme étudiant
const etudiant = await Etudiant.findOne({ email });
if (etudiant && await bcrypt.compare(motDePasse, etudiant.motDePasse)) {
  if (!etudiant.actif) {
    return res.status(403).json({ message: '⛔️ Votre compte est désactivé. Contactez l’administration.' });
  }
etudiant.lastSeen = new Date();
  await etudiant.save();

  const token = jwt.sign({ id: etudiant._id, role: 'etudiant' }, 'jwt_secret_key', { expiresIn: '7d' });
  return res.json({ user: etudiant, token, role: 'etudiant' });
}


  // ❌ Si aucun ne correspond
  return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
});

app.get('/api/etudiant/notifications', authEtudiant, async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiantId);
    const aujourdHui = new Date();

    const paiements = await Paiement.find({ etudiant: req.etudiantId }).sort({ moisDebut: -1 });

    const latestPaiementMap = new Map();

    for (const p of paiements) {
      if (!latestPaiementMap.has(p.cours)) {
        latestPaiementMap.set(p.cours, p);
      }
    }

    const notifications = [];

    for (const [cours, paiement] of latestPaiementMap.entries()) {
      const debut = new Date(paiement.moisDebut);
      const fin = new Date(debut);
      fin.setMonth(fin.getMonth() + Number(paiement.nombreMois));

      const joursRestants = Math.ceil((fin - aujourdHui) / (1000 * 60 * 60 * 24));

      if (joursRestants < 0) {
        notifications.push({
          type: 'paiement_expire',
          cours,
          message: `💰 Le paiement pour le cours "${cours}" a expiré depuis ${Math.abs(joursRestants)} jour(s).`
        });
      } else if (joursRestants <= 2) {
        notifications.push({
          type: 'paiement_bientot',
          cours,
          message: `⏳ Le paiement pour le cours "${cours}" expirera dans ${joursRestants} jour(s).`
        });
      }
    }

    res.json(notifications);
  } catch (err) {
    console.error('Erreur lors du chargement des notifications paiement étudiant:', err);
    res.status(500).json({ error: err.message });
  }
});



// ✅ Route protégée : Dashboard admin
app.get('/api/admin/dashboard', authAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-motDePasse');
    res.json({ message: 'Bienvenue sur le tableau de bord', admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Logout (le client supprime simplement le token)
app.post('/api/admin/logout', (req, res) => {
    res.json({ message: 'Déconnexion réussie' });
});
// Ajouter un étudiant

app.post('/api/etudiants', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const { nomComplet, genre, dateNaissance, telephone, email, motDePasse } = req.body;
    let { cours, actif } = req.body;

    // التحقق من أن البريد الإلكتروني غير مستخدم
    const existe = await Etudiant.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: 'Email déjà utilisé par un autre étudiant' });
    }

    // تأكد أن cours عبارة عن مصفوفة
    if (typeof cours === 'string') {
      cours = [cours];
    }

    // تحويل actif إلى Boolean
    const actifBool = actif === 'true' || actif === true;

    // مسار الصورة
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const etudiant = new Etudiant({
      nomComplet,
      genre,
      dateNaissance: new Date(dateNaissance),
      telephone,
      email,
      motDePasse: hashedPassword,
      cours,
      image: imagePath,
      actif: actifBool,
      creeParAdmin: req.adminId
    });

    await etudiant.save();
    res.status(201).json(etudiant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Lister tous les étudiants
app.get('/api/etudiants', authAdmin, async (req, res) => {
  try {
    const etudiants = await Etudiant.find()
      .select('-motDePasse') // ❌ إخفاء كلمة المرور
      .populate('creeParAdmin', 'nom email');
    res.json(etudiants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cours', authAdmin, async (req, res) => {
  try {
    let { nom, professeur } = req.body;

    // ✅ تحويل professeur إلى مصفوفة إذا لم يكن مصفوفة
  if (!Array.isArray(professeur)) {
  professeur = professeur ? [professeur] : [];
}


    // التحقق من عدم تكرار الكورس
    const existe = await Cours.findOne({ nom });
    if (existe) return res.status(400).json({ message: 'Cours déjà existant' });

    const cours = new Cours({
      nom,
      professeur, // مصفوفة من الأسماء
      creePar: req.adminId
    });

    await cours.save();

    // تحديث كل أستاذ وربط الكورس به
    for (const profNom of professeur) {
      const prof = await Professeur.findOne({ nom: profNom });
      if (prof && !prof.cours.includes(nom)) {
        prof.cours.push(nom);
        await prof.save();
      }
    }

    res.status(201).json(cours);
  } catch (err) {
    console.error('❌ Erreur ajout cours:', err);
    res.status(500).json({ error: err.message || 'Erreur inconnue côté serveur' });
  }
});




// Mise à jour de l'état actif de l'étudiant
// ✅ Basculer le statut actif d’un étudiant
app.patch('/api/etudiants/:id/actif', authAdmin, async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.params.id);
    if (!etudiant) return res.status(404).json({ message: 'Étudiant non trouvé' });

    etudiant.actif = !etudiant.actif;
    await etudiant.save();

    res.json(etudiant);
  } catch (err) {
    console.error('Erreur PATCH actif:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.delete('/api/etudiants/:id', authAdmin, async (req, res) => {
  try {
    await Etudiant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Étudiant supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});
// ✅ Obtenir un seul étudiant
app.get('/api/etudiants/:id', authAdmin, async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.params.id);
    if (!etudiant) return res.status(404).json({ message: 'Étudiant non trouvé' });
    res.json(etudiant);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.post('/api/evenements', authAdmin, async (req, res) => {
  try {
    const { titre, description, dateDebut, dateFin, type } = req.body;

    const evenement = new Evenement({
      titre,
      description,
      dateDebut: new Date(dateDebut),
      dateFin: dateFin ? new Date(dateFin) : new Date(dateDebut),
      type,
      creePar: req.adminId
    });

    await evenement.save();
    res.status(201).json(evenement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/evenements', authAdmin, async (req, res) => {
  try {
    const evenements = await Evenement.find().sort({ dateDebut: 1 });
    res.json(evenements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ Route pour modifier un événement
app.put('/api/evenements/:id', authAdmin, async (req, res) => {
  try {
    const { titre, description, dateDebut, dateFin, type } = req.body;
    
    // Vérifier que l'événement existe
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    // Préparer les données de mise à jour
    const updateData = {
      titre,
      description,
      dateDebut: new Date(dateDebut),
      dateFin: dateFin ? new Date(dateFin) : new Date(dateDebut),
      type
    };

    // Mettre à jour l'événement
    const evenementModifie = await Evenement.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );

    console.log('✅ Événement modifié:', evenementModifie);
    res.json(evenementModifie);
    
  } catch (err) {
    console.error('❌ Erreur lors de la modification:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la modification de l\'événement',
      error: err.message 
    });
  }
});

// ✅ Route pour supprimer un événement
app.delete('/api/evenements/:id', authAdmin, async (req, res) => {
  try {
    // Vérifier que l'événement existe
    const evenement = await Evenement.findById(req.params.id);
    if (!evenement) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    // Supprimer l'événement
    await Evenement.findByIdAndDelete(req.params.id);
    
    console.log('✅ Événement supprimé avec l\'ID:', req.params.id);
    res.json({ 
      message: 'Événement supprimé avec succès',
      evenementSupprime: {
        id: evenement._id,
        titre: evenement.titre
      }
    });
    
  } catch (err) {
    console.error('❌ Erreur lors de la suppression:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'événement',
      error: err.message 
    });
  }
});

// ✅ Route pour obtenir un seul événement (optionnel - pour les détails)
app.get('/api/evenements/:id', authAdmin, async (req, res) => {
  try {
    const evenement = await Evenement.findById(req.params.id).populate('creePar', 'nom email');
    
    if (!evenement) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    res.json(evenement);
    
  } catch (err) {
    console.error('❌ Erreur lors de la récupération:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de l\'événement',
      error: err.message 
    });
  }
});
app.get('/api/professeur/presences', authProfesseur, async (req, res) => {
  const data = await Presence.find({ creePar: req.professeurId }).populate('etudiant', 'nomComplet');
  res.json(data);
});
app.get('/api/presences', authAdmin, async (req, res) => {
  try {
    const data = await Presence.find().populate('etudiant', 'nomComplet');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// middleware: authProfesseur يجب أن تتأكد أنك تستعمل
app.get('/api/professeur/etudiants', authProfesseur, async (req, res) => {
  try {
    const professeur = await Professeur.findById(req.professeurId);
    if (!professeur) {
      return res.status(404).json({ message: 'Pas de professeur' });
    }

    const etudiants = await Etudiant.find({
      cours: { $in: professeur.cours },
      actif: true
    }).select('-email -motDePasse'); // ✅ exclure les champs sensibles

    res.json(etudiants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 📁 routes/professeur.js أو ضمن app.js إذا كل شيء في ملف واحد
app.get('/api/professeur/presences', authProfesseur, async (req, res) => {
  try {
    const data = await Presence.find({ creePar: req.professeurId })
      .populate('etudiant', 'nomComplet telephone')
      .sort({ dateSession: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/professeur/absences', authProfesseur, async (req, res) => {
  try {
    const absences = await Presence.find({
      creePar: req.professeurId,
      present: false
    }).populate('etudiant', 'nomComplet telephone');

    res.json(absences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ فقط الكورسات التي يدرسها هذا الأستاذ
app.get('/api/professeur/mes-cours', authProfesseur, async (req, res) => {
  try {
    const professeur = await Professeur.findById(req.professeurId);
    if (!professeur) return res.status(404).json({ message: 'Professeur non trouvé' });

    // جلب الكورسات التي عنده فقط
    const cours = await Cours.find({ professeur: professeur.nom }); // أو _id إذا كنت تستخدم ObjectId
    res.json(cours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/presences', authProfesseur, async (req, res) => {
  try {
    const { etudiant, cours, dateSession, present, remarque, heure, periode } = req.body;

    // ✅ تحقق أن هذا الأستاذ يدرّس هذا الكورس
    const prof = await Professeur.findById(req.professeurId);
    if (!prof.cours.includes(cours)) {
      return res.status(403).json({ message: '❌ Vous ne pouvez pas marquer la présence pour ce cours.' });
    }

    // ✅ إنشاء كائن présence جديد مع الوقت والفترة
    const presence = new Presence({
      etudiant,
      cours,
      dateSession: new Date(dateSession),
      present,
      remarque,
      heure,    // 🆕 وقت الحضور بصيغة "08:30"
      periode,  // 🆕 'matin' أو 'soir'
      creePar: req.professeurId,
         matiere: prof.matiere,           // ✅ المادة تلقائياً من حساب الأستاذ
      nomProfesseur: prof.nom   
    });

    await presence.save();
    res.status(201).json(presence);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Ajoutez ces routes à votre app.js après les routes existantes

// ✅ Route pour récupérer toutes les notifications
// 🔧 API de notifications corrigée avec debug

app.get('/api/notifications', authAdmin, async (req, res) => {
  try {
    const notifications = [];
    const aujourdHui = new Date();
    
    console.log("🔍 Début génération notifications:", aujourdHui);
    
    // 1. 🔴 Paiements expirés et expirant bientôt
    const paiements = await Paiement.find()
      .populate('etudiant', 'nomComplet actif')
      .sort({ moisDebut: -1 });

    console.log("💰 Paiements trouvés:", paiements.length);

    // Grouper par étudiant+cours pour avoir le dernier paiement
    const latestPaiementMap = new Map();
    for (const p of paiements) {
      const key = `${p.etudiant?._id}_${p.cours}`;
      if (!latestPaiementMap.has(key)) {
        latestPaiementMap.set(key, p);
      }
    }

    for (const paiement of latestPaiementMap.values()) {
      if (!paiement.etudiant?.actif) continue;

      const debut = new Date(paiement.moisDebut);
      const fin = new Date(debut);
      fin.setMonth(fin.getMonth() + Number(paiement.nombreMois));
      
      const joursRestants = Math.ceil((fin - aujourdHui) / (1000 * 60 * 60 * 24));

      if (joursRestants < 0) {
        // Paiement expiré
        notifications.push({
          id: `payment_expired_${paiement._id}`,
          type: 'payment_expired',
          title: 'Paiement expiré',
          message: `Le paiement de ${paiement.etudiant.nomComplet} a expiré il y a ${Math.abs(joursRestants)} jour(s)`,
          priority: 'urgent',
          timestamp: fin,
          data: {
            etudiantId: paiement.etudiant._id,
            etudiantNom: paiement.etudiant.nomComplet,
            cours: paiement.cours,
            joursExpires: Math.abs(joursRestants)
          }
        });
      } else if (joursRestants <= 7) {
        // Paiement expirant bientôt
        notifications.push({
          id: `payment_expiring_${paiement._id}`,
          type: 'payment_expiring',
          title: 'Paiement expirant bientôt',
          message: `Le paiement de ${paiement.etudiant.nomComplet} expire dans ${joursRestants} jour(s)`,
          priority: joursRestants <= 3 ? 'high' : 'medium',
          timestamp: fin,
          data: {
            etudiantId: paiement.etudiant._id,
            etudiantNom: paiement.etudiant.nomComplet,
            cours: paiement.cours,
            joursRestants
          }
        });
      }
    }

    // 2. 🟡 Absences répétées (plus de 3 absences ce mois-ci) - VERSION CORRIGÉE
    const debutMois = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1);
    const finMois = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth() + 1, 0);

    console.log("📅 Recherche absences entre:", debutMois, "et", finMois);

    // CORRECTION: Chercher toutes les absences du mois, peu importe le cours
    const presences = await Presence.find({
      dateSession: { $gte: debutMois, $lte: finMois },
      present: false
    }).populate('etudiant', 'nomComplet actif');

    console.log("📊 Présences (absences) trouvées:", presences.length);

    // Debug: Afficher toutes les absences trouvées
    for (const presence of presences) {
      console.log(`- ${presence.etudiant?.nomComplet || 'UNKNOWN'} absent le ${presence.dateSession.toISOString().split('T')[0]} en ${presence.cours}`);
    }

    // Compter les absences par étudiant
    const absencesParEtudiant = {};
    for (const presence of presences) {
      if (!presence.etudiant) {
        console.log("⚠️ Présence sans étudiant:", presence._id);
        continue;
      }
      
      if (!presence.etudiant.actif) {
        console.log("⚠️ Étudiant inactif:", presence.etudiant.nomComplet);
        continue;
      }
      
      const etudiantId = presence.etudiant._id.toString();
      if (!absencesParEtudiant[etudiantId]) {
        absencesParEtudiant[etudiantId] = {
          etudiant: presence.etudiant,
          count: 0,
          cours: new Set()
        };
      }
      absencesParEtudiant[etudiantId].count++;
      absencesParEtudiant[etudiantId].cours.add(presence.cours);
      
      console.log(`✅ Absence comptée: ${presence.etudiant.nomComplet} - Total: ${absencesParEtudiant[etudiantId].count}`);
    }

    console.log("📈 Résumé des absences par étudiant:");
    for (const [etudiantId, data] of Object.entries(absencesParEtudiant)) {
      console.log(`- ${data.etudiant.nomComplet}: ${data.count} absences en ${Array.from(data.cours).join(', ')}`);
      
      if (data.count >= 3) {
        console.log(`🚨 GÉNÉRATION NOTIFICATION pour ${data.etudiant.nomComplet}`);
        
        notifications.push({
          id: `absence_frequent_${etudiantId}`,
          type: 'absence_frequent',
          title: 'Absences répétées',
          message: `${data.etudiant.nomComplet} a été absent(e) ${data.count} fois ce mois`,
          priority: data.count >= 5 ? 'high' : 'medium',
          timestamp: new Date(),
          data: {
            etudiantId,
            etudiantNom: data.etudiant.nomComplet,
            nombreAbsences: data.count,
            cours: Array.from(data.cours)
          }
        });
      }
    }

    // 3. 📅 Événements à venir (dans les 7 prochains jours)
    const dans7jours = new Date();
    dans7jours.setDate(dans7jours.getDate() + 7);

    const evenements = await Evenement.find({
      dateDebut: { $gte: aujourdHui, $lte: dans7jours }
    }).sort({ dateDebut: 1 });

    console.log("📅 Événements à venir:", evenements.length);

    for (const evenement of evenements) {
      const joursRestants = Math.ceil((new Date(evenement.dateDebut) - aujourdHui) / (1000 * 60 * 60 * 24));
      
      let priorite = 'medium';
      if (joursRestants === 0) priorite = 'urgent'; // Aujourd'hui
      else if (joursRestants === 1) priorite = 'high'; // Demain

      notifications.push({
        id: `event_upcoming_${evenement._id}`,
        type: 'event_upcoming',
        title: `${evenement.type} programmé`,
        message: joursRestants === 0 
          ? `${evenement.titre} prévu aujourd'hui`
          : `${evenement.titre} prévu dans ${joursRestants} jour(s)`,
        priority: priorite,
        timestamp: evenement.dateDebut,
        data: {
          evenementId: evenement._id,
          titre: evenement.titre,
          type: evenement.type,
          dateDebut: evenement.dateDebut,
          joursRestants
        }
      });
    }

    // Trier par priorité puis par date
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    console.log("🎯 Notifications générées:", notifications.length);
    console.log("- Urgent:", notifications.filter(n => n.priority === 'urgent').length);
    console.log("- High:", notifications.filter(n => n.priority === 'high').length);
    console.log("- Medium:", notifications.filter(n => n.priority === 'medium').length);

    res.json({
      notifications,
      total: notifications.length,
      urgent: notifications.filter(n => n.priority === 'urgent').length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      debug: {
        debutMois: debutMois.toISOString(),
        finMois: finMois.toISOString(),
        presencesTotales: presences.length,
        absencesParEtudiant: Object.fromEntries(
          Object.entries(absencesParEtudiant).map(([id, data]) => [
            data.etudiant.nomComplet, 
            { count: data.count, cours: Array.from(data.cours) }
          ])
        )
      }
    });

  } catch (err) {
    console.error('❌ Erreur notifications:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// 🔧 Route de débogage spéciale
app.get('/api/debug/notifications', authAdmin, async (req, res) => {
  try {
    const aujourdHui = new Date();
    const debutMois = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1);
    const finMois = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth() + 1, 0);

    // Étudiant spécifique
    const etudiantId = "685dd93cdb5dd547333fe5bb";
    const etudiant = await Etudiant.findById(etudiantId);
    
    // Ses présences ce mois
    const presences = await Presence.find({
      etudiant: etudiantId,
      dateSession: { $gte: debutMois, $lte: finMois }
    });

    // Ses absences ce mois
    const absences = presences.filter(p => !p.present);

    res.json({
      etudiant: {
        nom: etudiant.nomComplet,
        actif: etudiant.actif,
        cours: etudiant.cours
      },
      periode: {
        debut: debutMois,
        fin: finMois
      },
      presences: {
        total: presences.length,
        presents: presences.filter(p => p.present).length,
        absents: absences.length,
        details: absences.map(p => ({
          date: p.dateSession,
          cours: p.cours,
          present: p.present
        }))
      },
      shouldTriggerNotification: absences.length >= 3
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route pour les statistiques du dashboard
app.get('/api/dashboard/stats', authAdmin, async (req, res) => {
  try {
    const aujourdHui = new Date();
    
    // Compter les étudiants actifs
    const etudiantsActifs = await Etudiant.countDocuments({ actif: true });
    
    // Compter les cours
    const totalCours = await Cours.countDocuments();
    
    // Paiements expirés ce mois
    const debutMois = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1);
    const paiementsExpiresCount = await Paiement.aggregate([
      {
        $addFields: {
          dateFin: {
            $dateAdd: {
              startDate: "$moisDebut",
              unit: "month",
              amount: "$nombreMois"
            }
          }
        }
      },
      {
        $match: {
          dateFin: { $lt: aujourdHui }
        }
      },
      {
        $count: "total"
      }
    ]);
    
    // Événements cette semaine
    const finSemaine = new Date();
    finSemaine.setDate(finSemaine.getDate() + 7);
    const evenementsSemaine = await Evenement.countDocuments({
      dateDebut: { $gte: aujourdHui, $lte: finSemaine }
    });

    // Absences cette semaine
    const debutSemaine = new Date();
    debutSemaine.setDate(debutSemaine.getDate() - 7);
    const absencesSemaine = await Presence.countDocuments({
      dateSession: { $gte: debutSemaine, $lte: aujourdHui },
      present: false
    });

    res.json({
      etudiantsActifs,
      totalCours,
      paiementsExpires: paiementsExpiresCount[0]?.total || 0,
      evenementsSemaine,
      absencesSemaine,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('❌ Erreur stats dashboard:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route pour marquer une notification comme lue (optionnel)
app.post('/api/notifications/:id/mark-read', authAdmin, (req, res) => {
  // Dans une vraie application, vous stockeriez l'état "lu" en base
  // Pour l'instant, on retourne juste un succès
  res.json({ message: 'Notification marquée comme lue', id: req.params.id });
});
// 📄 Route: GET /api/documents
// مرئية للجميع
app.get('/api/documents', authEtudiant, async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiantId);
    const documents = await Document.find({
      cours: { $in: etudiant.cours }
    }).sort({ dateAjout: -1 });

    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.get('/api/professeur/documents', authProfesseur, async (req, res) => {
  try {
    const docs = await Document.find({ creePar: req.professeurId }).sort({ dateUpload: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});app.delete('/api/documents/:id', authProfesseur, async (req, res) => {
  try {
    const documentId = req.params.id;
    const professeurId = req.professeurId; // ✅ depuis le middleware authProfesseur

    // Vérifier que le document appartient à ce professeur
    const document = await Document.findOne({ 
      _id: documentId, 
      creePar: professeurId   // ✅ champ correct
    });

    if (!document) {
      return res.status(404).json({ 
        message: 'Document non trouvé ou accès refusé' 
      });
    }

    // ✅ Optionnel: supprimer le fichier du dossier local (si nécessaire)
    // const fs = require('fs');
    // const filePath = path.join(__dirname, 'documents', path.basename(document.fichier));
    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath);
    // }

    // Supprimer le document de la base
    await Document.findByIdAndDelete(documentId);

    res.json({ message: '✅ Document supprimé avec succès' });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la suppression', 
      error: error.message 
    });
  }
});



// ✅ BACKEND: Retourne les cours de l'étudiant + leurs professeurs
app.get('/api/etudiant/mes-cours', authEtudiant, async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiantId);
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    const coursAvecProfs = await Promise.all(
      etudiant.cours.map(async (nomCours) => {
        const professeurs = await Professeur.find({ cours: nomCours })
          .select('_id nom matiere');
        return { nomCours, professeurs };
      })
    );

    res.status(200).json(coursAvecProfs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
// ✅ BACKEND: Envoi d'un exercice à un prof spécifique
app.post(
  '/api/etudiant/exercices',
  authEtudiant,
  exerciceUpload.single('fichier'),
  async (req, res) => {
    try {
      const { titre, cours, type, numero, professeurId } = req.body;

      // ✅ التحقق من الحقول المطلوبة
      if (!titre || !cours || !type || !numero || !professeurId || !req.file) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
      }

      // ✅ التأكد أن الأستاذ يدرّس هذا الكورس
      const professeur = await Professeur.findById(professeurId);
      if (!professeur || !professeur.cours.includes(cours)) {
        return res.status(400).json({
          message: '❌ Le professeur sélectionné n\'enseigne pas ce cours.'
        });
      }

      // ✅ إنشاء التمرين
      const fichier = `/uploads/${req.file.filename}`;
      const exercice = new Exercice({
        titre,
        cours,
        type,
        numero,
        fichier,
        etudiant: req.etudiantId,
        professeur: professeurId
      });

      await exercice.save();
      res.status(201).json({
        message: '✅ Exercice envoyé avec succès',
        exercice
      });
    } catch (err) {
      console.error('❌ Erreur envoi exercice:', err);
      res.status(500).json({
        message: '❌ Erreur lors de l\'envoi du devoir',
        error: err.message
      });
    }
  }
);


// DELETE - Supprimer un exercice (par l'étudiant sous 24h)
app.delete('/api/etudiant/exercices/:id', authEtudiant, async (req, res) => {
  try {
    const exercice = await Exercice.findOne({ _id: req.params.id, etudiant: req.etudiantId });

    if (!exercice) {
      return res.status(404).json({ message: 'Exercice introuvable' });
    }

    const maintenant = new Date();
    const diffHeures = (maintenant - exercice.dateEnvoi) / (1000 * 60 * 60);

    if (diffHeures > 24) {
      return res.status(403).json({ message: '⛔ Impossible de supprimer après 24h' });
    }

    // Optionnel : supprimer fichier physique
    const fs = require('fs');
    if (fs.existsSync(`.${exercice.fichier}`)) {
      fs.unlinkSync(`.${exercice.fichier}`);
    }

    await exercice.deleteOne();
    res.json({ message: '✅ Exercice supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur suppression', error: err.message });
  }
});

// ✅ Route pour obtenir le nombre de notifications non lues
app.get('/api/notifications/unread-count', authAdmin, async (req, res) => {
  try {
    // Cette route utilise la même logique que /api/notifications
    // mais retourne seulement le nombre
    const notifications = [];
    const aujourdHui = new Date();
    
    // Paiements expirés et expirant
    const paiements = await Paiement.find()
      .populate('etudiant', 'nomComplet actif')
      .sort({ moisDebut: -1 });

    const latestPaiementMap = new Map();
    for (const p of paiements) {
      const key = `${p.etudiant?._id}_${p.cours}`;
      if (!latestPaiementMap.has(key)) {
        latestPaiementMap.set(key, p);
      }
    }

    for (const paiement of latestPaiementMap.values()) {
      if (!paiement.etudiant?.actif) continue;
      const debut = new Date(paiement.moisDebut);
      const fin = new Date(debut);
      fin.setMonth(fin.getMonth() + Number(paiement.nombreMois));
      const joursRestants = Math.ceil((fin - aujourdHui) / (1000 * 60 * 60 * 24));

      if (joursRestants < 0 || joursRestants <= 7) {
        notifications.push({ type: 'payment' });
      }
    }

    // Absences répétées
    const debutMois = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1);
    const presences = await Presence.find({
      dateSession: { $gte: debutMois, $lte: aujourdHui },
      present: false
    }).populate('etudiant', 'nomComplet actif');

    const absencesParEtudiant = {};
    for (const presence of presences) {
      if (!presence.etudiant?.actif) continue;
      const etudiantId = presence.etudiant._id.toString();
      absencesParEtudiant[etudiantId] = (absencesParEtudiant[etudiantId] || 0) + 1;
    }

    for (const count of Object.values(absencesParEtudiant)) {
      if (count >= 3) {
        notifications.push({ type: 'absence' });
      }
    }

    // Événements à venir
    const dans7jours = new Date();
    dans7jours.setDate(dans7jours.getDate() + 7);
    const evenements = await Evenement.find({
      dateDebut: { $gte: aujourdHui, $lte: dans7jours }
    });

    notifications.push(...evenements.map(() => ({ type: 'event' })));

    res.json({ count: notifications.length });

  } catch (err) {
    console.error('❌ Erreur unread count:', err);
    res.status(500).json({ error: err.message });
  }
});
// ✅ Route pour supprimer une notification
app.delete('/api/notifications/:id', authAdmin, async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    console.log("🗑️ Tentative de suppression notification:", notificationId);
    
    // Étant donné que les notifications sont générées dynamiquement,
    // nous devons les stocker temporairement ou utiliser une autre approche
    
    // OPTION 1: Stockage temporaire en mémoire (simple mais limité)
    if (!global.deletedNotifications) {
      global.deletedNotifications = new Set();
    }
    
    // Ajouter l'ID à la liste des notifications supprimées
    global.deletedNotifications.add(notificationId);
    
    console.log("✅ Notification marquée comme supprimée:", notificationId);
    console.log("📋 Total notifications supprimées:", global.deletedNotifications.size);
    
    res.json({ 
      message: 'Notification supprimée avec succès',
      id: notificationId,
      success: true
    });

  } catch (err) {
    console.error('❌ Erreur suppression notification:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression de la notification',
      details: err.message 
    });
  }
});

// ✅ Modifier la route GET notifications pour exclure les notifications supprimées
app.get('/api/notifications', authAdmin, async (req, res) => {
  try {
    const notifications = [];
    const aujourdHui = new Date();
    
    console.log("🔍 Début génération notifications:", aujourdHui);
    
    // Initialiser la liste des notifications supprimées si elle n'existe pas
    if (!global.deletedNotifications) {
      global.deletedNotifications = new Set();
    }
    
    // 1. 🔴 Paiements expirés et expirant bientôt
    const paiements = await Paiement.find()
      .populate('etudiant', 'nomComplet actif')
      .sort({ moisDebut: -1 });

    console.log("💰 Paiements trouvés:", paiements.length);

    // Grouper par étudiant+cours pour avoir le dernier paiement
    const latestPaiementMap = new Map();
    for (const p of paiements) {
      const key = `${p.etudiant?._id}_${p.cours}`;
      if (!latestPaiementMap.has(key)) {
        latestPaiementMap.set(key, p);
      }
    }

    for (const paiement of latestPaiementMap.values()) {
      if (!paiement.etudiant?.actif) continue;

      const debut = new Date(paiement.moisDebut);
      const fin = new Date(debut);
      fin.setMonth(fin.getMonth() + Number(paiement.nombreMois));
      
      const joursRestants = Math.ceil((fin - aujourdHui) / (1000 * 60 * 60 * 24));

      let notificationId, type, title, message, priority;

      if (joursRestants < 0) {
        // Paiement expiré
        notificationId = `payment_expired_${paiement._id}`;
        type = 'payment_expired';
        title = 'Paiement expiré';
        message = `Le paiement de ${paiement.etudiant.nomComplet} a expiré il y a ${Math.abs(joursRestants)} jour(s)`;
        priority = 'urgent';
      } else if (joursRestants <= 7) {
        // Paiement expirant bientôt
        notificationId = `payment_expiring_${paiement._id}`;
        type = 'payment_expiring';
        title = 'Paiement expirant bientôt';
        message = `Le paiement de ${paiement.etudiant.nomComplet} expire dans ${joursRestants} jour(s)`;
        priority = joursRestants <= 3 ? 'high' : 'medium';
      }

      // Vérifier si cette notification n'a pas été supprimée
      if (notificationId && !global.deletedNotifications.has(notificationId)) {
        notifications.push({
          id: notificationId,
          type: type,
          title: title,
          message: message,
          priority: priority,
          timestamp: fin,
          data: {
            etudiantId: paiement.etudiant._id,
            etudiantNom: paiement.etudiant.nomComplet,
            cours: paiement.cours,
            joursRestants: joursRestants < 0 ? Math.abs(joursRestants) : joursRestants
          }
        });
      }
    }

    // 2. 🟡 Absences répétées (plus de 3 absences ce mois-ci)
    const debutMois = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1);
    const finMois = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth() + 1, 0);

    console.log("📅 Recherche absences entre:", debutMois, "et", finMois);

    const presences = await Presence.find({
      dateSession: { $gte: debutMois, $lte: finMois },
      present: false
    }).populate('etudiant', 'nomComplet actif');

    console.log("📊 Présences (absences) trouvées:", presences.length);

    // Compter les absences par étudiant
    const absencesParEtudiant = {};
    for (const presence of presences) {
      if (!presence.etudiant || !presence.etudiant.actif) continue;
      
      const etudiantId = presence.etudiant._id.toString();
      if (!absencesParEtudiant[etudiantId]) {
        absencesParEtudiant[etudiantId] = {
          etudiant: presence.etudiant,
          count: 0,
          cours: new Set()
        };
      }
      absencesParEtudiant[etudiantId].count++;
      absencesParEtudiant[etudiantId].cours.add(presence.cours);
    }

    for (const [etudiantId, data] of Object.entries(absencesParEtudiant)) {
      if (data.count >= 3) {
        const notificationId = `absence_frequent_${etudiantId}`;
        
        // Vérifier si cette notification n'a pas été supprimée
        if (!global.deletedNotifications.has(notificationId)) {
          notifications.push({
            id: notificationId,
            type: 'absence_frequent',
            title: 'Absences répétées',
            message: `${data.etudiant.nomComplet} a été absent(e) ${data.count} fois ce mois`,
            priority: data.count >= 5 ? 'high' : 'medium',
            timestamp: new Date(),
            data: {
              etudiantId,
              etudiantNom: data.etudiant.nomComplet,
              nombreAbsences: data.count,
              cours: Array.from(data.cours)
            }
          });
        }
      }
    }

    // 3. 📅 Événements à venir (dans les 7 prochains jours)
    const dans7jours = new Date();
    dans7jours.setDate(dans7jours.getDate() + 7);

    const evenements = await Evenement.find({
      dateDebut: { $gte: aujourdHui, $lte: dans7jours }
    }).sort({ dateDebut: 1 });

    console.log("📅 Événements à venir:", evenements.length);

    for (const evenement of evenements) {
      const joursRestants = Math.ceil((new Date(evenement.dateDebut) - aujourdHui) / (1000 * 60 * 60 * 24));
      
      let priorite = 'medium';
      if (joursRestants === 0) priorite = 'urgent'; // Aujourd'hui
      else if (joursRestants === 1) priorite = 'high'; // Demain

      const notificationId = `event_upcoming_${evenement._id}`;
      
      // Vérifier si cette notification n'a pas été supprimée
      if (!global.deletedNotifications.has(notificationId)) {
        notifications.push({
          id: notificationId,
          type: 'event_upcoming',
          title: `${evenement.type} programmé`,
          message: joursRestants === 0 
            ? `${evenement.titre} prévu aujourd'hui`
            : `${evenement.titre} prévu dans ${joursRestants} jour(s)`,
          priority: priorite,
          timestamp: evenement.dateDebut,
          data: {
            evenementId: evenement._id,
            titre: evenement.titre,
            type: evenement.type,
            dateDebut: evenement.dateDebut,
            joursRestants
          }
        });
      }
    }

    // Trier par priorité puis par date
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    console.log("🎯 Notifications générées:", notifications.length);
    console.log("🗑️ Notifications supprimées:", global.deletedNotifications.size);
    console.log("- Urgent:", notifications.filter(n => n.priority === 'urgent').length);
    console.log("- High:", notifications.filter(n => n.priority === 'high').length);
    console.log("- Medium:", notifications.filter(n => n.priority === 'medium').length);

    res.json({
      notifications,
      total: notifications.length,
      urgent: notifications.filter(n => n.priority === 'urgent').length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      deletedCount: global.deletedNotifications.size
    });

  } catch (err) {
    console.error('❌ Erreur notifications:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});
// 🔒 GET /api/professeur/exercices/:cours
app.get('/api/professeur/exercices/:cours', authProfesseur, async (req, res) => {
  try {
    const { cours } = req.params;

    // ✅ جلب التمارين فقط التي أُرسلت لهذا الأستاذ
    const exercices = await Exercice.find({ 
      cours, 
      professeur: req.professeurId // ✅ هذا هو الفرق
    }).populate('etudiant', 'nomComplet email');

    res.json(exercices);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route GET – Etudiant voir ses propres exercices
app.get('/api/etudiant/mes-exercices', authEtudiant, async (req, res) => {
  try {
    const exercices = await Exercice.find({ etudiant: req.etudiantId })
      .populate('professeur', 'nom matiere') // ✅ إظهار اسم ومادة الأستاذ
      .sort({ dateUpload: -1 });

    res.json(exercices);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


// 🔒 PUT /api/professeur/exercices/:id/remarque
app.put('/api/professeur/exercices/:id/remarque', authProfesseur, async (req, res) => {
  try {
    const { remarque } = req.body;
    const { id } = req.params;

    const exercice = await Exercice.findByIdAndUpdate(
      id,
      { remarque },
      { new: true }
    );

    if (!exercice) return res.status(404).json({ message: 'Exercice non trouvé' });

    res.json({ message: '✅ Remarque ajoutée', exercice });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.get('/api/live/:cours', authProfesseur, (req, res) => {
  const { cours } = req.params;
  const lien = genererLienLive(cours);
  res.json({ lien });
});
app.delete('/api/cours/:id', authAdmin, async (req, res) => {
  try {
    const coursId = req.params.id;

    const cours = await Cours.findById(coursId);
    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // ✅ Supprimer le cours de la base
    await Cours.findByIdAndDelete(coursId);

    // ✅ Supprimer le nom du cours chez tous les étudiants
    await Etudiant.updateMany(
      { cours: cours.nom },
      { $pull: { cours: cours.nom } }
    );

    // ✅ Supprimer le nom du cours chez tous les professeurs
    await Professeur.updateMany(
      { cours: cours.nom },
      { $pull: { cours: cours.nom } }
    );

    res.json({ message: `✅ Cours "${cours.nom}" supprimé avec succès` });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur lors de la suppression', error: err.message });
  }
});



// ✅ Route pour vider la liste des notifications supprimées (optionnel - pour admin)
app.post('/api/notifications/reset-deleted', authAdmin, (req, res) => {
  try {
    const oldCount = global.deletedNotifications ? global.deletedNotifications.size : 0;
    global.deletedNotifications = new Set();
    
    console.log("🔄 Liste des notifications supprimées réinitialisée");
    console.log(`📊 ${oldCount} notifications supprimées ont été restaurées`);
    
    res.json({ 
      message: 'Liste des notifications supprimées réinitialisée',
      restoredCount: oldCount,
      success: true
    });

  } catch (err) {
    console.error('❌ Erreur reset notifications:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la réinitialisation',
      details: err.message 
    });
  }
});
// 🔔 إشعارات الأستاذ - الأحداث القادمة فقط
app.get('/api/professeur/notifications', authProfesseur, async (req, res) => {
  try {
    const notifications = [];

    const aujourdHui = new Date();
    const dans7jours = new Date();
    dans7jours.setDate(aujourdHui.getDate() + 7);

    const evenements = await Evenement.find({
      dateDebut: { $gte: aujourdHui, $lte: dans7jours }
    }).sort({ dateDebut: 1 });

    for (const e of evenements) {
      const joursRestants = Math.ceil((new Date(e.dateDebut) - aujourdHui) / (1000 * 60 * 60 * 24));

      notifications.push({
        id: `event_${e._id}`,
        title: `📅 ${e.titre}`,
        message:
          joursRestants === 0
            ? `📌 Aujourd'hui: ${e.titre}`
            : `⏳ Dans ${joursRestants} jour(s): ${e.titre}`,
        date: e.dateDebut
      });
    }

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route pour obtenir la liste des notifications supprimées (debug)
app.get('/api/notifications/deleted', authAdmin, (req, res) => {
  try {
    if (!global.deletedNotifications) {
      global.deletedNotifications = new Set();
    }
    
    res.json({
      deletedNotifications: Array.from(global.deletedNotifications),
      count: global.deletedNotifications.size
    });

  } catch (err) {
    console.error('❌ Erreur get deleted notifications:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération',
      details: err.message 
    });
  }
});
// route: POST /api/professeurs
// accessible uniquement par Admin
app.post('/api/professeurs', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const { nom, email, motDePasse, cours, telephone, dateNaissance, actif, genre, matiere } = req.body;

    // 🔐 تحقق من التكرار
    const existe = await Professeur.findOne({ email });
    if (existe) return res.status(400).json({ message: '📧 هذا البريد مستخدم من قبل' });

    // ✅ تحقق من genre صالح
    if (!['Homme', 'Femme'].includes(genre)) {
      return res.status(400).json({ message: '🚫 النوع (genre) غير صالح. يجب أن يكون Homme أو Femme' });
    }

    // ✅ تحقق من المادة (matiere)
    if (!matiere || matiere.trim() === '') {
      return res.status(400).json({ message: '🚫 المادة (matière) مطلوبة' });
    }

    // 🖼️ مسار الصورة
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    // 🗓️ تحويل التاريخ
    const date = dateNaissance ? new Date(dateNaissance) : null;

    // 🔁 actif إلى Boolean
    const actifBool = actif === 'true' || actif === true;

    // 🔐 تشفير كلمة السر
    const hashed = await bcrypt.hash(motDePasse, 10);

    // 🆕 إنشاء الأستاذ
    const professeur = new Professeur({
      nom,
      genre,
      email,
      motDePasse: hashed,
      telephone,
      dateNaissance: date,
      image: imagePath,
      actif: actifBool,
      cours,
      matiere // ✅ الإضافة هنا
    });

    await professeur.save();

    res.status(201).json({ message: '✅ Professeur créé avec succès', professeur });
  } catch (err) {
    console.error('❌ Erreur création professeur:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// route: POST /api/professeurs/login
app.post('/api/professeurs/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const professeur = await Professeur.findOne({ email });
    if (!professeur) return res.status(404).json({ message: 'Professeur non trouvé' });

    const isValid = await professeur.comparePassword(motDePasse);
    if (!isValid) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: professeur._id, role: 'prof' }, 'jwt_secret_key', { expiresIn: '7d' });

    res.json({ professeur, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.put('/api/professeurs/:id', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const professeurId = req.params.id;
    const {
      nom,
      genre,
      dateNaissance,
      telephone,
      email,
      motDePasse,
      actif,
      matiere // ✅ nouvelle propriété
    } = req.body;

    let cours = req.body.cours;

    // 🧠 S'assurer que cours est un tableau
    if (!cours) cours = [];
    if (typeof cours === 'string') cours = [cours];

    // 🔍 Récupérer les anciens cours du professeur
    const ancienProf = await Professeur.findById(professeurId);
    if (!ancienProf) return res.status(404).json({ message: "Professeur introuvable" });

    const ancienCours = ancienProf.cours || [];

    // ➖ Cours supprimés
    const coursSupprimes = ancienCours.filter(c => !cours.includes(c));
    // ➕ Cours ajoutés
    const coursAjoutes = cours.filter(c => !ancienCours.includes(c));

    // 🧼 Retirer le prof des cours supprimés
    for (const coursNom of coursSupprimes) {
      await Cours.updateOne(
        { nom: coursNom },
        { $pull: { professeur: ancienProf.nom } }
      );
    }

    // 🧩 Ajouter le prof dans les cours ajoutés
    for (const coursNom of coursAjoutes) {
      await Cours.updateOne(
        { nom: coursNom },
        { $addToSet: { professeur: nom } }
      );
    }

    // 🛠️ Données à mettre à jour
    const updateData = {
      nom,
      genre,
      dateNaissance: new Date(dateNaissance),
      telephone,
      email,
      cours,
      matiere, // ✅ ajout ici
      actif: actif === 'true' || actif === true
    };

    // 📷 Gestion de l'image
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // 🔐 Mot de passe s'il est modifié
    if (motDePasse && motDePasse.trim() !== '') {
      updateData.motDePasse = await bcrypt.hash(motDePasse, 10);
    }

    // ✅ Mise à jour du professeur
    const updatedProf = await Professeur.findByIdAndUpdate(
      professeurId,
      updateData,
      { new: true, runValidators: true }
    ).select('-motDePasse');

    res.json({ message: "✅ Professeur modifié avec succès", professeur: updatedProf });

  } catch (err) {
    console.error('❌ Erreur lors de la modification:', err);
    res.status(500).json({ message: "Erreur lors de la modification", error: err.message });
  }
});


// routes/professeurs.js
app.patch('/api/professeurs/:id/actif', authAdmin, async (req, res) => {
  try {
    const prof = await Professeur.findById(req.params.id);
    if (!prof) return res.status(404).json({ message: 'Professeur introuvable' });

    prof.actif = !prof.actif;
    await prof.save();

    res.json(prof); // ✅ نرجع بيانات الأستاذ المحدثة
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
app.get('/api/etudiant/profile', authEtudiant, async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiantId).select('-motDePasse'); // ✅ هنا التعديل
    if (!etudiant) return res.status(404).json({ message: 'Étudiant introuvable' });
    res.json(etudiant);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب الملف الشخصي', error: err.message });
  }
});


// ✅ 🟢 جلسات الحضور
app.get('/api/etudiant/presences', authEtudiant, async (req, res) => {
  try {
    const presences = await Presence.find({ etudiant: req.etudiantId, present: true });
    res.json(presences);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب بيانات الحضور', error: err.message });
  }
});


// ✅ 🔴 الغيابات
app.get('/api/etudiant/absences', authEtudiant, async (req, res) => {
  try {
    const absences = await Presence.find({ etudiant: req.etudiantId, present: false });
    res.json(absences);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب بيانات الغيابات', error: err.message });
  }
});


// ✅ 💰 الدفعات
app.get('/api/etudiant/paiements', authEtudiant, async (req, res) => {
  try {
    const paiements = await Paiement.find({ etudiant: req.etudiantId });
    res.json(paiements);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في جلب بيانات الدفعات', error: err.message });
  }
});



app.delete('/api/professeurs/:id', authAdmin, async (req, res) => {
  try {
    await Professeur.findByIdAndDelete(req.params.id);
    res.json({ message: 'Professeur supprimé avec succès' });
  } catch (err) {
    console.error('❌ Erreur suppression:', err);
    res.status(500).json({ message: 'Erreur lors de la suppression', error: err.message });
  }
});

app.get('/api/presences/:etudiantId', authAdmin, async (req, res) => {
  try {
    const result = await Presence.find({ etudiant: req.params.etudiantId }).sort({ dateSession: -1 });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/presences/etudiant/:id', authAdmin, async (req, res) => {
  try {
    const presences = await Presence.find({ etudiant: req.params.id }).sort({ dateSession: -1 });
    res.json(presences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ Modifier un étudiant
app.put('/api/etudiants/:id', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const { nomComplet, genre, dateNaissance, telephone, email, motDePasse, actif } = req.body;
    let cours = req.body.cours;
    if (typeof cours === 'string') cours = [cours];
    const actifBool = actif === 'true' || actif === true;

    const updateData = {
      nomComplet,
      genre,
      dateNaissance: new Date(dateNaissance),
      telephone,
      email,
      cours,
      actif: actifBool
    };

    // إذا تم رفع صورة جديدة
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // إذا تم إدخال كلمة مرور جديدة
    if (motDePasse && motDePasse.trim() !== '') {
      const bcrypt = require('bcryptjs');
      updateData.motDePasse = await bcrypt.hash(motDePasse, 10);
    }

    const updated = await Etudiant.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).select('-motDePasse'); // ❌ لا نرجع كلمة المرور في النتيجة

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', error: err.message });
  }
});

// Lister les cours
// Récupérer un seul cours avec détails
// 📌 Route: GET /api/cours/:id
// ✅ Lister tous les cours (IMPORTANT!)
app.get('/api/cours', authAdmin, async (req, res) => {
  try {
    const cours = await Cours.find();
    res.json(cours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// routes/professeur.js أو في ملف Express المناسب

app.get('/api/professeur/profile', authProfesseur, async (req, res) => {
  try {
    const professeur = await Professeur.findById(req.professeurId).select('-motDePasse');
    if (!professeur) return res.status(404).json({ message: 'Professeur introuvable' });
    res.json(professeur);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


app.get('/api/cours/:id', authAdmin, async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id).populate('creePar', 'nom email');
    if (!cours) return res.status(404).json({ message: 'Cours introuvable' });
    res.json(cours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/professeurs', authAdmin, async (req, res) => {
  try {
    const professeurs = await Professeur.find().sort({ createdAt: -1 });
    res.json(professeurs);
  } catch (err) {
    console.error('❌ Erreur lors de l\'affichage des professeurs:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
app.post('/api/paiements', authAdmin, async (req, res) => {
  try {
    const { etudiant, cours, moisDebut, nombreMois, montant, note } = req.body;

    const coursArray = Array.isArray(cours) ? cours : [cours];

    const paiement = new Paiement({
      etudiant,
      cours: coursArray, // ✅ الكل دفعة واحدة
      moisDebut: new Date(moisDebut),
      nombreMois,
      montant,
      note,
      creePar: req.adminId
    });

    await paiement.save();

    res.status(201).json({ message: 'Paiement groupé ajouté', paiement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/messages/upload', authEtudiant, uploadMessageFile.single('fichier'), async (req, res) => {
  try {
    const { contenu, destinataireId, roleDestinataire } = req.body;

    const hasContenu = contenu && contenu.trim() !== '';
    const hasFile = !!req.file;

    if (!hasContenu && !hasFile) {
      return res.status(400).json({ message: 'Le contenu du message ou le fichier est requis.' });
    }

    const messageData = {
      expediteur: req.etudiantId,
      roleExpediteur: 'Etudiant',
      destinataire: destinataireId,
      roleDestinataire: 'Professeur',
      etudiant: req.etudiantId,
      professeur: destinataireId,
    };

    if (hasContenu) messageData.contenu = contenu.trim();
    if (hasFile) messageData.fichier = `/uploads/messages/${req.file.filename}`;

    const newMessage = new Message(messageData);
    await newMessage.save();

    res.status(201).json({
      message: 'Message envoyé avec succès.',
      data: newMessage,
    });
  } catch (err) {
    console.error('Erreur lors de l’envoi du message avec fichier:', err);
    res.status(500).json({ message: 'Une erreur est survenue sur le serveur.' });
  }
});app.get('/api/etudiant/me', authEtudiant, async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiantId).select('-motDePasse');
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    res.json(etudiant);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});app.get('/api/etudiant/mes-professeurs-messages', authEtudiant, async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiantId);
    const coursEtudiant = etudiant.cours;

    const professeurs = await Professeur.find({
      cours: { $in: coursEtudiant },
      actif: true
    }).select('_id nom cours image genre lastSeen');

    // Pour chaque professeur, obtenir le dernier message
    const professeursAvecMessages = await Promise.all(
      professeurs.map(async (prof) => {
        const dernierMessage = await Message.findOne({
          $or: [
            { expediteur: prof._id, destinataire: req.etudiantId },
            { expediteur: req.etudiantId, destinataire: prof._id }
          ]
        })
        .sort({ date: -1 })
        .select('contenu date roleExpediteur');

        return {
          ...prof.toObject(),
          dernierMessage
        };
      })
    );

    res.json(professeursAvecMessages);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Lister les paiements
app.get('/api/paiements', authAdmin, async (req, res) => {
  try {
    const paiements = await Paiement.find()
      .populate('etudiant', 'nomComplet telephone') // afficher nomComplet et téléphone
      .populate('creePar', 'nom'); // afficher اسم المدير

    res.json(paiements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 📌 API: Liste paiements expirés
// 📌 Route GET /api/paiements/expirés
app.get('/api/paiements/exp', authAdmin, async (req, res) => {
  try {
    const paiements = await Paiement.find()
      .populate('etudiant', ' image nomComplet actif')
      .sort({ moisDebut: -1 }); // الأحدث أولاً

    const aujourdHui = new Date();

    // تجميع آخر دفعة لكل طالب+Cours
    const latestPaiementMap = new Map();

    for (const p of paiements) {
      const key = `${p.etudiant?._id}_${p.cours}`;
      if (!latestPaiementMap.has(key)) {
        latestPaiementMap.set(key, p);
      }
    }

    const expirés = [];

    for (const paiement of latestPaiementMap.values()) {
      if (!paiement.etudiant?.actif) continue;

      const debut = new Date(paiement.moisDebut);
      const fin = new Date(debut);
      fin.setMonth(fin.getMonth() + Number(paiement.nombreMois));

      if (fin < aujourdHui) {
        expirés.push(paiement);
      }
    }

    res.json(expirés);
  } catch (err) {
    console.error('Erreur serveur /exp:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
// ✅ Route pour supprimer un message
app.delete('/api/messages/:messageId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token, 'jwt_secret_key');
    const messageId = req.params.messageId;

    // Vérifier si le message existe
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est l'expéditeur du message
    if (message.expediteur.toString() !== decoded.id) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce message' });
    }

    // Supprimer le message
    await Message.findByIdAndDelete(messageId);
    
    res.json({ 
      message: 'Message supprimé avec succès', 
      messageId: messageId 
    });
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route pour marquer un message comme lu
app.patch('/api/messages/:messageId/read', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token, 'jwt_secret_key');
    const messageId = req.params.messageId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est le destinataire
    if (message.destinataire.toString() !== decoded.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Marquer comme lu
    message.lu = true;
    message.dateLecture = new Date();
    await message.save();

    res.json({ message: 'Message marqué comme lu' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route pour obtenir le nombre de messages non lus
app.get('/api/messages/unread-count', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token, 'jwt_secret_key');
    const userId = decoded.id;
    const role = decoded.role === 'etudiant' ? 'Etudiant' : 'Professeur';

    const unreadCount = await Message.countDocuments({
      destinataire: userId,
      roleDestinataire: role,
      lu: { $ne: true }
    });

    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route pour obtenir les messages non lus par expéditeur
app.get('/api/messages/unread-by-sender', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token, 'jwt_secret_key');
    const userId = decoded.id;
    const role = decoded.role === 'etudiant' ? 'Etudiant' : 'Professeur';

    const unreadMessages = await Message.aggregate([
      {
        $match: {
          destinataire: new mongoose.Types.ObjectId(userId),
          roleDestinataire: role,
          lu: { $ne: true }
        }
      },
      {
        $group: {
          _id: '$expediteur',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convertir en objet pour faciliter l'utilisation côté frontend
    const unreadCounts = {};
    unreadMessages.forEach(item => {
      unreadCounts[item._id.toString()] = item.count;
    });

    res.json(unreadCounts);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
app.put('/api/rappels/:id', async (req, res) => {
  try {
    const { dateRappel, note } = req.body;
    const updated = await Rappel.findByIdAndUpdate(
      req.params.id,
      { dateRappel, note },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rappels', async (req, res) => {
  try {
    console.log('📥 Body reçu:', req.body); // <= هذا مهم
    const { etudiant, cours, montantRestant, note, dateRappel } = req.body;

    if (!etudiant || !cours || !montantRestant || !dateRappel) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const rappel = new Rappel({ etudiant, cours, montantRestant, note, dateRappel });
    await rappel.save();
    res.status(201).json(rappel);
  } catch (err) {
    console.error('❌ Erreur POST /rappels:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.get('/api/rappels', async (req, res) => {
  try {
    const rappels = await Rappel.find({ status: 'actif' })
      .populate('etudiant', 'nomComplet'); // نجلب فقط الاسم الكامل

    res.json(rappels); // نرسلها للـ frontend
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
app.delete('/api/rappels/:id', async (req, res) => {
  try {
    await Rappel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rappel supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route pour envoyer un message
app.post('/api/messages', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token, 'jwt_secret_key');
    const { contenu, destinataireId, roleDestinataire } = req.body;

    if (!contenu || !destinataireId || !roleDestinataire) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const message = new Message({
      contenu,
      destinataire: destinataireId,
      expediteur: decoded.id,
      roleExpediteur: decoded.role === 'etudiant' ? 'Etudiant' : 'Professeur',
      roleDestinataire,
      date: new Date(),
      lu: false
    });

    // Ajouter les champs pour la filtration
    if (decoded.role === 'etudiant') {
      message.professeur = destinataireId;
      message.etudiant = decoded.id;
    } else if (decoded.role === 'prof') {
      message.professeur = decoded.id;
      message.etudiant = destinataireId;
    }

    const savedMessage = await message.save();
    
    // Populer les données pour la réponse
    await savedMessage.populate('expediteur', 'nom nomComplet email');
    await savedMessage.populate('destinataire', 'nom nomComplet email');

    res.status(201).json({ 
      message: 'Message envoyé avec succès', 
      data: savedMessage 
    });
  } catch (err) {
    console.error('Erreur lors de l\'envoi:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route pour marquer tous les messages d'une conversation comme lus
app.patch('/api/messages/mark-conversation-read', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token, 'jwt_secret_key');
    const { expediteurId } = req.body;

    if (!expediteurId) {
      return res.status(400).json({ message: 'ID de l\'expéditeur manquant' });
    }

    const role = decoded.role === 'etudiant' ? 'Etudiant' : 'Professeur';

    await Message.updateMany(
      {
        destinataire: decoded.id,
        roleDestinataire: role,
        expediteur: expediteurId,
        lu: { $ne: true }
      },
      {
        $set: {
          lu: true,
          dateLecture: new Date()
        }
      }
    );

    res.json({ message: 'Messages marqués comme lus' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route pour obtenir tous les messages pour un utilisateur
app.get('/api/messages', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token, 'jwt_secret_key');
    const userId = decoded.id;
    const role = decoded.role === 'etudiant' ? 'Etudiant' : 'Professeur';

    const messages = await Message.find({
      $or: [
        { destinataire: userId, roleDestinataire: role },
        { expediteur: userId, roleExpediteur: role }
      ]
    })
    .sort({ date: -1 })
    .populate('expediteur', 'nom nomComplet email')
    .populate('destinataire', 'nom nomComplet email');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route pour obtenir les messages entre un professeur et un étudiant spécifique (pour le professeur)
app.get('/api/messages/professeur/:etudiantId', authProfesseur, async (req, res) => {
  try {
    const messages = await Message.find({
      professeur: req.professeurId,
      etudiant: req.params.etudiantId
    })
    .sort({ date: 1 })
    .populate('expediteur', 'nom nomComplet')
    .populate('destinataire', 'nom nomComplet');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route pour obtenir les messages entre un étudiant et un professeur spécifique (pour l'étudiant)
app.get('/api/messages/etudiant/:professeurId', authEtudiant, async (req, res) => {
  try {
    const messages = await Message.find({
      professeur: req.params.professeurId,
      etudiant: req.etudiantId
    })
    .sort({ date: 1 })
    .populate('expediteur', 'nom nomComplet')
    .populate('destinataire', 'nom nomComplet');

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route pour obtenir les professeurs de l'étudiant
app.get('/api/etudiant/mes-professeurs', authEtudiant, async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiantId);
    const coursEtudiant = etudiant.cours;

    const professeurs = await Professeur.find({
      cours: { $in: coursEtudiant },
      actif: true
    }).select('_id nom cours image genre');

    res.json(professeurs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route pour obtenir les professeurs avec leurs derniers messages (pour l'étudiant)


// ✅ Route pour vérifier le statut en ligne des utilisateurs
app.get('/api/users/online-status', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    // Pour une vraie application, vous devriez implémenter un système de présence
    // Ici, on simule avec des utilisateurs aléatoires en ligne
    const onlineUsers = []; // Remplacez par votre logique de présence

    res.json({ onlineUsers });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ Route pour obtenir les informations de l'utilisateur actuel (étudiant)
app.get('/api/messages/notifications-etudiant', authEtudiant, async (req, res) => {
  try {
    const messages = await Message.find({
      destinataire: req.etudiantId,
      roleDestinataire: 'Etudiant',
      lu: false
    })
    .sort({ date: -1 })
    .limit(10)
    .populate({
      path: 'expediteur',
      select: 'nom nomComplet email image',
      model: 'Professeur'
    });

    res.json(messages);
  } catch (err) {
    console.error('Erreur chargement notifications messages:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.get('/api/messages/notifications-professeur', authProfesseur, async (req, res) => {
  try {
    const messages = await Message.find({
      destinataire: req.professeurId,
      roleDestinataire: 'Professeur',
      lu: false
    })
    .sort({ date: -1 })
    .limit(10)
    .populate({
      path: 'expediteur',
      select: 'nom nomComplet email',
      model: 'Etudiant'
    });

    res.json(messages);
  } catch (err) {
    console.error('Erreur notifications professeur:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Route : GET /api/messages/notifications-etudiant
app.get('/notifications-etudiant', authEtudiant, async (req, res) => {
  try {
    const messages = await Message.find({
      etudiant: req.etudiantId,
      roleExpediteur: 'Professeur',
      lu: false
    })
    .populate('professeur', 'nom image')
    .sort({ date: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Exemple Express
// backend route

app.put('/update-profil', authAdmin, async (req, res) => {
  const { nom, email, ancienMotDePasse, nouveauMotDePasse } = req.body;

  try {
    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.status(404).json({ message: 'Admin introuvable' });

    // Mise à jour du nom si fourni
    if (nom) {
      admin.nom = nom;
    }

    // Mise à jour de l'email si fourni
    if (email) {
      admin.email = email;
    }

    // Mise à jour du mot de passe si fourni
    if (ancienMotDePasse && nouveauMotDePasse) {
      const isMatch = await bcrypt.compare(ancienMotDePasse, admin.motDePasse);
      if (!isMatch) return res.status(401).json({ message: 'Ancien mot de passe incorrect' });

      const salt = await bcrypt.genSalt(10);
      admin.motDePasse = await bcrypt.hash(nouveauMotDePasse, salt);
    }

    await admin.save();
    res.json({ 
      message: 'Profil mis à jour avec succès',
      admin: {
        id: admin._id,
        nom: admin.nom,
        email: admin.email
      }
    });

  } catch (err) {
    console.error('Erreur update admin:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
app.get('/api/professeur/mes-etudiants-messages', authProfesseur, async (req, res) => {
  try {
    // 1. Récupérer les cours du professeur connecté
    const professeur = await Professeur.findById(req.professeurId).select('cours');
    if (!professeur) {
      return res.status(404).json({ message: 'Professeur introuvable' });
    }

    // 2. Trouver les étudiants qui ont au moins un cours commun
    const etudiants = await Etudiant.find({
      cours: { $in: professeur.cours }
    }).select('_id nomComplet email image genre lastSeen cours');

    // 3. Récupérer les messages de ce professeur
    const messages = await Message.find({ professeur: req.professeurId }).sort({ date: -1 });

    // 4. Mapper le dernier message par étudiant
    const lastMessagesMap = new Map();
    for (const msg of messages) {
      const etuId = msg.etudiant.toString();
      if (!lastMessagesMap.has(etuId)) {
        lastMessagesMap.set(etuId, {
          contenu: msg.contenu,
          date: msg.date,
          roleExpediteur: msg.roleExpediteur,
          fichier: msg.fichier
        });
      }
    }

    // 5. Fusionner les données des étudiants avec leur dernier message
    const result = etudiants.map(etudiant => ({
      ...etudiant.toObject(),
      dernierMessage: lastMessagesMap.get(etudiant._id.toString()) || null
    }));

    res.json(result);
  } catch (err) {
    console.error('Erreur lors de la récupération des étudiants:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

app.post('/api/messages/upload-prof', authProfesseur, uploadMessageFile.single('fichier'), async (req, res) => {
  try {
    const { contenu, destinataireId, roleDestinataire } = req.body;

    const hasContenu = contenu && contenu.trim() !== '';
    const hasFile = !!req.file;

    if (!hasContenu && !hasFile) {
      return res.status(400).json({ message: 'يجب أن يحتوي الرسالة على نص أو ملف مرفق' });
    }

    const messageData = {
      expediteur: req.professeurId,
      roleExpediteur: 'Professeur',
      destinataire: destinataireId,
      roleDestinataire: 'Etudiant',
      professeur: req.professeurId,
      etudiant: destinataireId,
    };

    if (hasContenu) messageData.contenu = contenu.trim();
    if (hasFile) messageData.fichier = `/uploads/messages/${req.file.filename}`;

    const newMessage = new Message(messageData);
    await newMessage.save();

    res.status(201).json({
      message: 'تم إرسال الرسالة بنجاح',
      data: newMessage,
    });
  } catch (err) {
    console.error('خطأ أثناء إرسال الرسالة من الأستاذ:', err);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});
// ✅ Route pour obtenir les informations du professeur connecté
app.get('/api/professeur/me', authProfesseur, async (req, res) => {
  try {
    const professeur = await Professeur.findById(req.professeurId).select('-motDePasse');
    if (!professeur) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }
    res.json(professeur);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});