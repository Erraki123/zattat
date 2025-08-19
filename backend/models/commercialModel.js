const mongoose = require('mongoose');

const commercialSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  telephone: {
    type: String
  },
  email: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Commercial', commercialSchema);
