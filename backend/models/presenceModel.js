const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema({
  etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'Etudiant', required: true },
  cours: { type: String, required: true }, // أو ObjectId لو عندك جدول Cours
  dateSession: { type: Date, required: true },
  present: { type: Boolean, default: false },
  remarque: { type: String },
  creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('Presence', presenceSchema);
