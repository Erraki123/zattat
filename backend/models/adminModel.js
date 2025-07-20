const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    motDePasse: {
        type: String,
        required: true
    }
}, { timestamps: true });

// ✅ نحتفظ فقط بهذه الطريقة للمقارنة
adminSchema.methods.comparePassword = function (mot) {
    return bcrypt.compare(mot, this.motDePasse);
};

module.exports = mongoose.model('Admin', adminSchema);
