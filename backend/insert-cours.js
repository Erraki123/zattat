const mongoose = require('mongoose');

// === Schéma Cours (qui représente les CLASSES) ===
const coursSchema = new mongoose.Schema({
  nom: { type: String, required: true }, // Le nom de la classe (ex: "2BAC Économie")
  creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  professeur: { type: [String], default: [] },
  niveau: {
    type: String,
    enum: [
      // Collège
      "6ème Collège", "5ème Collège", "4ème Collège", "3ème Collège",
      // Lycée Tronc Commun
      "Tronc Commun Scientifique", "Tronc Commun Littéraire", "Tronc Commun Technique",
      // 1ère Bac
      "1BAC SM", "1BAC PC", "1BAC SVT", "1BAC Lettres", "1BAC Économie", "1BAC Technique",
      // 2ème Bac
      "2BAC SMA", "2BAC SMB", "2BAC PC", "2BAC SVT", "2BAC Lettres", "2BAC Économie", "2BAC Technique"
    ],
    required: true
  }
}, { timestamps: true });

const Cours = mongoose.model('Cours', coursSchema);

// === Données des CLASSES à insérer ===
const classesData = [
  // === COLLÈGE ===
  { nom: "6ème Collège", niveau: "6ème Collège" },
  { nom: "5ème Collège", niveau: "5ème Collège" },
  { nom: "4ème Collège", niveau: "4ème Collège" },
  { nom: "3ème Collège", niveau: "3ème Collège" },

  // === TRONC COMMUN ===
  { nom: "Tronc Commun Scientifique", niveau: "Tronc Commun Scientifique" },
  { nom: "Tronc Commun Littéraire", niveau: "Tronc Commun Littéraire" },
  { nom: "Tronc Commun Technique", niveau: "Tronc Commun Technique" },

  // === 1ÈRE BAC ===
  { nom: "1BAC SM", niveau: "1BAC SM" },
  { nom: "1BAC PC", niveau: "1BAC PC" },
  { nom: "1BAC SVT", niveau: "1BAC SVT" },
  { nom: "1BAC Lettres", niveau: "1BAC Lettres" },
  { nom: "1BAC Économie", niveau: "1BAC Économie" },
  { nom: "1BAC Technique", niveau: "1BAC Technique" },

  // === 2ÈME BAC ===
  { nom: "2BAC SMA", niveau: "2BAC SMA" },
  { nom: "2BAC SMB", niveau: "2BAC SMB" },
  { nom: "2BAC PC", niveau: "2BAC PC" },
  { nom: "2BAC SVT", niveau: "2BAC SVT" },
  { nom: "2BAC Lettres", niveau: "2BAC Lettres" },
  { nom: "2BAC Économie", niveau: "2BAC Économie" },
  { nom: "2BAC Technique", niveau: "2BAC Technique" }
];

// === Configuration MongoDB ===
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zattat_db';

// === Fonction principale ===
async function insertClasses() {
  try {
    console.log('=== INSERTION DES CLASSES ===');
    console.log(`Connexion à: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connecté à MongoDB");

    // Vérifier les classes existantes
    const existingClasses = await Cours.countDocuments();
    console.log(`Classes existantes en base: ${existingClasses}`);

    if (existingClasses > 0) {
      console.log("⚠️  Des classes existent déjà. Les doublons seront ignorés.");
    }

    let inserted = 0;
    let skipped = 0;

    console.log(`\nInsertion de ${classesData.length} classes...`);

    for (const classeItem of classesData) {
      try {
        // Vérifier si la classe existe déjà
        const existant = await Cours.findOne({
          nom: classeItem.nom,
          niveau: classeItem.niveau
        });

        if (existant) {
          console.log(`Classe existante ignorée: ${classeItem.nom}`);
          skipped++;
          continue;
        }

        // Insérer la nouvelle classe
        const nouvelleClasse = new Cours(classeItem);
        await nouvelleClasse.save();
        console.log(`✅ Classe créée: ${classeItem.nom}`);
        inserted++;

      } catch (error) {
        console.error(`❌ Erreur insertion ${classeItem.nom}:`, error.message);
        skipped++;
      }
    }

    console.log(`\n🎉 Import terminé:`);
    console.log(`- Classes insérées: ${inserted}`);
    console.log(`- Classes ignorées (doublons): ${skipped}`);
    console.log(`- Total traité: ${inserted + skipped}`);

    // Afficher toutes les classes créées
    console.log('\n=== CLASSES DISPONIBLES ===');
    const toutesLesClasses = await Cours.find({}).sort({ niveau: 1, nom: 1 });
    
    console.log('\n📚 COLLÈGE:');
    toutesLesClasses.filter(c => c.niveau.includes('Collège')).forEach(classe => {
      console.log(`   - ${classe.nom}`);
    });

    console.log('\n📖 TRONC COMMUN:');
    toutesLesClasses.filter(c => c.niveau.includes('Tronc Commun')).forEach(classe => {
      console.log(`   - ${classe.nom}`);
    });

    console.log('\n📘 1ÈRE BAC:');
    toutesLesClasses.filter(c => c.niveau.includes('1BAC')).forEach(classe => {
      console.log(`   - ${classe.nom}`);
    });

    console.log('\n📗 2ÈME BAC:');
    toutesLesClasses.filter(c => c.niveau.includes('2BAC')).forEach(classe => {
      console.log(`   - ${classe.nom}`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Déconnexion MongoDB");

  } catch (err) {
    console.error("❌ Erreur:", err);
    process.exit(1);
  }
}

// === Alternative: Script avec options personnalisées ===
async function insertClassesPersonnalisees() {
  try {
    console.log('=== INSERTION DE CLASSES PERSONNALISÉES ===');
    
    // Vous pouvez ajouter d'autres classes si nécessaire
    const classesSupplementaires = [
      // Exemples de classes multiples pour le même niveau
      { nom: "2BAC Économie A", niveau: "2BAC Économie" },
      { nom: "2BAC Économie B", niveau: "2BAC Économie" },
      { nom: "1BAC PC A", niveau: "1BAC PC" },
      { nom: "1BAC PC B", niveau: "1BAC PC" },
      // Ajoutez d'autres classes selon vos besoins...
    ];

    // Vous pouvez décommenter cette section si vous voulez des classes multiples
    /*
    await mongoose.connect(MONGODB_URI);
    
    for (const classe of classesSupplementaires) {
      const existant = await Cours.findOne({ nom: classe.nom, niveau: classe.niveau });
      if (!existant) {
        await new Cours(classe).save();
        console.log(`✅ Classe supplémentaire créée: ${classe.nom}`);
      }
    }
    
    await mongoose.disconnect();
    */
    
    console.log('Fonction prête pour classes personnalisées (décommentez le code si nécessaire)');
  } catch (error) {
    console.error('Erreur classes personnalisées:', error);
  }
}

// === Exécution ===
if (require.main === module) {
  insertClasses()
    .then(() => {
      console.log('\n🎉 Script terminé avec succès');
      console.log('Toutes les classes du système éducatif marocain ont été créées !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { insertClasses, insertClassesPersonnalisees, Cours };