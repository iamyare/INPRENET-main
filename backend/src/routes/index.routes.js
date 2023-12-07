const express = require('express');
const empresaRoutes = require('./empresa.routes');
const AuthRoutes = require('./auth.routes');
const centrosTrabajo = require('./centrosTrabajo.routes');
const router = express.Router();

router.use('/empresas', empresaRoutes);
router.use('/auth', AuthRoutes);
router.use('/centrosTrabajo', centrosTrabajo);

module.exports = router;
