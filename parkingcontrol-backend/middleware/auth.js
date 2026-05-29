const jwt = require('jsonwebtoken');
require('dotenv').config();

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalido o expirado' });
    }
    req.usuario = usuario;
    next();
  });
}

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'ADMINISTRADOR') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
}

module.exports = { autenticarToken, soloAdmin };
