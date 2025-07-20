const mongoose = require('mongoose');

const exerciceSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  cours: { type: String, required: true },
  fichier: { type: String, required: true },
  etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'Etudiant' },
  dateEnvoi: { type: Date, default: Date.now },
  type: {
  type: String,
  enum: ['Devoir', 'Examen', 'TD'],
  default: 'Devoir'
},
numero: {
  type: Number,
  default: 1
},
corrige: {
  type: Boolean,
  default: false
}
, // ✅ corrige modifiable par le prof
  remarque: { type: String, default: null } // ✅ remarque modifiable par le prof
  
});

module.exports = mongoose.model('Exercice', exerciceSchema);
