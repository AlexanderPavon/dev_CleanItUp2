const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'tu_secreto_jwt');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Por favor autentícate' });
  }
};

module.exports = auth;