const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zattat_db';

// === Schémas ===
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
  cours: { type: [String], default: [] }, // IDs OU noms des cours/classes
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

const coursSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  professeur: { type: [String], default: [] },
  niveau: { type: String, required: true }
}, { timestamps: true });

const Etudiant = mongoose.model('Etudiant', etudiantSchema, 'etudiants');
const Cours = mongoose.model('Cours', coursSchema, 'cours');

// === Fonction pour détecter si c'est un ID MongoDB ===
function isMongoId(str) {
  // Un ID MongoDB fait 24 caractères hexadécimaux
  return /^[0-9a-fA-F]{24}$/.test(str);
}

// === Fonction principale de nettoyage ===
async function cleanStudentCourses() {
  try {
    console.log('=== NETTOYAGE DES COURS DES ÉTUDIANTS ===');
    console.log(`Connexion à: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer tous les étudiants qui ont des cours
    const etudiants = await Etudiant.find({ 
      cours: { $exists: true, $not: { $size: 0 } } 
    });
    
    console.log(`\n📚 ${etudiants.length} étudiants avec des cours trouvés`);

    // Récupérer tous les cours pour le mapping ID -> nom
    const tousLesCours = await Cours.find({});
    const idToNom = {};
    tousLesCours.forEach(cours => {
      idToNom[cours._id.toString()] = cours.nom;
    });

    console.log(`🏫 ${tousLesCours.length} classes disponibles pour mapping`);

    let cleaned = 0;
    let alreadyClean = 0;
    let errors = 0;

    console.log('\n=== NETTOYAGE EN COURS ===');

    for (const etudiant of etudiants) {
      try {
        let needsUpdate = false;
        const nouveauxCours = [];

        console.log(`\n👤 ${etudiant.nomComplet}:`);
        console.log(`   Cours actuels: ${JSON.stringify(etudiant.cours)}`);

        for (const cours of etudiant.cours) {
          if (isMongoId(cours)) {
            // C'est un ID, le convertir en nom
            const nomCours = idToNom[cours];
            if (nomCours) {
              console.log(`   🔄 ID ${cours} -> ${nomCours}`);
              nouveauxCours.push(nomCours);
              needsUpdate = true;
            } else {
              console.log(`   ⚠️  ID ${cours} non trouvé dans les classes`);
              // Essayer de mapper via le niveau de l'étudiant
              const coursParNiveau = tousLesCours.find(c => c.niveau === etudiant.niveau);
              if (coursParNiveau) {
                console.log(`   🔄 Mapping par niveau: ${etudiant.niveau} -> ${coursParNiveau.nom}`);
                nouveauxCours.push(coursParNiveau.nom);
                needsUpdate = true;
              }
            }
          } else {
            // C'est déjà un nom, le garder
            console.log(`   ✅ Nom déjà correct: ${cours}`);
            nouveauxCours.push(cours);
          }
        }

        if (needsUpdate) {
          // Supprimer les doublons
          const coursUniques = [...new Set(nouveauxCours)];
          
          await Etudiant.updateOne(
            { _id: etudiant._id },
            { cours: coursUniques }
          );

          console.log(`   ✅ Mis à jour: ${JSON.stringify(coursUniques)}`);
          cleaned++;
        } else {
          console.log(`   ➡️  Déjà propre`);
          alreadyClean++;
        }

      } catch (error) {
        console.error(`❌ Erreur nettoyage ${etudiant.nomComplet}:`, error.message);
        errors++;
      }
    }

    console.log(`\n🎉 NETTOYAGE TERMINÉ:`);
    console.log(`- Étudiants nettoyés: ${cleaned}`);
    console.log(`- Déjà propres: ${alreadyClean}`);
    console.log(`- Erreurs: ${errors}`);
    console.log(`- Total traité: ${cleaned + alreadyClean + errors}`);

    await mongoose.disconnect();
    console.log('\n✅ Déconnexion MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// === Fonction pour vider complètement les cours et les réassigner ===
async function resetAndReassignCourses() {
  try {
    console.log('=== RESET COMPLET ET RÉASSIGNATION ===');
    console.log(`Connexion à: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Étape 1: Vider tous les cours
    console.log('\n🧹 Étape 1: Vidage de tous les cours...');
    const result = await Etudiant.updateMany(
      {},
      { $set: { cours: [] } }
    );
    console.log(`✅ ${result.modifiedCount} étudiants vidés`);

    // Étape 2: Récupérer les mappings
    const tousLesCours = await Cours.find({});
    const niveauToNom = {};
    tousLesCours.forEach(cours => {
      niveauToNom[cours.niveau] = cours.nom;
    });

    // Étape 3: Réassigner selon le niveau
    console.log('\n🎯 Étape 2: Réassignation selon le niveau...');
    let assigned = 0;

    for (const [niveau, nomClasse] of Object.entries(niveauToNom)) {
      const updateResult = await Etudiant.updateMany(
        { niveau: niveau },
        { $set: { cours: [nomClasse] } }
      );
      console.log(`✅ ${niveau} -> ${nomClasse}: ${updateResult.modifiedCount} étudiants`);
      assigned += updateResult.modifiedCount;
    }

    console.log(`\n🎉 RESET ET RÉASSIGNATION TERMINÉS:`);
    console.log(`- Total étudiants réassignés: ${assigned}`);

    await mongoose.disconnect();
    console.log('\n✅ Déconnexion MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// === Fonction pour afficher l'état actuel ===
async function showCurrentState() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('=== ÉTAT ACTUEL DES COURS ===');
    
    const etudiants = await Etudiant.find({ 
      cours: { $exists: true, $not: { $size: 0 } } 
    }).limit(10);

    console.log('\n📋 Échantillon d\'étudiants:');
    etudiants.forEach(etudiant => {
      console.log(`${etudiant.nomComplet}:`);
      etudiant.cours.forEach(cours => {
        const type = isMongoId(cours) ? '🔴 ID' : '🟢 NOM';
        console.log(`   ${type} ${cours}`);
      });
    });

    // Compter les IDs vs noms
    const tousEtudiants = await Etudiant.find({ 
      cours: { $exists: true, $not: { $size: 0 } } 
    });

    let totalIds = 0;
    let totalNoms = 0;

    tousEtudiants.forEach(etudiant => {
      etudiant.cours.forEach(cours => {
        if (isMongoId(cours)) {
          totalIds++;
        } else {
          totalNoms++;
        }
      });
    });

    console.log(`\n📊 Statistiques:`);
    console.log(`- Cours avec IDs (à nettoyer): ${totalIds}`);
    console.log(`- Cours avec noms (corrects): ${totalNoms}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// === Exécution selon les arguments ===
if (require.main === module) {
  const action = process.argv[2];
  
  switch (action) {
    case 'clean':
      cleanStudentCourses()
        .then(() => {
          console.log('\n🎉 Nettoyage terminé avec succès');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Erreur fatale:', error);
          process.exit(1);
        });
      break;
      
    case 'reset':
      resetAndReassignCourses()
        .then(() => {
          console.log('\n🎉 Reset et réassignation terminés');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Erreur fatale:', error);
          process.exit(1);
        });
      break;
      
    case 'status':
      showCurrentState()
        .then(() => {
          console.log('\n✅ État affiché');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Erreur fatale:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('=== SCRIPT DE NETTOYAGE DES COURS ===');
      console.log('');
      console.log('Commandes disponibles:');
      console.log('  node clean-courses.js status  - Voir l\'état actuel');
      console.log('  node clean-courses.js clean   - Nettoyer les IDs en gardant les noms');
      console.log('  node clean-courses.js reset   - Vider tout et réassigner proprement');
      console.log('');
      console.log('Recommandé: Commencez par "status" pour voir le problème');
      process.exit(1);
  }
}

module.exports = { 
  cleanStudentCourses, 
  resetAndReassignCourses, 
  showCurrentState 
};