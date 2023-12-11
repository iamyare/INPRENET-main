const express = require('express');
const router = express.Router();
const { getCentrosTrabajo, getCentroTrabajoById, crearCentroTrabajo, updateCentroTrabajo, buscarCentroTrabajoPorNombre } = require('../controllers/centrosTrabajo.controller');


router.get('/', getCentrosTrabajo);
router.get('/:id', getCentroTrabajoById);
router.put('/actualizarCentro/:id', updateCentroTrabajo);
router.post('/nuevoCentro', crearCentroTrabajo);
router.post('/obtenerCentro', buscarCentroTrabajoPorNombre);

module.exports = router;