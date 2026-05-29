const express = require('express');
const router  = express.Router();
const { Registro, Espacio, Tarifa, sequelize } = require('../models');
const { autenticarToken } = require('../middleware/auth');

// POST /api/salida
// Body: { ticketId }
router.post('/', autenticarToken, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      await t.rollback();
      return res.status(400).json({ error: 'ticketId es requerido' });
    }

    const registro = await Registro.findByPk(ticketId, {
      include: [Espacio],
      transaction: t
    });

    if (!registro) {
      await t.rollback();
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    if (registro.horaSalida) {
      await t.rollback();
      return res.status(400).json({ error: 'Este ticket ya fue cerrado' });
    }

    // Calcular tiempo en minutos (minimo 1 minuto)
    const horaSalida   = new Date();
    const minutosTotal = Math.max(
      1,
      Math.ceil((horaSalida - new Date(registro.horaIngreso)) / 60000)
    );

    // Obtener tarifa vigente por tipo de vehiculo
    const tarifa = await Tarifa.findOne({
      where: { tipoVehiculo: registro.tipoVehiculo, activa: true }
    });
    const valorHora  = tarifa ? parseFloat(tarifa.valorHora) : 3000;
    const horas      = Math.ceil(minutosTotal / 60);
    const totalPagar = horas * valorHora;

    // Actualizar registro y liberar espacio
    await registro.update({ horaSalida, minutosTotal, totalPagar }, { transaction: t });
    await registro.Espacio.update({ estado: 'DISPONIBLE' }, { transaction: t });

    await t.commit();

    res.json({
      ticketId,
      placa:       registro.placa,
      espacio:     registro.Espacio.numero,
      horaIngreso: registro.horaIngreso,
      horaSalida,
      minutosTotal,
      horas,
      valorHora,
      totalPagar,
      moneda:      'COP'
    });

  } catch (err) {
    await t.rollback();
    console.error('Error en salida:', err);
    res.status(500).json({ error: 'Error al registrar salida' });
  }
});

module.exports = router;
