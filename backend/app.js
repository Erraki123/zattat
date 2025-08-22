const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Actualite = require('./models/Actualite');
const Commercial = require('./models/commercialModel');
const Bulletin = require('./models/Bulletin'); // Ajustez le chemin selon votre structure
const { NotificationSupprimee, Configuration } = require('./models/notificationModel');
const authPaiementManager = require('./middlewares/authPaiementManager');
const authAdminOrPaiementManager = require('./middlewares/authAdminOrPaiementManager');

const ContactMessage = require('./models/contactModel');
const Activity = require('./models/Activity');

const Etudiant = require('./models/etudiantModel');
const multer = require('multer');
const path = require('path');
const uploadMessageFile = require('./middlewares/uploadMessageFile');
const Rappel = require('./models/RappelPaiement');
const Cours = require('./models/coursModel');
const Evenement = require('./models/evenementModel');
const Presence = require('./models/presenceModel');
const Professeur = require('./models/professeurModel'); // تأكد أنك أنشأت هذا الملف
const authAdmin = require('./middlewares/authAdmin');
const authProfesseur = require('./middlewares/authProfesseur');
const authEtudiant = require('./middlewares/authEtudiant');
const Document = require('./models/documentModel');
const Exercice = require('./models/exerciceModel');
const Paiement = require('./models/paiementModel'); // تأكد أنك قمت بإنشاء الملف
// Ajoutez cette ligne avec vos autres imports de modèles
const PaiementManager = require('./models/paiementManagerModel'); // Ajustez le chemin selon votre structure
const Message = require('./models/messageModel');
const Seance = require('./models/Seance');

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
const storageVieScolaire = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'uploads/vieScolaire');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const uploadVieScolaire = multer({ storage: storageVieScolaire });

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
  try {
    console.log('🔐 Tentative de connexion reçue');
    console.log('📧 Email:', req.body.email);
    console.log('🔑 Password provided:', !!req.body.motDePasse);
    
    const { email, motDePasse } = req.body;

    // ✅ Validation des données d'entrée
    if (!email || !motDePasse) {
      console.log('❌ Données manquantes');
      return res.status(400).json({ 
        message: 'Email et mot de passe sont requis' 
      });
    }

    // Normaliser l'email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('📧 Email normalisé:', normalizedEmail);

    // ✅ Essayer comme admin
    console.log('🔍 Recherche admin...');
    const admin = await Admin.findOne({ email: normalizedEmail });
    console.log('👤 Admin trouvé:', !!admin);
    
    if (admin && await bcrypt.compare(motDePasse, admin.motDePasse)) {
      console.log('✅ Admin authentifié avec succès');
      const token = jwt.sign(
        { id: admin._id, role: 'admin' }, 
        'jwt_secret_key', 
        { expiresIn: '7d' }
      );
      
      // Ne pas retourner le mot de passe
      const adminSafe = { ...admin.toObject() };
      delete adminSafe.motDePasse;
      
      return res.json({ 
        user: adminSafe, 
        token, 
        role: 'admin' 
      });
    }

    // ✅ Essayer comme gestionnaire de paiement
    console.log('🔍 Recherche gestionnaire de paiement...');
    const paiementManager = await PaiementManager.findOne({ email: normalizedEmail });
    console.log('💳 PaiementManager trouvé:', !!paiementManager);
    
    if (paiementManager) {
      console.log('🔐 Vérification mot de passe gestionnaire...');
      const passwordMatch = await paiementManager.comparePassword(motDePasse);
      console.log('✅ Password match:', passwordMatch);
      
      if (passwordMatch) {
        if (!paiementManager.actif) {
          console.log('❌ Gestionnaire inactif');
          return res.status(403).json({ 
            message: '⛔ Votre compte gestionnaire est inactif. Contactez l\'administration.' 
          });
        }

        console.log('✅ Gestionnaire authentifié avec succès');
        
        // Mise à jour de lastSeen
        paiementManager.lastSeen = new Date();
        await paiementManager.save();

        const token = jwt.sign(
          { id: paiementManager._id, role: 'paiement_manager' }, 
          'jwt_secret_key', 
          { expiresIn: '7d' }
        );
        
        // Utiliser la méthode toSafeObject si elle existe
        const managerSafe = paiementManager.toSafeObject ? 
          paiementManager.toSafeObject() : 
          (() => {
            const obj = paiementManager.toObject();
            delete obj.motDePasse;
            return obj;
          })();

        return res.json({ 
          user: managerSafe, 
          token, 
          role: 'paiement_manager' 
        });
      }
    }

    // ✅ Essayer comme professeur (si le modèle existe)
    if (typeof Professeur !== 'undefined') {
      console.log('🔍 Recherche professeur...');
      const professeur = await Professeur.findOne({ email: normalizedEmail });
      console.log('👨‍🏫 Professeur trouvé:', !!professeur);
      
      if (professeur && await professeur.comparePassword(motDePasse)) {
        if (!professeur.actif) {
          return res.status(403).json({ 
            message: '⛔️ Votre compte est inactif. Veuillez contacter l\'administration.' 
          });
        }

        console.log('✅ Professeur authentifié avec succès');

        // Mise à jour de lastSeen
        professeur.lastSeen = new Date();
        await professeur.save();

        const token = jwt.sign(
          { id: professeur._id, role: 'prof' }, 
          'jwt_secret_key', 
          { expiresIn: '7d' }
        );
        
        const professeurSafe = professeur.toSafeObject ? 
          professeur.toSafeObject() : 
          (() => {
            const obj = professeur.toObject();
            delete obj.motDePasse;
            return obj;
          })();

        return res.json({ 
          user: professeurSafe, 
          token, 
          role: 'prof' 
        });
      }
    }

    // ✅ Essayer comme étudiant (si le modèle existe)
    if (typeof Etudiant !== 'undefined') {
      console.log('🔍 Recherche étudiant...');
      const etudiant = await Etudiant.findOne({ email: normalizedEmail });
      console.log('🎓 Etudiant trouvé:', !!etudiant);
      
      if (etudiant && await bcrypt.compare(motDePasse, etudiant.motDePasse)) {
        if (!etudiant.actif) {
          return res.status(403).json({ 
            message: '⛔️ Votre compte est désactivé. Contactez l\'administration.' 
          });
        }

        console.log('✅ Etudiant authentifié avec succès');

        // Mise à jour de lastSeen
        etudiant.lastSeen = new Date();
        await etudiant.save();

        const token = jwt.sign(
          { id: etudiant._id, role: 'etudiant' }, 
          'jwt_secret_key', 
          { expiresIn: '7d' }
        );
        
        const etudiantSafe = { ...etudiant.toObject() };
        delete etudiantSafe.motDePasse;

        return res.json({ 
          user: etudiantSafe, 
          token, 
          role: 'etudiant' 
        });
      }
    }

    // ❌ Si aucun ne correspond
    console.log('❌ Aucune correspondance trouvée');
    return res.status(401).json({ 
      message: 'Email ou mot de passe incorrect' 
    });

  } catch (error) {
    console.error('💥 Erreur lors de la connexion:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ 
      message: 'Erreur serveur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/etudiant/notifications', authEtudiant, async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiantId);
    const aujourdHui = new Date();

    const paiements = await Paiement.find({ etudiant: req.etudiantId });

    // Grouper les paiements par cours
    const paiementsParCours = new Map();

    for (const p of paiements) {
      for (const nomCours of p.cours) {
        if (!paiementsParCours.has(nomCours)) {
          paiementsParCours.set(nomCours, []);
        }
        paiementsParCours.get(nomCours).push(p);
      }
    }

    const notifications = [];

    for (const [cours, paiementsCours] of paiementsParCours.entries()) {
      // Construire les périodes {debut, fin} pour chaque paiement
      const periodes = paiementsCours.map(p => {
        const debut = new Date(p.moisDebut);
        const fin = new Date(debut);
        fin.setMonth(fin.getMonth() + p.nombreMois);
        return { debut, fin };
      });

      // Trier les périodes par date de début
      periodes.sort((a, b) => a.debut - b.debut);

      // Fusionner les périodes qui se chevauchent ou se suivent
      const fusionnees = [];
      let current = periodes[0];

      for (let i = 1; i < periodes.length; i++) {
        const next = periodes[i];
        if (next.debut <= current.fin) {
          // Chevauchement ou continuité
          current.fin = new Date(Math.max(current.fin.getTime(), next.fin.getTime()));
        } else {
          fusionnees.push(current);
          current = next;
        }
      }
      fusionnees.push(current);

      // Vérifier si aujourd'hui est dans une des périodes fusionnées
      let estActif = false;
      let joursRestants = null;

      for (const periode of fusionnees) {
        if (aujourdHui >= periode.debut && aujourdHui <= periode.fin) {
          estActif = true;
          joursRestants = Math.ceil((periode.fin - aujourdHui) / (1000 * 60 * 60 * 24));
          break;
        }
      }

      if (!estActif) {
        const derniereFin = fusionnees[fusionnees.length - 1].fin;
        const joursDepuis = Math.ceil((aujourdHui - derniereFin) / (1000 * 60 * 60 * 24));
        notifications.push({
          type: 'paiement_expire',
          cours,
          message: `💰 Le paiement pour le cours "${cours}" a expiré depuis ${joursDepuis} jour(s).`
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

// ===== ROUTE POST - CRÉATION D'UN ÉTUDIANT =====
app.post('/api/etudiants', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const {
      nomComplet,
      genre,
      dateNaissance,
      telephoneEtudiant,
      telephonePere,
      telephoneMere,
      codeMassar,
      adresse,
      email,
      motDePasse,
      niveau, // Ajout du champ niveau qui était dans le schéma mais pas dans la route
      prixTotal,
      paye,
      pourcentageBourse,
      typePaiement,
      anneeScolaire
    } = req.body;

    let { cours, actif } = req.body;

    // ===== VALIDATION DES CHAMPS OBLIGATOIRES =====
    const champsObligatoires = {
      nomComplet: 'Nom complet',
      genre: 'Genre',
      dateNaissance: 'Date de naissance',
      telephoneEtudiant: 'Téléphone étudiant',
      codeMassar: 'Code Massar',
      email: 'Email',
      motDePasse: 'Mot de passe',
      niveau: 'Niveau scolaire',
      anneeScolaire: 'Année scolaire'
    };

    const champsManquants = [];
    for (const [champ, nom] of Object.entries(champsObligatoires)) {
      if (!req.body[champ] || req.body[champ].toString().trim() === '') {
        champsManquants.push(nom);
      }
    }

    if (champsManquants.length > 0) {
      return res.status(400).json({
        message: `Les champs suivants sont obligatoires: ${champsManquants.join(', ')}`
      });
    }

    // ===== VALIDATION DES FORMATS =====
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }

    // Validation du mot de passe
    if (motDePasse.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Validation de l'année scolaire
    const anneeScolaireRegex = /^\d{4}\/\d{4}$/;
    if (!anneeScolaireRegex.test(anneeScolaire.trim())) {
      return res.status(400).json({ message: 'L\'année scolaire doit être au format YYYY/YYYY (ex: 2025/2026)' });
    }

    // Validation du niveau scolaire
    const niveaux = [
      "6ème Collège", "5ème Collège", "4ème Collège", "3ème Collège",
      "Tronc Commun Scientifique", "Tronc Commun Littéraire", "Tronc Commun Technique",
      "1BAC SM", "1BAC PC", "1BAC SVT", "1BAC Lettres", "1BAC Économie", "1BAC Technique",
      "2BAC SMA", "2BAC SMB", "2BAC PC", "2BAC SVT", "2BAC Lettres", "2BAC Économie", "2BAC Technique"
    ];
    
    if (!niveaux.includes(niveau)) {
      return res.status(400).json({ 
        message: 'Niveau scolaire invalide',
        niveauxValides: niveaux
      });
    }

    // Validation du genre
    if (!['Homme', 'Femme'].includes(genre)) {
      return res.status(400).json({ message: 'Le genre doit être "Homme" ou "Femme"' });
    }

    // Validation des numéros de téléphone
    const phoneRegex = /^[0-9+\-\s]{8,15}$/;
    if (!phoneRegex.test(telephoneEtudiant.trim())) {
      return res.status(400).json({ message: 'Format de téléphone étudiant invalide' });
    }

    if (telephonePere && telephonePere.trim() && !phoneRegex.test(telephonePere.trim())) {
      return res.status(400).json({ message: 'Format de téléphone père invalide' });
    }

    if (telephoneMere && telephoneMere.trim() && !phoneRegex.test(telephoneMere.trim())) {
      return res.status(400).json({ message: 'Format de téléphone mère invalide' });
    }

    // ===== VÉRIFICATION D'UNICITÉ =====
    
    // Vérifications en parallèle pour optimiser les performances
    const [emailExistant, massarExistant] = await Promise.all([
      Etudiant.findOne({ email: email.toLowerCase().trim() }),
      Etudiant.findOne({ codeMassar: codeMassar.trim() })
    ]);

    if (emailExistant) {
      return res.status(400).json({ message: 'Email déjà utilisé par un autre étudiant' });
    }

    if (massarExistant) {
      return res.status(400).json({ message: 'Code Massar déjà utilisé par un autre étudiant' });
    }

    // ===== TRAITEMENT ET VALIDATION DES DONNÉES =====
    
    // Fonctions utilitaires pour la conversion des données
    const toBool = (v) => v === 'true' || v === true;
    const toNumber = (v) => {
      if (!v || v === '') return 0;
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    };

    const toDate = (d) => {
      if (!d) return null;
      const date = new Date(d);
      return isNaN(date.getTime()) ? null : date;
    };

    // Conversion et validation des données numériques
    const prixTotalNum = toNumber(prixTotal);
    const pourcentageBourseNum = toNumber(pourcentageBourse);

    if (prixTotalNum < 0) {
      return res.status(400).json({ message: 'Le prix total ne peut pas être négatif' });
    }

    if (pourcentageBourseNum < 0 || pourcentageBourseNum > 100) {
      return res.status(400).json({ message: 'Le pourcentage de bourse doit être entre 0 et 100' });
    }

    // Validation du type de paiement
    const typesValides = ['Cash', 'Virement', 'Chèque', 'En ligne'];
    const typePaySelected = typePaiement || 'Cash';
    if (!typesValides.includes(typePaySelected)) {
      return res.status(400).json({ 
        message: `Type de paiement invalide. Types valides: ${typesValides.join(', ')}` 
      });
    }

    // Conversion et validation de la date de naissance
    const dateNaissanceFormatted = toDate(dateNaissance);
    if (!dateNaissanceFormatted) {
      return res.status(400).json({ message: 'Format de date de naissance invalide' });
    }

    // Vérifier que l'étudiant n'est pas trop jeune ou trop vieux
    const aujourdhui = new Date();
    const age = aujourdhui.getFullYear() - dateNaissanceFormatted.getFullYear();
    if (age < 10 || age > 25) {
      return res.status(400).json({ message: 'L\'âge de l\'étudiant doit être entre 10 et 25 ans' });
    }

    // Traitement des cours
    if (typeof cours === 'string') {
      cours = cours.split(',').map(c => c.trim()).filter(c => c.length > 0);
    } else if (!Array.isArray(cours)) {
      cours = [];
    }

    // Conversion des booléens
    const actifBool = actif !== undefined ? toBool(actif) : true; // Par défaut actif
    const payeBool = toBool(paye);

    // ===== TRAITEMENT DE L'IMAGE =====
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    // ===== HACHAGE DU MOT DE PASSE =====
    const hashedPassword = await bcrypt.hash(motDePasse, 12); // Augmentation de la sécurité

    // ===== CRÉATION DE L'ÉTUDIANT =====
    const etudiantData = {
      // Champs de base
      nomComplet: nomComplet.trim(),
      genre,
      niveau,
      dateNaissance: dateNaissanceFormatted,
      telephoneEtudiant: telephoneEtudiant.trim(),
      telephonePere: telephonePere?.trim() || '',
      telephoneMere: telephoneMere?.trim() || '',
      codeMassar: codeMassar.trim(),
      adresse: adresse?.trim() || '',
      email: email.toLowerCase().trim(),
      motDePasse: hashedPassword,
      cours: cours,
      image: imagePath,
      actif: actifBool,
      creeParAdmin: req.adminId,
      
      // Champs de paiement
      prixTotal: prixTotalNum,
      paye: payeBool,
      pourcentageBourse: pourcentageBourseNum,
      typePaiement: typePaySelected,
      anneeScolaire: anneeScolaire.trim()
    };

    // Création et sauvegarde de l'étudiant
    const etudiant = new Etudiant(etudiantData);
    const etudiantSauve = await etudiant.save();

    // ===== PRÉPARATION DE LA RÉPONSE =====
    const etudiantResponse = etudiantSauve.toObject();
    delete etudiantResponse.motDePasse;

    // Calcul des informations de paiement
    const montantBourse = (prixTotalNum * pourcentageBourseNum) / 100;
    const montantAPayer = prixTotalNum - montantBourse;
    
    res.status(201).json({
      message: 'Étudiant créé avec succès',
      etudiant: etudiantResponse,
      infosPaiement: {
        montantTotal: prixTotalNum,
        montantBourse: montantBourse,
        montantAPayer: montantAPayer,
        pourcentageBourse: pourcentageBourseNum,
        typePaiement: typePaySelected,
        statutPaiement: payeBool ? 'Payé' : (prixTotalNum === 0 ? 'Gratuit' : 'En attente')
      },
      metadata: {
        anneeScolaire: anneeScolaire.trim(),
        niveau: niveau,
        nombreCours: cours.length,
        dateCreation: etudiantSauve.createdAt
      }
    });

  } catch (err) {
    console.error('❌ Erreur ajout étudiant:', err);
    
    // Gestion des erreurs de validation Mongoose
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors 
      });
    }
    
    // Gestion des erreurs de duplicata (index unique)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const fieldNames = {
        email: 'Email',
        codeMassar: 'Code Massar'
      };
      return res.status(400).json({ 
        message: `${fieldNames[field] || field} déjà utilisé par un autre étudiant` 
      });
    }

    // Gestion des erreurs de cast (types invalides)
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: `Format invalide pour le champ ${err.path}`
      });
    }

    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
  }
});

// ===== ROUTE PUT - MISE À JOUR D'UN ÉTUDIANT =====
app.put('/api/etudiants/:id', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const {
      nomComplet,
      genre,
      dateNaissance,
      telephoneEtudiant,
      telephonePere,
      telephoneMere,
      codeMassar,
      adresse,
      email,
      motDePasse,
      niveau, // Ajout du champ niveau
      prixTotal,
      paye,
      pourcentageBourse,
      typePaiement,
      anneeScolaire
    } = req.body;

    let { cours, actif } = req.body;

    // ===== VALIDATION DE L'ID =====
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID d\'étudiant invalide' });
    }

    // ===== VÉRIFICATION DE L'EXISTENCE DE L'ÉTUDIANT =====
    const etudiantExistant = await Etudiant.findById(req.params.id);
    if (!etudiantExistant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    // ===== VALIDATION DES CHAMPS OBLIGATOIRES =====
    const champsObligatoires = {
      nomComplet: 'Nom complet',
      genre: 'Genre',
      dateNaissance: 'Date de naissance',
      telephoneEtudiant: 'Téléphone étudiant',
      codeMassar: 'Code Massar',
      email: 'Email',
      niveau: 'Niveau scolaire',
      anneeScolaire: 'Année scolaire'
    };

    const champsManquants = [];
    for (const [champ, nom] of Object.entries(champsObligatoires)) {
      if (!req.body[champ] || req.body[champ].toString().trim() === '') {
        champsManquants.push(nom);
      }
    }

    if (champsManquants.length > 0) {
      return res.status(400).json({
        message: `Les champs suivants sont obligatoires: ${champsManquants.join(', ')}`
      });
    }

    // ===== VALIDATION DES FORMATS =====
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }

    // Validation de l'année scolaire
    const anneeScolaireRegex = /^\d{4}\/\d{4}$/;
    if (!anneeScolaireRegex.test(anneeScolaire.trim())) {
      return res.status(400).json({ message: 'L\'année scolaire doit être au format YYYY/YYYY (ex: 2025/2026)' });
    }

    // Validation du niveau scolaire
    const niveaux = [
      "6ème Collège", "5ème Collège", "4ème Collège", "3ème Collège",
      "Tronc Commun Scientifique", "Tronc Commun Littéraire", "Tronc Commun Technique",
      "1BAC SM", "1BAC PC", "1BAC SVT", "1BAC Lettres", "1BAC Économie", "1BAC Technique",
      "2BAC SMA", "2BAC SMB", "2BAC PC", "2BAC SVT", "2BAC Lettres", "2BAC Économie", "2BAC Technique"
    ];
    
    if (!niveaux.includes(niveau)) {
      return res.status(400).json({ 
        message: 'Niveau scolaire invalide',
        niveauxValides: niveaux
      });
    }

    // Validation du genre
    if (!['Homme', 'Femme'].includes(genre)) {
      return res.status(400).json({ message: 'Le genre doit être "Homme" ou "Femme"' });
    }

    // Validation des numéros de téléphone
    const phoneRegex = /^[0-9+\-\s]{8,15}$/;
    if (!phoneRegex.test(telephoneEtudiant.trim())) {
      return res.status(400).json({ message: 'Format de téléphone étudiant invalide' });
    }

    if (telephonePere && telephonePere.trim() && !phoneRegex.test(telephonePere.trim())) {
      return res.status(400).json({ message: 'Format de téléphone père invalide' });
    }

    if (telephoneMere && telephoneMere.trim() && !phoneRegex.test(telephoneMere.trim())) {
      return res.status(400).json({ message: 'Format de téléphone mère invalide' });
    }

    // ===== VÉRIFICATION D'UNICITÉ (sauf pour l'étudiant actuel) =====
    
    // Vérifications en parallèle pour optimiser les performances
    const [emailExistant, massarExistant] = await Promise.all([
      Etudiant.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: req.params.id } 
      }),
      Etudiant.findOne({ 
        codeMassar: codeMassar.trim(), 
        _id: { $ne: req.params.id } 
      })
    ]);

    if (emailExistant) {
      return res.status(400).json({ message: 'Email déjà utilisé par un autre étudiant' });
    }

    if (massarExistant) {
      return res.status(400).json({ message: 'Code Massar déjà utilisé par un autre étudiant' });
    }

    // ===== TRAITEMENT ET VALIDATION DES DONNÉES =====
    
    // Fonctions utilitaires pour la conversion des données
    const toBool = (v) => v === 'true' || v === true;
    const toNumber = (v) => {
      if (!v || v === '') return 0;
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    };

    const toDate = (d) => {
      if (!d) return null;
      const date = new Date(d);
      return isNaN(date.getTime()) ? null : date;
    };

    // Conversion et validation des données numériques
    const prixTotalNum = toNumber(prixTotal);
    const pourcentageBourseNum = toNumber(pourcentageBourse);

    if (prixTotalNum < 0) {
      return res.status(400).json({ message: 'Le prix total ne peut pas être négatif' });
    }

    if (pourcentageBourseNum < 0 || pourcentageBourseNum > 100) {
      return res.status(400).json({ message: 'Le pourcentage de bourse doit être entre 0 et 100' });
    }

    // Validation du type de paiement
    const typesValides = ['Cash', 'Virement', 'Chèque', 'En ligne'];
    const typePaySelected = typePaiement || 'Cash';
    if (!typesValides.includes(typePaySelected)) {
      return res.status(400).json({ 
        message: `Type de paiement invalide. Types valides: ${typesValides.join(', ')}` 
      });
    }

    // Conversion et validation de la date de naissance
    const dateNaissanceFormatted = toDate(dateNaissance);
    if (!dateNaissanceFormatted) {
      return res.status(400).json({ message: 'Format de date de naissance invalide' });
    }

    // Vérifier que l'étudiant n'est pas trop jeune ou trop vieux
    const aujourdhui = new Date();
    const age = aujourdhui.getFullYear() - dateNaissanceFormatted.getFullYear();
    if (age < 10 || age > 25) {
      return res.status(400).json({ message: 'L\'âge de l\'étudiant doit être entre 10 et 25 ans' });
    }

    // Traitement des cours
    if (typeof cours === 'string') {
      cours = cours.split(',').map(c => c.trim()).filter(c => c.length > 0);
    } else if (!Array.isArray(cours)) {
      cours = cours !== undefined ? [] : etudiantExistant.cours; // Garder les cours existants si non fourni
    }

    // Conversion des booléens avec valeurs par défaut
    const actifBool = actif !== undefined ? toBool(actif) : etudiantExistant.actif;
    const payeBool = paye !== undefined ? toBool(paye) : etudiantExistant.paye;

    // ===== PRÉPARATION DES DONNÉES DE MISE À JOUR =====
    const updateData = {
      // Champs de base
      nomComplet: nomComplet.trim(),
      genre,
      niveau,
      dateNaissance: dateNaissanceFormatted,
      telephoneEtudiant: telephoneEtudiant.trim(),
      telephonePere: telephonePere?.trim() || '',
      telephoneMere: telephoneMere?.trim() || '',
      codeMassar: codeMassar.trim(),
      adresse: adresse?.trim() || '',
      email: email.toLowerCase().trim(),
      cours: cours,
      actif: actifBool,
      
      // Champs de paiement
      prixTotal: prixTotalNum,
      paye: payeBool,
      pourcentageBourse: pourcentageBourseNum,
      typePaiement: typePaySelected,
      anneeScolaire: anneeScolaire.trim()
    };

    // ===== TRAITEMENT DE L'IMAGE =====
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
      
      // Optionnel: Supprimer l'ancienne image du serveur
      if (etudiantExistant.image && etudiantExistant.image !== '') {
        const fs = require('fs').promises;
        const path = require('path');
        try {
          const oldImagePath = path.join(__dirname, '..', etudiantExistant.image);
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.warn('⚠️ Impossible de supprimer l\'ancienne image:', err.message);
        }
      }
    }

    // ===== TRAITEMENT DU MOT DE PASSE =====
    if (motDePasse && motDePasse.trim() !== '') {
      // Validation du mot de passe
      if (motDePasse.length < 6) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      const hashedPassword = await bcrypt.hash(motDePasse, 12); // Augmentation de la sécurité
      updateData.motDePasse = hashedPassword;
    }

    // ===== MISE À JOUR DE L'ÉTUDIANT =====
    const updated = await Etudiant.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      {
        new: true,
        runValidators: true
      }
    ).select(''); // Ne pas retourner le mot de passe

    if (!updated) {
      return res.status(404).json({ message: 'Erreur lors de la mise à jour de l\'étudiant' });
    }

    // ===== PRÉPARATION DE LA RÉPONSE =====
    const etudiantResponse = updated.toObject();

    // Calcul des informations de paiement
    const montantBourse = (prixTotalNum * pourcentageBourseNum) / 100;
    const montantAPayer = prixTotalNum - montantBourse;

    // Détection des changements importants
    const changementsImportants = [];
    if (etudiantExistant.email !== updateData.email) {
      changementsImportants.push('Email modifié');
    }
    if (etudiantExistant.codeMassar !== updateData.codeMassar) {
      changementsImportants.push('Code Massar modifié');
    }
    if (etudiantExistant.paye !== updateData.paye) {
      changementsImportants.push(`Statut de paiement: ${updateData.paye ? 'Payé' : 'Non payé'}`);
    }
    if (motDePasse && motDePasse.trim() !== '') {
      changementsImportants.push('Mot de passe modifié');
    }

    res.json({
      message: 'Étudiant mis à jour avec succès',
      etudiant: etudiantResponse,
      infosPaiement: {
        montantTotal: prixTotalNum,
        montantBourse: montantBourse,
        montantAPayer: montantAPayer,
        pourcentageBourse: pourcentageBourseNum,
        typePaiement: typePaySelected,
        statutPaiement: payeBool ? 'Payé' : (prixTotalNum === 0 ? 'Gratuit' : 'En attente')
      },
      metadata: {
        anneeScolaire: anneeScolaire.trim(),
        niveau: niveau,
        nombreCours: cours.length,
        changementsImportants: changementsImportants,
        dateMiseAJour: updated.updatedAt
      }
    });

  } catch (err) {
    console.error('❌ Erreur mise à jour étudiant:', err);
    
    // Gestion des erreurs de validation Mongoose
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Erreur de validation', 
        errors 
      });
    }
    
    // Gestion des erreurs de duplicata (index unique)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const fieldNames = {
        email: 'Email',
        codeMassar: 'Code Massar'
      };
      return res.status(400).json({ 
        message: `${fieldNames[field] || field} déjà utilisé par un autre étudiant` 
      });
    }

    // Gestion des erreurs de cast (ObjectId invalide)
    if (err.name === 'CastError') {
      if (err.path === '_id') {
        return res.status(400).json({ message: 'ID d\'étudiant invalide' });
      }
      return res.status(400).json({
        message: `Format invalide pour le champ ${err.path}`
      });
    }

    res.status(500).json({
      message: 'Erreur lors de la mise à jour',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
  }
});



app.put('/api/bulletins/:id', authProfesseur, async (req, res) => {
  try {
    const { etudiant, cours, semestre, notes, remarque } = req.body;
    
    // Calcul de la moyenne
    let total = 0;
    let coefTotal = 0;
    for (let n of notes) {
      total += n.note * n.coefficient;
      coefTotal += n.coefficient;
    }
    const moyenne = coefTotal > 0 ? (total / coefTotal).toFixed(2) : null;
    
    const bulletin = await Bulletin.findOneAndUpdate(
      { _id: req.params.id, professeur: req.professeurId },
      {
        etudiant,
        cours,
        semestre,
        notes,
        remarque,
        moyenneFinale: moyenne
      },
      { new: true }
    );
    
    if (!bulletin) {
      return res.status(404).json({ message: 'Bulletin non trouvé' });
    }
    
    res.json({ message: '✅ Bulletin modifié', bulletin });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
});

// Route DELETE pour supprimer un bulletin
app.delete('/api/bulletins/:id', authProfesseur, async (req, res) => {
  try {
    const bulletin = await Bulletin.findOneAndDelete({
      _id: req.params.id,
      professeur: req.professeurId
    });
    
    if (!bulletin) {
      return res.status(404).json({ message: 'Bulletin non trouvé' });
    }
    
    res.json({ message: '✅ Bulletin supprimé' });
  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
});



app.post('/api/bulletins', authProfesseur, async (req, res) => {
  try {
    const { etudiant, cours, semestre, notes, remarque } = req.body;

    // ✅ Calcul de la moyenne finale
    let total = 0;
    let coefTotal = 0;
    for (let n of notes) {
      total += n.note * n.coefficient;
      coefTotal += n.coefficient;
    }

    const moyenne = coefTotal > 0 ? (total / coefTotal).toFixed(2) : null;

    const bulletin = new Bulletin({
      etudiant,
      professeur: req.professeurId,
      cours,
      semestre,
      notes,
      remarque,
      moyenneFinale: moyenne
    });

    await bulletin.save();
    res.status(201).json({ message: '✅ Bulletin créé', bulletin });

  } catch (err) {
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
});

app.get('/api/bulletins/etudiant/me', authEtudiant, async (req, res) => {
  try {
    // 1. Vérifier que l'étudiant existe toujours
    const etudiantExists = await Etudiant.findById(req.etudiantId);
    if (!etudiantExists) {
      return res.status(404).json({
        success: false,
        message: "Étudiant non trouvé"
      });
    }

    // 2. Récupérer les bulletins avec une structure garantie
    const bulletins = await Bulletin.find({ etudiant: req.etudiantId })
      .populate('etudiant', 'prenom nomDeFamille')
      .populate('professeur', 'nom prenom')
      .lean(); // Convertit en objet JS simple

    // 3. Formater la réponse de manière fiable
    const response = {
      success: true,
      count: bulletins.length,
      bulletins: bulletins.map(b => ({
        _id: b._id,
        cours: b.cours || 'Non spécifié',
        semestre: b.semestre || 'Année',
        notes: Array.isArray(b.notes) ? b.notes : [],
        moyenneFinale: b.moyenneFinale ?? null,
        remarque: b.remarque || '',
        createdAt: b.createdAt,
        etudiant: {
          _id: b.etudiant?._id,
          nomComplet: b.etudiant 
            ? `${b.etudiant.prenom || ''} ${b.etudiant.nomDeFamille || ''}`.trim() 
            : 'N/A'
        },
        professeur: {
          _id: b.professeur?._id,
          nomComplet: b.professeur
            ? `${b.professeur.prenom || ''} ${b.professeur.nom || ''}`.trim()
            : 'N/A'
        }
      }))
    };

    // 4. Renvoyer même si tableau vide (pour éviter les erreurs front)
    res.json(response);

  } catch (err) {
    console.error('Erreur bulletins:', {
      error: err.message,
      etudiantId: req.etudiantId,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.get('/api/bulletins/professeur', authProfesseur, async (req, res) => {
  try {
    const bulletins = await Bulletin.find({ professeur: req.professeurId })
      .populate({
        path: 'etudiant',
        select: 'prenom nomDeFamille nomComplet', // Sélection multiple
        transform: doc => doc ? {
          _id: doc._id,
          nomComplet: doc.nomComplet || `${doc.prenom || ''} ${doc.nomDeFamille || ''}`.trim(),
          prenom: doc.prenom,
          nomDeFamille: doc.nomDeFamille
        } : null
      })
      .sort({ createdAt: -1 });
    
    res.json(bulletins);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
app.get('/api/bulletins', authAdmin, async (req, res) => {
  try {
    const bulletins = await Bulletin.find()
      .populate({
        path: 'etudiant',
        select: 'prenom nomDeFamille nomComplet',
        transform: doc => doc ? {
          _id: doc._id,
          nomComplet: doc.nomComplet || `${doc.prenom || ''} ${doc.nomDeFamille || ''}`.trim()
        } : null
      })
      .populate({
        path: 'professeur',
        select: 'nomComplet',
        transform: doc => doc ? {
          _id: doc._id,
          nomComplet: `${doc.prenom || ''} ${doc.nom || ''}`.trim()
        } : null
      })
      .sort({ createdAt: -1 });

    res.json(bulletins.map(b => ({
      ...b.toObject(),
      // Formatage cohérent
      etudiantNom: b.etudiant?.nomComplet || 'N/A',
      professeurNom: b.professeur?.nomComplet || 'N/A'
    })));
  } catch (error) {
    console.error('Erreur admin:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des bulletins',
      details: error.message 
    });
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
// ==================== BULLETINS ====================

// 📌 Récupérer tous les bulletins (Admin uniquement)
app.get('/api/bulletins', authAdmin, async (req, res) => {
  try {
    const bulletins = await Bulletin.find()
      .populate('etudiant', 'nomComplet email')
      .populate('professeur', 'nomComplet email');
    res.json(bulletins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Créer un nouveau bulletin (Professeur)
app.post('/api/bulletins', authProfesseur, async (req, res) => {
  try {
    const { etudiant, cours, semestre, notes, remarque, moyenneFinale } = req.body;

    const nouveauBulletin = new Bulletin({
      etudiant,
      professeur: req.utilisateur.id, // récupéré via le token
      cours,
      semestre,
      notes,
      remarque,
      moyenneFinale
    });

    await nouveauBulletin.save();
    res.status(201).json(nouveauBulletin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Supprimer un bulletin (Admin ou Professeur qui l’a créé)
app.delete('/api/bulletins/:id', authAdminOrPaiementManager, async (req, res) => {
  try {
    const bulletin = await Bulletin.findById(req.params.id);
    if (!bulletin) return res.status(404).json({ message: 'Bulletin introuvable' });

    await Bulletin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bulletin supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Récupérer les bulletins d’un professeur connecté
app.get('/api/bulletins/professeur', authProfesseur, async (req, res) => {
  try {
    const bulletins = await Bulletin.find({ professeur: req.utilisateur.id })
      .populate('etudiant', 'nomComplet email');
    res.json(bulletins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Récupérer les bulletins d’un étudiant connecté
app.get('/api/bulletins/etudiant/me', authEtudiant, async (req, res) => {
  try {
    const bulletins = await Bulletin.find({ etudiant: req.utilisateur.id })
      .populate('professeur', 'nomComplet email');
    res.json(bulletins);
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

app.post('/api/contact/send', async (req, res) => {
  try {
    const newMessage = new ContactMessage(req.body);
    await newMessage.save();
    res.status(201).json({ message: '✅ Message envoyé avec succès' });
  } catch (err) {
    console.error('❌ Erreur enregistrement message:', err);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
});

// 🔐 Route protégée - vue admin
app.get('/api/admin/contact-messages', authAdminOrPaiementManager, async (req, res) => {
  try {
    console.log('User making request:', req.userRole, req.user._id);
    const messages = await ContactMessage.find().sort({ date: -1 });
    console.log('Messages found:', messages.length);
    res.status(200).json(messages);
  } catch (err) {
    console.error('❌ Erreur récupération messages:', err);
    res.status(500).json({ 
      message: '❌ Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});
app.delete('/api/admin/contact-messages/:id', authAdminOrPaiementManager, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: '❌ Message non trouvé' });
    }

    res.status(200).json({ message: '✅ Message supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression message:', error);
    res.status(500).json({ message: '❌ Erreur serveur' });
  }
});

// backend/app.js ou routes/admin.js



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
    const {
      nom,
      email,
      motDePasse,
      cours,
      telephone,
      dateNaissance,
      actif,
      genre,
      matiere
    } = req.body;

    // 🔐 Vérification email unique
    const existe = await Professeur.findOne({ email });
    if (existe) return res.status(400).json({ message: '📧 Cet email est déjà utilisé' });

    // ✅ Vérification genre
    if (!['Homme', 'Femme'].includes(genre)) {
      return res.status(400).json({ message: '🚫 Genre invalide. Doit être Homme ou Femme' });
    }

    // ✅ Matière obligatoire
    if (!matiere || matiere.trim() === '') {
      return res.status(400).json({ message: '🚫 La matière est requise' });
    }

    // 🖼️ Image
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    // 📅 Date de naissance
    const date = dateNaissance ? new Date(dateNaissance) : null;

    // 🔐 Hash mot de passe
    const hashed = await bcrypt.hash(motDePasse, 10);

    // ✅ Convertir actif en booléen
    const actifBool = actif === 'true' || actif === true;

    // 📦 Créer le professeur
    const professeur = new Professeur({
      nom,
      email,
      motDePasse: hashed,
      genre,
      telephone,
      dateNaissance: date,
      image: imagePath,
      actif: actifBool,
      cours,
      matiere
    });

    await professeur.save();

    // ✅ Utiliser le nom réellement sauvegardé (au cas où il a été formaté par mongoose)
    const nomProf = professeur.nom;

    // 🔁 Mettre à jour chaque Cours pour y inclure ce professeur
    if (Array.isArray(cours)) {
      for (const coursNom of cours) {
        const coursDoc = await Cours.findOne({ nom: coursNom });
        if (coursDoc && !coursDoc.professeur.includes(nomProf)) {
          coursDoc.professeur.push(nomProf);
          await coursDoc.save();
        }
      }
    }

    res.status(201).json({
      message: '✅ Professeur créé avec succès',
      professeur
    });

  } catch (err) {
    console.error('❌ Erreur lors de la création du professeur:', err);
    res.status(500).json({ message: '❌ Erreur serveur', error: err.message });
  }
});

app.post('/api/seances', authAdmin, async (req, res) => {
  try {
    // ✅ AJOUT: Inclure matiere et salle dans la destructuration
    const { jour, heureDebut, heureFin, cours, professeur, matiere, salle } = req.body;

    // Validation rapide
    if (!jour || !heureDebut || !heureFin || !cours || !professeur) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // ✅ Récupérer le nom du cours à partir de l'ID
    const coursDoc = await Cours.findById(cours);
    if (!coursDoc) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    const seance = new Seance({
      jour,
      heureDebut,
      heureFin,
      cours: coursDoc.nom, // ✅ Utiliser le nom du cours au lieu de l'ID
      professeur,
      matiere: matiere || '', // ✅ IMPORTANT: Inclure la matière
      salle: salle || '' // ✅ IMPORTANT: Inclure la salle
    });

    await seance.save();

    res.status(201).json({ message: 'Séance ajoutée avec succès', seance });
  } catch (err) {
    console.error('Erreur ajout séance:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Route pour modifier une séance - CORRIGÉE
app.put('/api/seances/:id', authAdmin, async (req, res) => {
  try {
    // ✅ AJOUT: Inclure matiere et salle dans la destructuration
    const { jour, heureDebut, heureFin, cours, professeur, matiere, salle } = req.body;

    // ✅ Récupérer le nom du cours à partir de l'ID
    const coursDoc = await Cours.findById(cours);
    if (!coursDoc) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    const seance = await Seance.findByIdAndUpdate(
      req.params.id,
      {
        jour,
        heureDebut,
        heureFin,
        cours: coursDoc.nom, // ✅ Utiliser le nom du cours
        professeur,
        matiere: matiere || '', // ✅ IMPORTANT: Inclure la matière
        salle: salle || '' // ✅ IMPORTANT: Inclure la salle
      },
      { new: true }
    );

    if (!seance) {
      return res.status(404).json({ message: 'Séance non trouvée' });
    }

    res.json({ message: 'Séance modifiée avec succès', seance });
  } catch (err) {
    console.error('Erreur modification séance:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Route pour récupérer toutes les séances (pour admin) - INCHANGÉE
app.get('/api/seances', authAdmin, async (req, res) => {
  try {
    const seances = await Seance.find()
      .populate('professeur', 'nom')
      .sort({ jour: 1, heureDebut: 1 });

    res.json(seances);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Route pour récupérer les séances pour les étudiants - MODIFIÉE
app.get('/api/seances/etudiant', authEtudiant, async (req, res) => {
  try {
    const etudiant = await Etudiant.findById(req.etudiantId);
    const coursNoms = etudiant.cours; // Array de strings comme ['france', 'ji']

    // ✅ Chercher les séances par nom de cours au lieu d'ID
    const seances = await Seance.find({ cours: { $in: coursNoms } })
      .populate('professeur', 'nom')
      .sort({ jour: 1, heureDebut: 1 });

    res.json(seances);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});




app.get('/api/seances/professeur', authProfesseur, async (req, res) => {
  try {
    const seances = await Seance.find({ professeur: req.professeurId })
      .populate('professeur', 'nom') // Populate le professeur pour avoir le nom
      .sort({ jour: 1, heureDebut: 1 });

    res.json(seances);
  } catch (err) {
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
    ).select('');

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
app.get('/api/admin/professeurs-par-cours/:coursNom', async (req, res) => {
  try {
    const coursNom = req.params.coursNom;

    const profs = await Professeur.find({ cours: coursNom }).select('_id nom matiere');
    res.json(profs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
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
// Enhanced API route with pagination
app.get('/api/actualites', async (req, res) => {
  try {
    const { category, search, sortBy, page = 1, limit = 5 } = req.query;

    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const total = await Actualite.countDocuments(query);
    
    // Fetch actualités with pagination
    const actualites = await Actualite.find(query)
      .sort({ isPinned: -1, date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      actualites,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + actualites.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});
app.post('/api/actualites', authAdminOrPaiementManager, upload.single('image'), async (req, res) => {
  try {
    const { title, excerpt, content, category, author, date, tags, type, isPinned } = req.body;

    const nouvelleActualite = new Actualite({
      title,
      excerpt,
      content,
      category,
      author,
      date: date || new Date(),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      type,
      isPinned: isPinned === 'true',
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });

    await nouvelleActualite.save();
    res.status(201).json(nouvelleActualite);
  } catch (err) {
    res.status(400).json({ message: 'Erreur ajout actualité', error: err.message });
  }
});
app.delete('/api/actualites/:id', authAdminOrPaiementManager, async (req, res) => {
  try {
    const deleted = await Actualite.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Actualité non trouvée' });
    }
    res.json({ message: 'Actualité supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur suppression', error: err.message });
  }
});
// ✏️ تعديل actualité
app.put('/api/actualites/:id', authAdminOrPaiementManager, upload.single('image'), async (req, res) => {
  try {
    const { title, excerpt, content, category, author, date, tags, type, isPinned } = req.body;

    const actualisation = {
      title,
      excerpt,
      content,
      category,
      author,
      date: date || new Date(),
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      type,
      isPinned: isPinned === 'true'
    };

    if (req.file) {
      actualisation.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Actualite.findByIdAndUpdate(req.params.id, actualisation, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Actualité non trouvée' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur mise à jour', error: err.message });
  }
});

const mettreAJourStatutPaiement = async (etudiantId) => {
  const etudiant = await Etudiant.findById(etudiantId);
  if (!etudiant) return;

  const paiements = await Paiement.find({ etudiant: etudiantId });
  const totalPaye = paiements.reduce((acc, p) => acc + p.montant, 0);
  
  // Calculer montant après bourse
  const reduction = (etudiant.prixTotal * etudiant.pourcentageBourse) / 100;
  const montantAPayer = etudiant.prixTotal - reduction;
  
  // Auto marquer comme payé si complet
  if (totalPaye >= montantAPayer && montantAPayer > 0) {
    await Etudiant.findByIdAndUpdate(etudiantId, { paye: true });
  } else {
    await Etudiant.findByIdAndUpdate(etudiantId, { paye: false });
  }
};

// 2️⃣ REMPLACER votre route POST /api/paiements par ça :
app.post('/api/paiements', authAdmin, async (req, res) => {
  try {
    // 🔍 DEBUG - Afficher ce qu'on reçoit
    console.log('🔍 Données reçues:', req.body);
    console.log('🔍 Admin ID:', req.admin?.id);
    
    // ✅ VALIDATION des champs requis
    const { etudiant, cours, moisDebut, nombreMois, montant } = req.body;
    
    if (!etudiant) {
      return res.status(400).json({ error: 'etudiant est requis' });
    }
    if (!cours) {
      return res.status(400).json({ error: 'cours est requis' });
    }
    if (!moisDebut) {
      return res.status(400).json({ error: 'moisDebut est requis' });
    }
    if (!nombreMois || nombreMois <= 0) {
      return res.status(400).json({ error: 'nombreMois doit être > 0' });
    }
    if (!montant || montant <= 0) {
      return res.status(400).json({ error: 'montant doit être > 0' });
    }

    // ✅ Créer le paiement
    const nouveauPaiement = new Paiement({
      etudiant,
      cours,
      moisDebut: new Date(moisDebut), // S'assurer que c'est une date
      nombreMois: parseInt(nombreMois), // S'assurer que c'est un nombre
      montant: parseFloat(montant), // S'assurer que c'est un nombre
      note: req.body.note || '',
      creePar: req.admin?.id
    });

    console.log('💾 Paiement à sauvegarder:', nouveauPaiement);
    
    const paiementSauvegarde = await nouveauPaiement.save();
    console.log('✅ Paiement sauvegardé:', paiementSauvegarde._id);
    
    // 🎯 AUTO UPDATE PAYÉ STATUS
    await mettreAJourStatutPaiement(etudiant);
    console.log('✅ Statut mis à jour pour étudiant:', etudiant);

    res.status(201).json({
      success: true,
      message: 'Paiement ajouté et statut mis à jour',
      paiement: paiementSauvegarde
    });

  } catch (err) {
    // 🚨 AFFICHER L'ERREUR COMPLÈTE
    console.error('❌ Erreur complète:', err);
    console.error('❌ Message:', err.message);
    console.error('❌ Stack:', err.stack);
    
    res.status(400).json({ 
      error: err.message,
      details: err.errors ? Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      })) : null
    });
  }
});
app.put('/api/etudiant/profil', authEtudiant, async (req, res) => {
  try {
    const { email, motDePasse, motDePasseActuel } = req.body;

    // Récupérer l'étudiant actuel
    const etudiant = await Etudiant.findById(req.etudiantId);
    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    // Vérification du mot de passe actuel (obligatoire pour toute modification)
    if (!motDePasseActuel || motDePasseActuel.trim() === '') {
      return res.status(400).json({ message: 'Mot de passe actuel requis' });
    }

    const motDePasseValide = await bcrypt.compare(motDePasseActuel, etudiant.motDePasse);
    if (!motDePasseValide) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    const modifications = {};

    // Mise à jour de l'email
    if (email && email.trim() !== '') {
      const emailTrimmed = email.toLowerCase().trim();
      
      // Validation du format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        return res.status(400).json({ message: 'Format d\'email invalide' });
      }

      // Vérifier que l'email n'est pas déjà utilisé par un autre étudiant
      const emailExiste = await Etudiant.findOne({ 
        email: emailTrimmed, 
        _id: { $ne: req.etudiantId } 
      });
      
      if (emailExiste) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      modifications.email = emailTrimmed;
    }

    // Mise à jour du mot de passe
    if (motDePasse && motDePasse.trim() !== '') {
      if (motDePasse.length < 6) {
        return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
      }

      const hashedPassword = await bcrypt.hash(motDePasse.trim(), 10);
      modifications.motDePasse = hashedPassword;
    }

    // Vérifier qu'au moins une modification est demandée
    if (Object.keys(modifications).length === 0) {
      return res.status(400).json({ message: 'Aucune modification à effectuer' });
    }

    // Appliquer les modifications
    modifications.updatedAt = new Date();

    const etudiantMiseAJour = await Etudiant.findByIdAndUpdate(
      req.etudiantId,
      modifications,
      { new: true, runValidators: true }
    );

    // Retourner la réponse sans le mot de passe
    const response = {
      _id: etudiantMiseAJour._id,
      email: etudiantMiseAJour.email,
      prenom: etudiantMiseAJour.prenom,
      nomDeFamille: etudiantMiseAJour.nomDeFamille,
      updatedAt: etudiantMiseAJour.updatedAt
    };

    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      etudiant: response
    });

  } catch (err) {
    console.error('Erreur mise à jour profil étudiant:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Erreur de validation', errors });
    }

    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: err.message
    });
  }
});
app.post('/api/commerciaux', authAdmin, async (req, res) => {
  try {
    const { nom, telephone, email } = req.body;
    const nouveau = new Commercial({ nom, telephone, email });
    await nouveau.save();
    res.status(201).json(nouveau);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/professeur/profil', authProfesseur, async (req, res) => {
  try {
    const { email, motDePasse, motDePasseActuel } = req.body;

    // Récupérer le professeur actuel
    const professeur = await Professeur.findById(req.professeurId);
    if (!professeur) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }

    // Vérification du mot de passe actuel (obligatoire pour toute modification)
    if (!motDePasseActuel || motDePasseActuel.trim() === '') {
      return res.status(400).json({ message: 'Mot de passe actuel requis' });
    }

    const motDePasseValide = await bcrypt.compare(motDePasseActuel, professeur.motDePasse);
    if (!motDePasseValide) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    const modifications = {};

    // Mise à jour de l'email
    if (email && email.trim() !== '') {
      const emailTrimmed = email.toLowerCase().trim();
      
      // Validation du format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        return res.status(400).json({ message: 'Format d\'email invalide' });
      }

      // Vérifier que l'email n'est pas déjà utilisé par un autre professeur
      const emailExiste = await Professeur.findOne({ 
        email: emailTrimmed, 
        _id: { $ne: req.professeurId } 
      });
      
      if (emailExiste) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      modifications.email = emailTrimmed;
    }

    // Mise à jour du mot de passe
    if (motDePasse && motDePasse.trim() !== '') {
      if (motDePasse.length < 6) {
        return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
      }

      const hashedPassword = await bcrypt.hash(motDePasse.trim(), 10);
      modifications.motDePasse = hashedPassword;
    }

    // Vérifier qu'au moins une modification est demandée
    if (Object.keys(modifications).length === 0) {
      return res.status(400).json({ message: 'Aucune modification à effectuer' });
    }

    // Appliquer les modifications
    modifications.updatedAt = new Date();

    const professeurMiseAJour = await Professeur.findByIdAndUpdate(
      req.professeurId,
      modifications,
      { new: true, runValidators: true }
    );

    // Retourner la réponse sans le mot de passe
    const response = {
      _id: professeurMiseAJour._id,
      email: professeurMiseAJour.email,
      nom: professeurMiseAJour.nom,
      genre: professeurMiseAJour.genre,
      telephone: professeurMiseAJour.telephone,
      matiere: professeurMiseAJour.matiere,
      updatedAt: professeurMiseAJour.updatedAt
    };

    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      professeur: response
    });

  } catch (err) {
    console.error('Erreur mise à jour profil professeur:', err);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: 'Erreur de validation', errors });
    }

    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: err.message
    });
  }
});
// ✅ Lister tous les commerciaux
app.get('/api/commerciaux', authAdmin, async (req, res) => {
  try {
    const commerciaux = await Commercial.find().sort({ nom: 1 });
    res.json(commerciaux);
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
app.get('/api/paiements/etudiant/:etudiantId', authAdmin, async (req, res) => {
  try {
    const paiements = await Paiement.find({ etudiant: req.params.etudiantId });
    res.json(paiements);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des paiements", error: err.message });
  }
});
// ✅ Lister les paiements
app.get('/api/paiements', authAdmin, async (req, res) => {
  try {
    const paiements = await Paiement.find()
      .populate('etudiant', 'prenom nomDeFamille nomComplet telephoneEtudiant') // ✅ telephoneEtudiant
      .populate('creePar', 'nom');

    res.json(paiements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/paiements/exp', authAdmin, async (req, res) => {
  try {
    const etudiants = await Etudiant.find({ actif: true });
    const paiements = await Paiement.find({}).lean();

    const expires = [];

    for (const etudiant of etudiants) {
      if (!etudiant.cours || etudiant.cours.length === 0) continue;

      for (const nomCours of etudiant.cours) {
        const paiementsCours = paiements.filter(p =>
          p.etudiant?.toString() === etudiant._id.toString() &&
          p.cours.includes(nomCours)
        );

        const prixTotal = etudiant.prixTotal || 0;
        const montantPaye = paiementsCours.reduce((acc, p) => acc + (p.montant || 0), 0);
        const reste = Math.max(0, prixTotal - montantPaye);

        // ✅ Si l'étudiant a payé le prix complet, ne pas l'afficher dans les expirés
        if (reste <= 0) {
          continue; // Paiement complet, pas d'expiration
        }

        // ✅ Si aucun paiement, utiliser la date d'inscription comme référence
        if (paiementsCours.length === 0) {
          expires.push({
            etudiant: {
              _id: etudiant._id,
              prenom: etudiant.prenom,
              nomDeFamille: etudiant.nomDeFamille,
              nomComplet: etudiant.nomComplet,
              telephone: etudiant.telephone,
              email: etudiant.email,
              image: etudiant.image,
              actif: etudiant.actif
            },
            cours: nomCours,
            derniereFin: etudiant.dateInscription || etudiant.createdAt || new Date(), // ✅ Date d'inscription
            prixTotal,
            montantPaye: 0,
            reste: prixTotal,
            type: 'nouveau' // ✅ Pour identifier les nouveaux étudiants
          });
          continue;
        }

        // ✅ Si il y a des paiements mais pas complets
        paiementsCours.sort((a, b) => new Date(a.moisDebut) - new Date(b.moisDebut));

        const fusionnees = [];
        for (const paiement of paiementsCours) {
          const debut = new Date(paiement.moisDebut);
          const fin = new Date(paiement.moisDebut);
          fin.setMonth(fin.getMonth() + (paiement.nombreMois || 1));

          if (fusionnees.length === 0) {
            fusionnees.push({ debut, fin });
          } else {
            const derniere = fusionnees[fusionnees.length - 1];
            const unJourApres = new Date(derniere.fin);
            unJourApres.setDate(unJourApres.getDate() + 1);

            if (debut <= unJourApres) {
              derniere.fin = fin > derniere.fin ? fin : derniere.fin;
            } else {
              fusionnees.push({ debut, fin });
            }
          }
        }

        const dernierePeriode = fusionnees[fusionnees.length - 1];
        const maintenant = new Date();

        // ✅ Seulement si la période est expirée ET qu'il reste à payer
        if (reste > 0 && dernierePeriode.fin < maintenant) {
          expires.push({
            etudiant: {
              _id: etudiant._id,
              prenom: etudiant.prenom,
              nomDeFamille: etudiant.nomDeFamille,
              nomComplet: etudiant.nomComplet,
              telephone: etudiant.telephone,
              email: etudiant.email,
              image: etudiant.image,
              actif: etudiant.actif
            },
            cours: nomCours,
            derniereFin: dernierePeriode.fin,
            prixTotal,
            montantPaye,
            reste,
            type: 'expire' // ✅ Pour identifier les vrais expirés
          });
        }
      }
    }

    // Trier par nombre de jours expirés (les plus urgents en premier)
    expires.sort((a, b) => {
      const aJours = Math.ceil((new Date() - new Date(a.derniereFin)) / (1000 * 60 * 60 * 24));
      const bJours = Math.ceil((new Date() - new Date(b.derniereFin)) / (1000 * 60 * 60 * 24));
      return bJours - aJours;
    });

    res.json(expires);
  } catch (error) {
    console.error('Erreur paiements expirés:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des paiements expirés',
      error: error.message
    });
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


// Route pour supprimer une notification avec sauvegarde du contexte
app.delete('/api/notifications/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Suppression notification: ${id}`);
    
    // Extraire les informations de l'ID de notification
    const [type, , etudiantId, nombreAbsences] = id.split('_');
    
    if (type === 'absence' && etudiantId) {
      // Sauvegarder la suppression avec le contexte
      const suppressionKey = `absence_${etudiantId}`;
      
      await NotificationSupprimee.findOneAndUpdate(
        { key: suppressionKey, type: 'absence_frequent' },
        {
          key: suppressionKey,
          type: 'absence_frequent',
          etudiantId: etudiantId,
          nombreAbsencesAuMomentSuppression: parseInt(nombreAbsences) || 0,
          dateSuppression: new Date(),
          supprimePar: req.user.id // ID de l'admin qui a supprimé
        },
        { upsert: true, new: true }
      );
      
      console.log(`✅ Suppression sauvegardée pour étudiant ${etudiantId} avec ${nombreAbsences} absences`);
    }
    
    res.json({ 
      success: true, 
      message: 'Notification supprimée avec succès',
      context: type === 'absence' ? {
        etudiantId,
        nombreAbsences: parseInt(nombreAbsences) || 0
      } : null
    });
    
  } catch (err) {
    console.error('❌ Erreur suppression notification:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route pour restaurer les notifications supprimées
app.post('/api/notifications/reset-deleted', authAdmin, async (req, res) => {
  try {
    const result = await NotificationSupprimee.deleteMany({});
    
    console.log(`🔄 ${result.deletedCount} notifications supprimées restaurées`);
    
    res.json({
      success: true,
      restoredCount: result.deletedCount,
      message: 'Toutes les notifications supprimées ont été restaurées'
    });
    
  } catch (err) {
    console.error('❌ Erreur restauration notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route pour configurer les seuils d'absence
app.post('/api/notifications/seuils-absence', authAdmin, async (req, res) => {
  try {
    const { normal, urgent, critique } = req.body;
    
    // Valider les seuils
    if (!normal || !urgent || !critique || normal >= urgent || urgent >= critique) {
      return res.status(400).json({
        error: 'Les seuils doivent être: normal < urgent < critique'
      });
    }
    
    // Sauvegarder en base (vous pouvez créer un modèle Configuration)
    await Configuration.findOneAndUpdate(
      { key: 'seuils_absence' },
      {
        key: 'seuils_absence',
        value: { normal, urgent, critique },
        modifiePar: req.user.id,
        dateModification: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`⚙️ Seuils d'absence mis à jour: ${normal}/${urgent}/${critique}`);
    
    res.json({
      success: true,
      seuils: { normal, urgent, critique },
      message: 'Seuils d\'absence mis à jour avec succès'
    });
    
  } catch (err) {
    console.error('❌ Erreur mise à jour seuils:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route de statistiques détaillées pour les absences
app.get('/api/notifications/stats-absences', authAdmin, async (req, res) => {
  try {
    const etudiantsActifs = await Etudiant.find({ actif: true });
    const stats = {
      totalEtudiants: etudiantsActifs.length,
      parSeuil: {
        normal: 0,    // 10-14 absences
        urgent: 0,    // 15-19 absences
        critique: 0   // 20+ absences
      },
      repartition: [],
      moyenneAbsences: 0
    };
    
    let totalAbsences = 0;
    
    for (const etudiant of etudiantsActifs) {
      const absences = await Presence.countDocuments({
        etudiant: etudiant._id,
        present: false
      });
      
      totalAbsences += absences;
      
      stats.repartition.push({
        etudiantId: etudiant._id,
        nom: etudiant.nomComplet,
        absences: absences,
        niveau: absences >= 20 ? 'critique' : 
                absences >= 15 ? 'urgent' : 
                absences >= 10 ? 'normal' : 'ok'
      });
      
      if (absences >= 20) stats.parSeuil.critique++;
      else if (absences >= 15) stats.parSeuil.urgent++;
      else if (absences >= 10) stats.parSeuil.normal++;
    }
    
    stats.moyenneAbsences = Math.round(totalAbsences / etudiantsActifs.length * 100) / 100;
    
    // Trier par nombre d'absences décroissant
    stats.repartition.sort((a, b) => b.absences - a.absences);
    
    res.json(stats);
    
  } catch (err) {
    console.error('❌ Erreur stats absences:', err);
    res.status(500).json({ error: err.message });
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
app.get('/api/vie-scolaire', async (req, res) => {
  try {
    const { cycle, year, category, search, limit = 10, page = 1 } = req.query;
    
    // Construction du filtre
    const filter = {};
    if (cycle) filter.cycle = cycle;
    if (year) filter.year = year;
    if (category && category !== 'all') filter.category = category;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fullDescription: { $regex: search, $options: 'i' } },
        { lieu: { $regex: search, $options: 'i' } },
        { organisateur: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageSize = parseInt(limit);
    const currentPage = parseInt(page);
    const skip = (currentPage - 1) * pageSize;
    
    // Compter le total des documents
    const total = await Activity.countDocuments(filter);
    
    // Récupérer les activités avec pagination
    const activities = await Activity.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select('-__v');
    
    res.json({
      data: activities,
      currentPage,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
      success: true
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des activités',
      success: false
    });
  }
});

// GET une activité par ID
app.get('/api/vie-scolaire/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        error: 'ID d\'activité invalide',
        success: false
      });
    }
    
    const activity = await Activity.findById(req.params.id).select('-__v');
    
    if (!activity) {
      return res.status(404).json({ 
        error: 'Activité non trouvée',
        success: false
      });
    }
    
    res.json(activity);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération de l\'activité',
      success: false
    });
  }
});

// POST créer une nouvelle activité (admin uniquement)
app.post('/api/vie-scolaire', authAdminOrPaiementManager, uploadVieScolaire.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      date,
      time,
      category,
      description,
      fullDescription,
      participants,
      lieu,
      organisateur,
      materiel,
      year,
      cycle
    } = req.body;
    
    // Validation des champs requis
    if (!title || !date || !category || !description || !year || !cycle) {
      return res.status(400).json({
        error: 'Les champs title, date, category, description, year et cycle sont requis',
        success: false
      });
    }
    
    // Traitement des images uploadées
    const images = req.files ? req.files.map(file => `/uploads/vieScolaire/${file.filename}`) : [];
    
    // Création de l'activité
    const activity = new Activity({
      title: title.trim(),
      date: new Date(date),
      time: time?.trim(),
      category,
      description: description.trim(),
      fullDescription: fullDescription?.trim(),
      participants: participants ? parseInt(participants) : undefined,
      lieu: lieu?.trim(),
      organisateur: organisateur?.trim(),
      materiel: materiel?.trim(),
      images,
      year,
      cycle
    });
    
    await activity.save();
    
    res.status(201).json({
      data: activity,
      message: 'Activité créée avec succès',
      success: true
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité:', error);
    
    // Supprimer les fichiers uploadés en cas d'erreur
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Erreur lors de la suppression du fichier:', err);
        });
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Erreur de validation des données',
        details: error.message,
        success: false
      });
    }
    
    res.status(500).json({
      error: 'Erreur serveur lors de la création de l\'activité',
      success: false
    });
  }
});

app.put('/api/vie-scolaire/:id', authAdminOrPaiementManager, uploadVieScolaire.array('images', 10), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'ID d\'activité invalide',
        success: false
      });
    }
    
    const {
      title,
      date,
      time,
      category,
      description,
      fullDescription,
      participants,
      lieu,
      organisateur,
      materiel,
      year,
      cycle,
      keepExistingImages
    } = req.body;
    
    const existingActivity = await Activity.findById(req.params.id);
    if (!existingActivity) {
      return res.status(404).json({
        error: 'Activité non trouvée',
        success: false
      });
    }
    
    // Traitement des nouvelles images
    const newImages = req.files ? req.files.map(file => `/uploads/vieScolaire/${file.filename}`) : [];
    
    // Gestion des images existantes
    let finalImages = [];
    if (keepExistingImages === 'true') {
      finalImages = [...existingActivity.images, ...newImages];
    } else {
      finalImages = newImages.length > 0 ? newImages : existingActivity.images;
    }
    
    // Données à mettre à jour
    const updateData = {
      title: title?.trim() || existingActivity.title,
      date: date ? new Date(date) : existingActivity.date,
      time: time?.trim() || existingActivity.time,
      category: category || existingActivity.category,
      description: description?.trim() || existingActivity.description,
      fullDescription: fullDescription?.trim() || existingActivity.fullDescription,
      participants: participants ? parseInt(participants) : existingActivity.participants,
      lieu: lieu?.trim() || existingActivity.lieu,
      organisateur: organisateur?.trim() || existingActivity.organisateur,
      materiel: materiel?.trim() || existingActivity.materiel,
      images: finalImages,
      year: year || existingActivity.year,
      cycle: cycle || existingActivity.cycle
    };
    
    const updatedActivity = await Activity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      data: updatedActivity,
      message: 'Activité mise à jour avec succès',
      success: true
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité:', error);
    
    // Supprimer les nouveaux fichiers uploadés en cas d'erreur
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Erreur lors de la suppression du fichier:', err);
        });
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Erreur de validation des données',
        details: error.message,
        success: false
      });
    }
    
    res.status(500).json({
      error: 'Erreur serveur lors de la mise à jour de l\'activité',
      success: false
    });
  }
});

app.delete('/api/vie-scolaire/:id', authAdminOrPaiementManager, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'ID d\'activité invalide',
        success: false
      });
    }
    
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({
        error: 'Activité non trouvée',
        success: false
      });
    }
    
    // Supprimer les images associées
    if (activity.images && activity.images.length > 0) {
      activity.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, 'public', imagePath);
        fs.unlink(fullPath, (err) => {
          if (err) console.error('Erreur lors de la suppression de l\'image:', err);
        });
      });
    }
    
    await Activity.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Activité supprimée avec succès',
      success: true
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la suppression de l\'activité',
      success: false
    });
  }
});

// DELETE supprimer une image spécifique d'une activité (admin uniquement)
app.delete('/api/vie-scolaire/:id/images/:imageIndex', authAdminOrPaiementManager, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'ID d\'activité invalide',
        success: false
      });
    }
    
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({
        error: 'Activité non trouvée',
        success: false
      });
    }
    
    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= activity.images.length) {
      return res.status(400).json({
        error: 'Index d\'image invalide',
        success: false
      });
    }
    
    // Supprimer le fichier physique
    const imagePath = activity.images[imageIndex];
    const fullPath = path.join(__dirname, 'public', imagePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.error('Erreur lors de la suppression de l\'image:', err);
    });
    
    // Retirer l'image du tableau
    activity.images.splice(imageIndex, 1);
    await activity.save();
    
    res.json({
      data: activity,
      message: 'Image supprimée avec succès',
      success: true
    });
    
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la suppression de l\'image',
      success: false
    });
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
app.post('/api/admin/paiement-managers', authAdmin, async (req, res) => {
  try {
    const { nom, email, telephone, motDePasse, actif = true } = req.body;

    // Validation des champs requis
    if (!nom || !email || !motDePasse || !telephone) {
      return res.status(400).json({ 
        message: 'Nom, email, téléphone et mot de passe sont requis' 
      });
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Format d\'email invalide' 
      });
    }

    // Validation mot de passe
    if (motDePasse.length < 6) {
      return res.status(400).json({ 
        message: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Vérifier si l'email existe déjà
    const existingManager = await PaiementManager.findOne({ email: email.toLowerCase().trim() });
    if (existingManager) {
      return res.status(400).json({ 
        message: 'Cet email est déjà utilisé par un autre gestionnaire' 
      });
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);

    // Créer le nouveau gestionnaire
    const manager = new PaiementManager({
      nom: nom.trim(),
      email: email.toLowerCase().trim(),
      telephone: telephone.trim(),
      motDePasse: hashedPassword,
      actif: actif
    });

    await manager.save();

    // Retourner les données sans le mot de passe
    const managerData = manager.toObject();
    delete managerData.motDePasse;

    res.status(201).json(managerData); // ✅ Return the manager data directly

  } catch (err) {
    console.error('Erreur création gestionnaire:', err);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la création du gestionnaire',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 2. Lire tous les gestionnaires de paiement (GET)
app.get('/api/admin/paiement-managers', authAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, actif, search } = req.query;
    
    // Construire les filtres
    let filter = {};
    
    if (typeof actif !== 'undefined') {
      filter.actif = actif === 'true';
    }
    
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { telephone: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const managers = await PaiementManager
      .find(filter, { motDePasse: 0 }) // Exclude password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PaiementManager.countDocuments(filter);

    // ✅ Return managers array directly (as expected by frontend)
    res.json(managers);

  } catch (err) {
    console.error('Erreur récupération gestionnaires:', err);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des gestionnaires',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 3. Lire un gestionnaire spécifique (GET)
app.get('/api/admin/paiement-managers/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validation de l'ID MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'ID de gestionnaire invalide' 
      });
    }

    const manager = await PaiementManager.findById(id, { motDePasse: 0 });
    
    if (!manager) {
      return res.status(404).json({ 
        message: 'Gestionnaire de paiement non trouvé' 
      });
    }

    res.json(manager); // ✅ Return manager data directly

  } catch (err) {
    console.error('Erreur récupération gestionnaire:', err);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération du gestionnaire',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 4. Mettre à jour un gestionnaire (PUT)
app.put('/api/admin/paiement-managers/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, email, telephone, motDePasse, actif } = req.body;

    // Validation de l'ID MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'ID de gestionnaire invalide' 
      });
    }

    // Vérifier si le gestionnaire existe
    const existingManager = await PaiementManager.findById(id);
    if (!existingManager) {
      return res.status(404).json({ 
        message: 'Gestionnaire de paiement non trouvé' 
      });
    }

    // Préparer les mises à jour
    const updates = {};

    if (nom) {
      updates.nom = nom.trim();
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          message: 'Format d\'email invalide' 
        });
      }

      // Vérifier si l'email est déjà utilisé par un autre gestionnaire
      const emailExists = await PaiementManager.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: id }
      });

      if (emailExists) {
        return res.status(400).json({ 
          message: 'Cet email est déjà utilisé par un autre gestionnaire' 
        });
      }

      updates.email = email.toLowerCase().trim();
    }

    if (telephone) {
      updates.telephone = telephone.trim();
    }

    if (typeof actif !== 'undefined') {
      updates.actif = Boolean(actif);
    }

    // Gestion du mot de passe
    if (motDePasse) {
      if (motDePasse.length < 6) {
        return res.status(400).json({ 
          message: 'Le mot de passe doit contenir au moins 6 caractères' 
        });
      }

      const saltRounds = 12;
      updates.motDePasse = await bcrypt.hash(motDePasse, saltRounds);
    }

    // Mettre à jour la date de modification
    updates.updatedAt = new Date();

    const updatedManager = await PaiementManager.findByIdAndUpdate(
      id,
      updates,
      { 
        new: true, 
        select: '-motDePasse',
        runValidators: true 
      }
    );

    res.json(updatedManager); // ✅ Return updated manager directly

  } catch (err) {
    console.error('Erreur mise à jour gestionnaire:', err);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la mise à jour du gestionnaire',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 5. Supprimer un gestionnaire (DELETE)
app.delete('/api/admin/paiement-managers/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validation de l'ID MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'ID de gestionnaire invalide' 
      });
    }

    const manager = await PaiementManager.findById(id);
    
    if (!manager) {
      return res.status(404).json({ 
        message: 'Gestionnaire de paiement non trouvé' 
      });
    }

    // Optionnel : Vérifier s'il y a des transactions liées
    // const transactionsCount = await Transaction.countDocuments({ managerId: id });
    // if (transactionsCount > 0) {
    //   return res.status(400).json({ 
    //     message: 'Impossible de supprimer ce gestionnaire car il a des transactions associées' 
    //   });
    // }

    await PaiementManager.findByIdAndDelete(id);

    res.json({ 
      success: true,
      message: 'Gestionnaire de paiement supprimé avec succès',
      deletedManager: {
        id: manager._id,
        nom: manager.nom,
        email: manager.email
      }
    });

  } catch (err) {
    console.error('Erreur suppression gestionnaire:', err);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la suppression du gestionnaire',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 6. Activer/Désactiver un gestionnaire (PATCH)
app.patch('/api/admin/paiement-managers/:id/toggle-active', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validation de l'ID MongoDB
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'ID de gestionnaire invalide' 
      });
    }

    const manager = await PaiementManager.findById(id);
    
    if (!manager) {
      return res.status(404).json({ 
        message: 'Gestionnaire de paiement non trouvé' 
      });
    }

    // Inverser le statut actif
    manager.actif = !manager.actif;
    manager.updatedAt = new Date();
    
    await manager.save();

    // Remove password before sending response
    const managerResponse = manager.toObject();
    delete managerResponse.motDePasse;

    res.json(managerResponse); // ✅ Return updated manager directly

  } catch (err) {
    console.error('Erreur changement statut gestionnaire:', err);
    res.status(500).json({ 
      message: 'Erreur serveur lors du changement de statut',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});






app.get('/api/notifications', authAdmin, async (req, res) => {
  try {
    const notifications = [];
    const aujourdHui = new Date();

    // 1. Traitement des paiements expirés et nouveaux
    const etudiants = await Etudiant.find({ actif: true }).lean();
    const paiements = await Paiement.find().populate('etudiant', 'nomComplet actif image telephone email').lean();

    for (const etudiant of etudiants) {
      if (!etudiant.cours || etudiant.cours.length === 0) continue;

      for (const nomCours of etudiant.cours) {
        // Filtrer et trier les paiements pour cet étudiant et ce cours
        const paiementsCours = paiements
          .filter(p => 
            p.etudiant?._id.toString() === etudiant._id.toString() && 
            p.cours.includes(nomCours)
          )
          .sort((a, b) => new Date(a.moisDebut).getTime() - new Date(b.moisDebut).getTime());

        const prixTotal = etudiant.prixTotal || 0;
        const montantPaye = paiementsCours.reduce((acc, p) => acc + (p.montant || 0), 0);
        const reste = Math.max(0, prixTotal - montantPaye);

        // Ignorer si paiement complet
        if (reste <= 0) continue;

        let derniereFin;
        let typeNotification = '';

        // Cas nouveau sans paiement
        if (paiementsCours.length === 0) {
          derniereFin = etudiant.dateInscription || etudiant.createdAt;
          typeNotification = 'payment_new';
        } else {
          // Fusionner les périodes de paiement
          const fusionnees = [];
          for (const paiement of paiementsCours) {
            const debut = new Date(paiement.moisDebut);
            const fin = new Date(debut);
            fin.setMonth(fin.getMonth() + (paiement.nombreMois || 1));

            if (fusionnees.length === 0) {
              fusionnees.push({ debut, fin });
            } else {
              const derniere = fusionnees[fusionnees.length - 1];
              const unJourApres = new Date(derniere.fin);
              unJourApres.setDate(unJourApres.getDate() + 1);

              if (debut <= unJourApres) {
                derniere.fin = fin > derniere.fin ? fin : derniere.fin;
              } else {
                fusionnees.push({ debut, fin });
              }
            }
          }
          derniereFin = fusionnees[fusionnees.length - 1].fin;
          typeNotification = derniereFin < aujourdHui ? 'payment_expired' : 'payment_active';
        }

        // Créer notification si nouveau ou expiré
        if (typeNotification === 'payment_new' || (typeNotification === 'payment_expired' && reste > 0)) {
          const joursExpires = Math.ceil((aujourdHui - derniereFin) / (1000 * 60 * 60 * 24));
          
          notifications.push({
            id: `payment_${typeNotification}_${etudiant._id}_${nomCours}`,
            type: typeNotification,
            title: typeNotification === 'payment_new' 
              ? 'Nouvel étudiant non payé' 
              : 'Paiement expiré',
            message: typeNotification === 'payment_new'
              ? `🆕 ${etudiant.nomComplet} inscrit à "${nomCours}" n'a encore effectué aucun paiement`
              : `💰 Paiement de ${etudiant.nomComplet} pour "${nomCours}" a expiré il y a ${joursExpires} jour(s)`,
            priority: typeNotification === 'payment_new' ? 'high' : 'urgent',
            timestamp: derniereFin,
            data: {
              etudiantId: etudiant._id,
              etudiantNom: etudiant.nomComplet,
              etudiantInfo: {
                telephone: etudiant.telephone,
                email: etudiant.email,
                image: etudiant.image
              },
              cours: nomCours,
              joursExpires,
              prixTotal,
              montantPaye,
              reste,
              derniereFin
            }
          });
        }
      }
    }

    // 2. Traitement des paiements qui expirent bientôt (7 jours ou moins)
    for (const etudiant of etudiants) {
      if (!etudiant.cours || etudiant.cours.length === 0) continue;

      for (const nomCours of etudiant.cours) {
        const paiementsCours = paiements
          .filter(p => 
            p.etudiant?._id.toString() === etudiant._id.toString() && 
            p.cours.includes(nomCours)
          )
          .sort((a, b) => new Date(a.moisDebut).getTime() - new Date(b.moisDebut).getTime());

        if (paiementsCours.length === 0) continue;

        // Fusionner les périodes
        const fusionnees = [];
        for (const paiement of paiementsCours) {
          const debut = new Date(paiement.moisDebut);
          const fin = new Date(debut);
          fin.setMonth(fin.getMonth() + (paiement.nombreMois || 1));

          if (fusionnees.length === 0) {
            fusionnees.push({ debut, fin });
          } else {
            const derniere = fusionnees[fusionnees.length - 1];
            const unJourApres = new Date(derniere.fin);
            unJourApres.setDate(unJourApres.getDate() + 1);

            if (debut <= unJourApres) {
              derniere.fin = fin > derniere.fin ? fin : derniere.fin;
            } else {
              fusionnees.push({ debut, fin });
            }
          }
        }

        const derniereFin = fusionnees[fusionnees.length - 1].fin;
        const joursRestants = Math.ceil((derniereFin - aujourdHui) / (1000 * 60 * 60 * 24));

        // Notification pour paiement expirant bientôt (entre 1 et 7 jours)
        if (joursRestants <= 7 && joursRestants > 0) {
          notifications.push({
            id: `payment_expiring_${etudiant._id}_${nomCours}`,
            type: 'payment_expiring',
            title: 'Paiement expirant bientôt',
            message: `⏳ Paiement de ${etudiant.nomComplet} pour "${nomCours}" expire dans ${joursRestants} jour(s)`,
            priority: joursRestants <= 3 ? 'high' : 'medium',
            timestamp: derniereFin,
            data: {
              etudiantId: etudiant._id,
              etudiantNom: etudiant.nomComplet,
              etudiantInfo: {
                telephone: etudiant.telephone,
                email: etudiant.email,
                image: etudiant.image
              },
              cours: nomCours,
              joursRestants,
              dateExpiration: derniereFin
            }
          });
        }
      }
    }

    // 3. Traitement des absences
    const SEUILS_ABSENCE = { NORMAL: 10, URGENT: 15, CRITIQUE: 20 };
    for (const etudiant of etudiants) {
      const absences = await Presence.find({
        etudiant: etudiant._id,
        present: false,
      }).lean();

      const nombreAbsences = absences.length;
      const notificationSupprimee = await NotificationSupprimee.findOne({
        key: `absence_${etudiant._id}`,
        type: 'absence_frequent',
      }).lean();

      let doitCreerNotification = false;
      let priorite = 'medium';
      let titre = '';
      let message = '';

      if (nombreAbsences >= SEUILS_ABSENCE.CRITIQUE) {
        priorite = 'urgent';
        titre = 'CRITIQUE: Absences excessives';
        message = `${etudiant.nomComplet} a ${nombreAbsences} absences (seuil critique: ${SEUILS_ABSENCE.CRITIQUE})`;
        doitCreerNotification = !notificationSupprimee || notificationSupprimee.nombreAbsencesAuMomentSuppression < nombreAbsences;
      } else if (nombreAbsences >= SEUILS_ABSENCE.URGENT) {
        priorite = 'high';
        titre = 'URGENT: Absences répétées';
        message = `${etudiant.nomComplet} a ${nombreAbsences} absences (seuil urgent: ${SEUILS_ABSENCE.URGENT})`;
        doitCreerNotification = !notificationSupprimee || notificationSupprimee.nombreAbsencesAuMomentSuppression < nombreAbsences;
      } else if (nombreAbsences >= SEUILS_ABSENCE.NORMAL) {
        priorite = 'medium';
        titre = 'Attention: Absences multiples';
        message = `${etudiant.nomComplet} a ${nombreAbsences} absences (seuil normal: ${SEUILS_ABSENCE.NORMAL})`;
        doitCreerNotification = !notificationSupprimee || notificationSupprimee.nombreAbsencesAuMomentSuppression < nombreAbsences;
      }

      if (doitCreerNotification) {
        const absencesParCours = {};
        for (const absence of absences) {
          absencesParCours[absence.cours] = (absencesParCours[absence.cours] || 0) + 1;
        }

        notifications.push({
          id: `absence_frequent_${etudiant._id}_${nombreAbsences}`,
          type: 'absence_frequent',
          title: titre,
          message: message,
          priority: priorite,
          timestamp: new Date(),
          data: {
            etudiantId: etudiant._id,
            etudiantNom: etudiant.nomComplet,
            nombreAbsences,
            seuil: priorite.toLowerCase(),
            absencesParCours,
            derniereAbsence: absences.length > 0 ? absences[absences.length - 1].dateSession : null,
          },
        });
      }
    }

    // 4. Traitement des événements à venir
    const dans7jours = new Date();
    dans7jours.setDate(dans7jours.getDate() + 7);
    const evenements = await Evenement.find({
      dateDebut: { $gte: aujourdHui, $lte: dans7jours },
    }).sort({ dateDebut: 1 }).lean();

    for (const evenement of evenements) {
      const joursRestants = Math.ceil((new Date(evenement.dateDebut) - aujourdHui) / (1000 * 60 * 60 * 24));
      let priorite = 'medium';
      if (joursRestants === 0) priorite = 'urgent';
      else if (joursRestants === 1) priorite = 'high';

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
          joursRestants,
        },
      });
    }

    // Tri final par priorité et date
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    res.json({
      notifications,
      total: notifications.length,
      urgent: notifications.filter(n => n.priority === 'urgent').length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
    });
  } catch (err) {
    console.error('❌ Erreur notifications:', err);
    res.status(500).json({ error: err.message });
  }
});


// 7. Route supplémentaire : Statistiques des gestionnaires


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
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});