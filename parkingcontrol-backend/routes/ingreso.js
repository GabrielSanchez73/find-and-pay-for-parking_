const express = require('express');
const router  = express.Router();
const { Registro, Espacio, sequelize } = require('../models');
const { autenticarToken } = require('../middleware/auth');

// POST /api/ingreso
// Body: { placa, espacioId, tipoVehiculo }
router.post('/', autenticarToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { placa, espacioId, tipoVehiculo } = req.body;

    if (!placa || !espacioId) {
      await t.rollback();
      return res.status(400).json({ error: 'placa y espacioId son requeridos' });
    }

    // Verificar que el espacio exista y este disponible
    const espacio = await Espacio.findByPk(espacioId, { transaction: t });
    if (!espacio) {
      await t.rollback();
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }
    if (espacio.estado !== 'DISPONIBLE') {
      await t.rollback();
      return res.status(409).json({ error: 'El espacio no esta disponible', estado: espacio.estado });
    }

    // Crear el registro de ingreso
    const registro = await Registro.create({
      placa:        placa.toUpperCase().trim(),
      espacioId,
      tipoVehiculo: tipoVehiculo || 'CARRO',
      horaIngreso:  new Date(),
      operadorId:   req.usuario.id
    }, { transaction: t });

    // Marcar el espacio como OCUPADO
    await espacio.update({ estado: 'OCUPADO' }, { transaction: t });

    await t.commit();

    res.status(201).json({
      ticketId:    registro.id,
      placa:       registro.placa,
      espacio:     espacio.numero,
      zona:        espacio.zona,
      horaIngreso: registro.horaIngreso,
      operador:    req.usuario.nombre
    });

  } catch (err) {
    await t.rollback();
    console.error('Error en ingreso:', err);
    res.status(500).json({ error: 'Error al registrar ingreso' });
  }
});

// GET /api/ingreso/:placa
// Consultar si un vehiculo esta actualmente adentro
router.get('/:placa', autenticarToken, async (req, res) => {
  try {
    const registro = await Registro.findOne({
      where: {
        placa:      req.params.placa.toUpperCase(),
        horaSalida: null
      },
      include: [Espacio]
    });

    if (!registro) {
      return res.status(404).json({ error: 'Vehiculo no encontrado o ya salio' });
    }

    res.json({
      ticketId:    registro.id,
      placa:       registro.placa,
      espacio:     registro.Espacio.numero,
      horaIngreso: registro.horaIngreso
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar vehiculo' });
  }
});

module.exports = router;
