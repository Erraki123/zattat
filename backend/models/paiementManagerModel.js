const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const paiementManagerSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  telephone: { type: String },
  email: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true },
  actif: { type: Boolean, default: true }
}, { timestamps: true });

// Hachage du mot de passe avant sauvegarde


// Méthode pour comparer les mots de passe
paiementManagerSchema.methods.comparePassword = function(motDePasse) {
  return bcrypt.compare(motDePasse, this.motDePasse);
};

module.exports = mongoose.model('PaiementManager', paiementManagerSchema);
