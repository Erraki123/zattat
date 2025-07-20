const jwt = require('jsonwebtoken');

const authProfesseur = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
  }

  try {
    const decoded = jwt.verify(token, 'jwt_secret_key');

    // تأكد أن الدور هو "prof"
    if (decoded.role !== 'prof') {
      return res.status(403).json({ message: 'Accès non autorisé (rôle incorrect).' });
    }

    req.professeurId = decoded.id; // حفظ المعرف للاستعمال لاحقاً
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide.' });
  }
};

module.exports = authProfesseur;
