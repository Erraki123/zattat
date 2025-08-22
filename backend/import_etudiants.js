const XLSX = require('xlsx');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Configuration MongoDB - AJUSTEZ SELON VOTRE CONFIGURATION
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zattat_db';

// Schéma Étudiant (assure-toi que c'est cohérent avec ton modèle)
const etudiantSchema = new mongoose.Schema({
  nomComplet: { type: String, required: true },
  genre: { type: String, enum: ['Homme', 'Femme'], required: true },
  email: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
  niveau: { type: String, required: true },
  telephoneEtudiant: { type: String, required: true },
  telephonePere: { type: String, default: '' },
  telephoneMere: { type: String, default: '' },
  codeMassar: { type: String, required: true, unique: true },
  adresse: { type: String, default: '' },
  cours: { type: [String], default: [] },
  image: { type: String, default: '' },
  actif: { type: Boolean, default: true },
  lastSeen: { type: Date, default: null },
  prixTotal: { type: Number, default: 0 },
  paye: { type: Boolean, default: false },
  pourcentageBourse: { type: Number, default: 0, min: 0, max: 100 },
  typePaiement: { type: String, enum: ['Cash', 'Virement', 'Chèque', 'En ligne'], default: 'Cash' },
  anneeScolaire: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{4}\/\d{4}$/.test(v);
      },
      message: 'L\'année scolaire doit être au format YYYY/YYYY (ex: 2025/2026)'
    }
  }
}, { timestamps: true });

const Etudiant = mongoose.model('Etudiant', etudiantSchema, 'etudiants'); // Force le nom de collection

// Mapping des niveaux du fichier Excel vers les niveaux du schéma
const niveauMapping = {
  '2ème Année Collégial Parcours International': '3ème Collège',
  '3ème Année Collégial Parcours International': '4ème Collège',
  'Tronc commun Sciences - Option Français': 'Tronc Commun Scientifique',
  '1ère Année Bac Sciences Expérimentales - Option Français': '1BAC PC',
  '1ère Année Bac Sciences Economiques et Gestion': '1BAC Économie',
  '2ème Année Bac Sciences Physiques - Option Français': '2BAC PC',
  '2ème Année Bac Sciences de la gestion Comptable': '2BAC Économie'
};

// Fonction pour convertir la date
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return new Date('2000-01-01');
  
  try {
    // Format: DD/MM/YYYY
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Les mois commencent à 0
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  } catch (error) {
    console.warn(`Erreur de parsing de date: ${dateStr}`, error);
  }
  
  return new Date('2000-01-01'); // Date par défaut
}

// Fonction pour générer un mot de passe par défaut
function generateDefaultPassword() {
  return '123456'; // Mot de passe par défaut simple
}

// Fonction pour générer un email par défaut
function generateEmail(nom, prenom, codeMassar) {
  const cleanNom = nom.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
  const cleanPrenom = prenom.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
  const cleanCode = codeMassar.replace(/[^0-9]/g, '').slice(-4); // 4 derniers chiffres
  
  return `${cleanPrenom}.${cleanNom}.${cleanCode}@etudiant.ma`;
}

// Fonction pour générer un téléphone par défaut
function generateDefaultPhone() {
  // Générer un numéro de téléphone marocain par défaut
  const prefix = '06';
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + number;
}

// Fonction principale pour lire et traiter le fichier Excel
async function importFromExcel(filePath) {
  try {
    console.log(`Lecture Excel: ${filePath}`);
    
    // Lire le fichier Excel
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    console.log(`Feuilles trouvées: ${sheetNames.join(', ')}`);
    
    let totalEtudiants = 0;
    let etudiantsPrepares = [];
    
    // Traiter chaque feuille
    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir en tableau
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: ''
      });
      
      // Récupérer le niveau depuis la ligne 16 (index 15)
      let niveauOriginal = '';
      if (jsonData[15] && jsonData[15][8]) {
        niveauOriginal = jsonData[15][8].toString().trim();
      }
      
      const niveauMapped = niveauMapping[niveauOriginal] || 'Niveau non défini';
      console.log(`Niveau détecté pour ${sheetName}: ${niveauOriginal} -> ${niveauMapped}`);
      
      // Traiter les données à partir de la ligne 22 (index 21)
      let elevesComptes = 0;
      
      for (let i = 21; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Vérifier si la ligne contient des données (au moins le code Massar)
        if (!row || !row[4] || row[4].toString().trim() === '') {
          continue;
        }
        
        // Extraire les données selon les colonnes identifiées
        const codeMassar = row[4].toString().trim();
        const nom = (row[9] || '').toString().trim() || 'Nom non défini';
        const prenom = (row[16] || '').toString().trim() || 'Prénom non défini';
        const genreOriginal = (row[22] || '').toString().trim();
        const dateNaissanceStr = (row[27] || '').toString().trim();
        
        // Mapper le genre
        const genre = genreOriginal.toLowerCase().includes('fille') ? 'Femme' : 'Homme';
        
        // Parser la date de naissance
        const dateNaissance = parseDate(dateNaissanceStr);
        
        // Créer le nom complet
        const nomComplet = `${prenom} ${nom}`.trim();
        
        // Générer les champs manquants
        const email = generateEmail(nom, prenom, codeMassar);
        const motDePasseHash = await bcrypt.hash(generateDefaultPassword(), 10);
        const telephoneEtudiant = generateDefaultPhone();
        
        // Créer l'objet étudiant
        const etudiantData = {
          nomComplet,
          genre,
          email,
          motDePasse: motDePasseHash,
          dateNaissance,
          niveau: niveauMapped,
          telephoneEtudiant,
          telephonePere: '',
          telephoneMere: '',
          codeMassar,
          adresse: '',
          cours: [],
          image: '',
          actif: true,
          lastSeen: null,
          prixTotal: 0,
          paye: false,
          pourcentageBourse: 0,
          typePaiement: 'Cash',
          anneeScolaire: '2025/2026'
        };
        
        etudiantsPrepares.push(etudiantData);
        elevesComptes++;
      }
      
      console.log(`Élèves traités dans ${sheetName}: ${elevesComptes}`);
      totalEtudiants += elevesComptes;
    }
    
    console.log(`\nTotal élèves détectés: ${totalEtudiants}`);
    console.log(`Préparés: ${etudiantsPrepares.length}`);
    
    // Afficher un exemple pour vérification
    console.log('\n--- EXEMPLE D\'ÉTUDIANT ---');
    if (etudiantsPrepares.length > 0) {
      const exemple = etudiantsPrepares[0];
      console.log(`Nom complet: ${exemple.nomComplet}`);
      console.log(`Genre: ${exemple.genre}`);
      console.log(`Email: ${exemple.email}`);
      console.log(`Code Massar: ${exemple.codeMassar}`);
      console.log(`Niveau: ${exemple.niveau}`);
      console.log(`Téléphone: ${exemple.telephoneEtudiant}`);
      console.log(`Date naissance: ${exemple.dateNaissance.toLocaleDateString()}`);
      console.log(`Année scolaire: ${exemple.anneeScolaire}`);
    }
    
    // Mode DRY RUN - CHANGEZ EN false POUR INSERTION RÉELLE
    const DRY_RUN = false; // CHANGÉ POUR INSERTION RÉELLE
    
    if (DRY_RUN) {
      console.log('\n--- MODE DRY RUN ACTIVÉ ---');
      console.log('Aucune donnée ne sera insérée en base de données.');
      console.log(`${etudiantsPrepares.length} étudiants seraient insérés.`);
      
      // Afficher les 3 premiers pour vérification
      console.log('\n--- EXEMPLES D\'ÉTUDIANTS ---');
      etudiantsPrepares.slice(0, 3).forEach((etudiant, index) => {
        console.log(`${index + 1}. ${etudiant.nomComplet} (${etudiant.codeMassar}) - ${etudiant.niveau}`);
      });
      
      return;
    }
    
    // Mode INSERTION RÉELLE - Maintenant activé
    await mongoose.connect(MONGODB_URI);
    console.log('Connexion MongoDB établie');
    
    let inserted = 0;
    let skipped = 0;
    
    for (const etudiantData of etudiantsPrepares) {
      try {
        // Vérifier si l'étudiant existe déjà (par code Massar ou email)
        const existant = await Etudiant.findOne({
          $or: [
            { codeMassar: etudiantData.codeMassar },
            { email: etudiantData.email }
          ]
        });
        
        if (existant) {
          console.log(`Étudiant existant ignoré: ${etudiantData.nomComplet} (${etudiantData.codeMassar})`);
          skipped++;
          continue;
        }
        
        // Insérer le nouvel étudiant
        const nouvelEtudiant = new Etudiant(etudiantData);
        await nouvelEtudiant.save();
        inserted++;
        
        if (inserted % 10 === 0) {
          console.log(`${inserted} étudiants insérés...`);
        }
        
      } catch (error) {
        console.error(`Erreur insertion ${etudiantData.nomComplet}:`, error.message);
        skipped++;
      }
    }
    
    console.log(`\n✅ Import terminé:`);
    console.log(`- Insérés: ${inserted}`);
    console.log(`- Ignorés: ${skipped}`);
    console.log(`- Total traités: ${inserted + skipped}`);
    
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Connexion MongoDB fermée');
    }
  }
}

// Exécution du script
const filePath = process.argv[2];
const mongoUri = process.argv[3];

// Validation des paramètres
if (!filePath) {
  console.error('❌ Erreur: Chemin du fichier Excel requis');
  console.log('Usage: node import_etudiants.js <chemin_fichier_excel> [mongodb_uri]');
  console.log('Exemple: node import_etudiants.js "C:/Users/hp/Downloads/ListEleveNonReinscrits_20250820 (1).xls" "mongodb://localhost:27017/zattat_db"');
  process.exit(1);
}

// Configurer l'URI MongoDB si fournie
if (mongoUri) {
  process.env.MONGODB_URI = mongoUri;
}

if (require.main === module) {
  console.log('=== IMPORT EXCEL VERS MONGODB ===');
  console.log(`Fichier Excel: ${filePath}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/votre_base_de_donnees'}`);
  console.log(`Année scolaire: 2025/2026\n`);
  
  importFromExcel(filePath)
    .then(() => {
      console.log('\n✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { importFromExcel };