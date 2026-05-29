const express = require('express');
const router  = express.Router();
const { Espacio } = require('../models');
const { autenticarToken } = require('../middleware/auth');

// GET /api/disponibilidad
// Lista todos los espacios disponibles
router.get('/', autenticarToken, async (req, res) => {
  try {
    const espacios = await Espacio.findAll({
      where: { estado: 'DISPONIBLE' },
      attributes: ['id', 'numero', 'zona', 'tipo', 'estado']
    });

    res.json({
      total_disponibles: espacios.length,
      espacios,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error disponibilidad:', err);
    res.status(500).json({ error: 'Error al consultar disponibilidad' });
  }
});

// GET /api/disponibilidad/resumen
// Conteo por estado para el dashboard del frontend
router.get('/resumen', autenticarToken, async (req, res) => {
  try {
    const { Op } = require('sequelize');

    const [disponibles, ocupados, reservados, total] = await Promise.all([
      Espacio.count({ where: { estado: 'DISPONIBLE' } }),
      Espacio.count({ where: { estado: 'OCUPADO' } }),
      Espacio.count({ where: { estado: 'RESERVADO' } }),
      Espacio.count()
    ]);

    res.json({ disponibles, ocupados, reservados, total });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

module.exports = router;
