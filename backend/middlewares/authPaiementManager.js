const jwt = require('jsonwebtoken');
const PaiementManager = require('../models/paiementManagerModel');

const authPaiementManager = async (req, res, next) => {
  try {
    // 1. Vérifier la présence du token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    // 2. Vérifier et décoder le token
    const decoded = jwt.verify(token, 'jwt_secret_key');
    console.log('Token décodé:', decoded); // Debug

    // 3. Chercher le gestionnaire dans la base
    const manager = await PaiementManager.findById(decoded.id);
    if (!manager) {
      console.log('Gestionnaire non trouvé pour ID:', decoded.id); // Debug
      return res.status(404).json({ message: 'Gestionnaire de paiement non trouvé' });
    }

    // 4. Vérifier si le compte est actif
    if (!manager.actif) {
      console.log('Compte gestionnaire inactif:', manager.email); // Debug
      return res.status(403).json({ message: '⛔ Compte gestionnaire inactif' });
    }

    // 5. Attacher les informations à la requête
    req.managerId = manager._id;
    req.manager = manager;
    req.userRole = 'paiement_manager';
    
    console.log('Authentification réussie pour:', manager.email); // Debug
    next();
    
  } catch (err) {
    console.error('Erreur authPaiementManager:', err); // Debug détaillé
    res.status(401).json({ 
      message: 'Token invalide ou expiré', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

module.exports = authPaiementManager;
