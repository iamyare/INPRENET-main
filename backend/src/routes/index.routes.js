const express = require('express');
const empresaRoutes = require('./empresa.routes');
const AuthRoutes = require('./auth.routes');
const centrosTrabajo = require('./centrosTrabajo.routes');
const afiliado = require('./afiliado.routes');
const bancos = require('./banco.routes');
const direccion = require('./direccion.routes');
const router = express.Router();

router.use('/empresas', empresaRoutes);
router.use('/auth', AuthRoutes);
router.use('/centrosTrabajo', centrosTrabajo);
router.use('/afiliados', afiliado);
router.use('/bancos', bancos);
router.use('/direccion/', direccion);

module.exports = router;
