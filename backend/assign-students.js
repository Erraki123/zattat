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
  cours: { type: [String], default: [] }, // IDs des cours/classes
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
  nom: { type: String, required: true }, // Nom de la classe
  creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  professeur: { type: [String], default: [] },
  niveau: { type: String, required: true } // Niveau de la classe
}, { timestamps: true });

const Etudiant = mongoose.model('Etudiant', etudiantSchema, 'etudiants');
const Cours = mongoose.model('Cours', coursSchema, 'cours');

// === Fonction principale d'assignation ===
async function assignStudentsToClasses() {
  try {
    console.log('=== ASSIGNATION DES ÉTUDIANTS AUX CLASSES ===');
    console.log(`Connexion à: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer tous les étudiants
    const etudiants = await Etudiant.find({});
    console.log(`\n📚 ${etudiants.length} étudiants trouvés`);

    // Récupérer tous les cours/classes
    const cours = await Cours.find({});
    console.log(`🏫 ${cours.length} classes trouvées`);

    if (cours.length === 0) {
      console.log('❌ Aucune classe trouvée. Veuillez d\'abord créer les classes.');
      return;
    }

    // Créer un mapping niveau -> nom de classe
    const niveauToCoursName = {};
    cours.forEach(c => {
      niveauToCoursName[c.niveau] = c.nom;
    });

    console.log('\n=== MAPPING NIVEAU -> CLASSE ===');
    Object.keys(niveauToCoursName).forEach(niveau => {
      console.log(`${niveau} -> ${niveauToCoursName[niveau]}`);
    });

    let assigned = 0;
    let skipped = 0;
    let errors = 0;

    console.log('\n=== ASSIGNATION EN COURS ===');

    for (const etudiant of etudiants) {
      try {
        const coursName = niveauToCoursName[etudiant.niveau];
        
        if (!coursName) {
          console.log(`⚠️  Niveau non trouvé pour ${etudiant.nomComplet}: ${etudiant.niveau}`);
          skipped++;
          continue;
        }

        // Vérifier si l'étudiant est déjà assigné à cette classe
        if (etudiant.cours.includes(coursName)) {
          // console.log(`➡️  ${etudiant.nomComplet} déjà assigné à ${coursName}`);
          skipped++;
          continue;
        }

        // Assigner l'étudiant à sa classe (nom de la classe, pas l'ID)
        await Etudiant.updateOne(
          { _id: etudiant._id },
          { $addToSet: { cours: coursName } } // Ajouter le nom de la classe
        );

        console.log(`✅ ${etudiant.nomComplet} assigné à ${coursName}`);
        assigned++;

        // Afficher le progrès tous les 20 étudiants
        if ((assigned + skipped + errors) % 20 === 0) {
          console.log(`   📊 Progrès: ${assigned + skipped + errors}/${etudiants.length}`);
        }

      } catch (error) {
        console.error(`❌ Erreur assignation ${etudiant.nomComplet}:`, error.message);
        errors++;
      }
    }

    console.log(`\n🎉 ASSIGNATION TERMINÉE:`);
    console.log(`- Étudiants assignés: ${assigned}`);
    console.log(`- Déjà assignés (ignorés): ${skipped}`);
    console.log(`- Erreurs: ${errors}`);
    console.log(`- Total traité: ${assigned + skipped + errors}`);

    // === Statistiques détaillées ===
    console.log('\n=== STATISTIQUES PAR CLASSE ===');
    
    for (const coursItem of cours) {
      const etudiantsInClass = await Etudiant.countDocuments({ 
        cours: coursItem.nom // Rechercher par nom de classe
      });
      console.log(`${coursItem.nom}: ${etudiantsInClass} étudiants`);
    }

    // === Vérification des étudiants non assignés ===
    const etudiantsNonAssignes = await Etudiant.find({ 
      $or: [
        { cours: { $size: 0 } },
        { cours: { $exists: false } }
      ]
    });

    if (etudiantsNonAssignes.length > 0) {
      console.log(`\n⚠️  ÉTUDIANTS NON ASSIGNÉS (${etudiantsNonAssignes.length}):`);
      etudiantsNonAssignes.forEach(etudiant => {
        console.log(`   - ${etudiant.nomComplet} (${etudiant.niveau})`);
      });
    } else {
      console.log('\n✅ Tous les étudiants sont assignés à une classe');
    }

    await mongoose.disconnect();
    console.log('\n✅ Déconnexion MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// === Fonction pour réassigner un étudiant spécifique ===
async function reassignStudent(codeMassar, nouveauNiveau) {
  try {
    await mongoose.connect(MONGODB_URI);

    const etudiant = await Etudiant.findOne({ codeMassar });
    if (!etudiant) {
      console.log(`❌ Étudiant non trouvé: ${codeMassar}`);
      return;
    }

    const nouveauCours = await Cours.findOne({ niveau: nouveauNiveau });
    if (!nouveauCours) {
      console.log(`❌ Classe non trouvée pour le niveau: ${nouveauNiveau}`);
      return;
    }

    // Mettre à jour le niveau et les cours
    await Etudiant.updateOne(
      { _id: etudiant._id },
      { 
        niveau: nouveauNiveau,
        cours: [nouveauCours.nom] // Utiliser le nom de la classe
      }
    );

    console.log(`✅ ${etudiant.nomComplet} réassigné de ${etudiant.niveau} vers ${nouveauNiveau}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur réassignation:', error);
  }
}

// === Fonction pour afficher les statistiques ===
async function showClassStatistics() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('=== STATISTIQUES DES CLASSES ===');
    
    const stats = await Etudiant.aggregate([
      {
        $unwind: '$cours' // Décomposer le tableau des cours
      },
      {
        $group: {
          _id: {
            niveau: '$niveau',
            nomClasse: '$cours' // Utiliser directement le nom de la classe
          },
          count: { $sum: 1 },
          etudiants: { $push: '$nomComplet' }
        }
      },
      {
        $sort: { '_id.niveau': 1 }
      }
    ]);

    stats.forEach(stat => {
      console.log(`\n📚 ${stat._id.nomClasse} (${stat._id.niveau}): ${stat.count} étudiants`);
      if (stat.count <= 10) { // Afficher les noms si peu d'étudiants
        stat.etudiants.forEach(nom => console.log(`   - ${nom}`));
      }
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur statistiques:', error);
  }
}

// === Exécution selon les arguments ===
if (require.main === module) {
  const action = process.argv[2];
  
  switch (action) {
    case 'assign':
      assignStudentsToClasses()
        .then(() => {
          console.log('\n🎉 Assignation terminée avec succès');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Erreur fatale:', error);
          process.exit(1);
        });
      break;
      
    case 'stats':
      showClassStatistics()
        .then(() => {
          console.log('\n✅ Statistiques affichées');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Erreur fatale:', error);
          process.exit(1);
        });
      break;
      
    case 'reassign':
      const codeMassar = process.argv[3];
      const nouveauNiveau = process.argv[4];
      
      if (!codeMassar || !nouveauNiveau) {
        console.log('Usage: node assign-students.js reassign <code_massar> <nouveau_niveau>');
        console.log('Exemple: node assign-students.js reassign F161136201 "2BAC PC"');
        process.exit(1);
      }
      
      reassignStudent(codeMassar, nouveauNiveau)
        .then(() => {
          console.log('✅ Réassignation terminée');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Erreur fatale:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('=== SCRIPT D\'ASSIGNATION DES ÉTUDIANTS AUX CLASSES ===');
      console.log('');
      console.log('Commandes disponibles:');
      console.log('  node assign-students.js assign     - Assigner tous les étudiants à leurs classes');
      console.log('  node assign-students.js stats      - Afficher les statistiques des classes');
      console.log('  node assign-students.js reassign <code_massar> <niveau> - Réassigner un étudiant');
      console.log('');
      console.log('Exemples:');
      console.log('  node assign-students.js assign');
      console.log('  node assign-students.js stats');
      console.log('  node assign-students.js reassign F161136201 "2BAC PC"');
      process.exit(1);
  }
}

module.exports = { 
  assignStudentsToClasses, 
  reassignStudent, 
  showClassStatistics 
};