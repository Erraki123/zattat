const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etudiant',
    required: true
  },
 cours: {
  type: [String], // ✅ Array بدلاً من String
  required: true
}
,
  moisDebut: {
    type: Date,
    required: true // مثل: 2025-06-01
  },
  nombreMois: {
    type: Number,
    required: true // مثل: 2 (شهرين)
  },
  montant: {
    type: Number,
    required: true // مثل: 300
  },
  note: {
    type: String // ملاحظات اختيارية
  },
  creePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin' // من قام بإدخال الدفع
  }
}, {
  timestamps: true // createdAt و updatedAt
});

module.exports = mongoose.model('Paiement', paiementSchema);
