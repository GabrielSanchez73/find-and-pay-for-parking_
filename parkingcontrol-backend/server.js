const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://gabrielsanchez73.github.io',
  process.env.FRONTEND_URL
].filter(Boolean);

const app = express();
app.use(express.json());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.some(o => origin === o || origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true); // permitir otros origenes en demo academica
    }
  },
  credentials: true
}));

// Rutas de los servicios SOA
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/disponibilidad', require('./routes/disponibilidad'));
app.use('/api/ingreso',        require('./routes/ingreso'));
app.use('/api/salida',         require('./routes/salida'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ParkingControl SOA corriendo en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error conectando a la base de datos:', err);
  });
