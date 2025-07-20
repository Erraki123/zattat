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
}
,
  dateNaissance: {
    type: Date,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  cours: {
    type: [String], // ex: ["Math", "Français"]
    default: []
  },
  image: {
    type: String, // URL ou chemin local vers l’image
    default: ''
  },
  actif: {
    type: Boolean,
    default: true
  },
  creeParAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
  ,
  lastSeen: {
  type: Date,
  default: null
}
}, { timestamps: true });

module.exports = mongoose.model('Etudiant', etudiantSchema);
