const mongoose = require('mongoose');

const etudiantSchema = new mongoose.Schema({
  nomComplet: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    enum: ['Homme', 'Femme'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  motDePasse: {
    type: String,
    required: true
  },
  dateNaissance: {
    type: Date,
    required: true
  },
niveau: {
  type: String,
  enum: [
    // Collège
    "6ème Collège",
    "5ème Collège",
    "4ème Collège",
    "3ème Collège",

    // Lycée Tronc Commun
    "Tronc Commun Scientifique",
    "Tronc Commun Littéraire",
    "Tronc Commun Technique",

    // 1ère Bac
    "1BAC SM",     // Sciences Mathématiques
    "1BAC PC",     // Sciences Physiques
    "1BAC SVT",    // Sciences de la Vie et Terre
    "1BAC Lettres",
    "1BAC Économie",
    "1BAC Technique",

    // 2ème Bac
    "2BAC SMA",    // Sciences Mathématiques A
    "2BAC SMB",    // Sciences Mathématiques B
    "2BAC PC",     // Sciences Physiques
    "2BAC SVT",    // Sciences de la Vie et Terre
    "2BAC Lettres",
    "2BAC Économie",
    "2BAC Technique"
  ],
  required: true
},

  // Téléphones
  telephoneEtudiant: {
    type: String,
    required: true
  },
  telephonePere: {
    type: String,
    default: ''
  },
  telephoneMere: {
    type: String,
    default: ''
  },

  // Code Massar
  codeMassar: {
    type: String,
    required: true,
    unique: true
  },

  // Adresse
  adresse: {
    type: String,
    default: ''
  },

  cours: {
    type: [String],
    default: []
  },
  image: {
    type: String,
    default: ''
  },
  actif: {
    type: Boolean,
    default: true
  },
  creeParAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastSeen: {
    type: Date,
    default: null
  },
  
  // NOUVEAUX CHAMPS AJOUTÉS pour la gestion des paiements
  prixTotal: {
    type: Number,
    default: 0
  },
  paye: {
    type: Boolean,
    default: false
  },
  
  // CHAMPS OPTIONNELS SUPPLÉMENTAIRES pour une meilleure gestion financière
  pourcentageBourse: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  typePaiement: {
    type: String,
    enum: ['Cash', 'Virement', 'Chèque', 'En ligne'],
    default: 'Cash'
  },
  // Remplacer dateEtReglement par anneeScolaire
  anneeScolaire: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Valide le format YYYY/YYYY (ex: 2025/2026)
        return /^\d{4}\/\d{4}$/.test(v);
      },
      message: 'L\'année scolaire doit être au format YYYY/YYYY (ex: 2025/2026)'
    }
  }
}, { timestamps: true });

// Virtual pour le nom complet (corrigé)
etudiantSchema.virtual('nomCompletVirtuel').get(function () {
  return this.nomComplet || '';
});

// Virtual pour telephone qui retourne telephoneEtudiant
etudiantSchema.virtual('telephone').get(function () {
  return this.telephoneEtudiant || '';
});

// NOUVEAU: Virtual pour le montant à payer après bourse
etudiantSchema.virtual('montantAPayer').get(function () {
  const reduction = (this.prixTotal * this.pourcentageBourse) / 100;
  return this.prixTotal - reduction;
});

// NOUVEAU: Virtual pour le statut de paiement avec détails
etudiantSchema.virtual('statutPaiement').get(function () {
  if (this.paye) {
    return 'Payé';
  } else if (this.prixTotal === 0) {
    return 'Gratuit';
  } else {
    return 'En attente';
  }
});

// NOUVEAU: Méthode pour marquer comme payé
etudiantSchema.methods.marquerCommePaye = function() {
  this.paye = true;
  this.dateEtReglement = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  return this.save();
};

// NOUVEAU: Méthode pour calculer le montant restant
etudiantSchema.methods.getMontantRestant = function() {
  if (this.paye) {
    return 0;
  }
  return this.montantAPayer;
};

// NOUVEAU: Méthode statique pour obtenir les statistiques de paiement
etudiantSchema.statics.getStatistiquesPaiement = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalEtudiants: { $sum: 1 },
        etudiantsPayes: {
          $sum: { $cond: [{ $eq: ['$paye', true] }, 1, 0] }
        },
        etudiantsNonPayes: {
          $sum: { $cond: [{ $eq: ['$paye', false] }, 1, 0] }
        },
        montantTotalAttendu: { $sum: '$prixTotal' },
        montantTotalPaye: {
          $sum: { $cond: [{ $eq: ['$paye', true] }, '$prixTotal', 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalEtudiants: 1,
        etudiantsPayes: 1,
        etudiantsNonPayes: 1,
        montantTotalAttendu: 1,
        montantTotalPaye: 1,
        pourcentagePaiement: {
          $cond: [
            { $eq: ['$totalEtudiants', 0] },
            0,
            { $multiply: [{ $divide: ['$etudiantsPayes', '$totalEtudiants'] }, 100] }
          ]
        }
      }
    }
  ]);
};

etudiantSchema.set('toObject', { virtuals: true });
etudiantSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Etudiant', etudiantSchema);
