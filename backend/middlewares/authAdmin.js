const jwt = require('jsonwebtoken');

const authAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
    }

    try {
        const decoded = jwt.verify(token, 'jwt_secret_key');
        req.adminId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalide.' });
    }
};

module.exports = authAdmin;
