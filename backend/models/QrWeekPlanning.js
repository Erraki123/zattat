// ✅ fichier: models/QrWeekPlanning.js
const mongoose = require('mongoose');

const qrWeekPlanningSchema = new mongoose.Schema({
  jour: { type: String, required: true }, // "lundi", "mardi", ...
cours: { type: String, required: true },
  periode: { type: String, enum: ['matin', 'soir'], required: true },
  professeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Professeur', required: true },
  matiere: { type: String, required: false }
});

module.exports = mongoose.model('QrWeekPlanning', qrWeekPlanningSchema);