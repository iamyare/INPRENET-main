const express = require('express');
const empresaRoutes = require('./empresa.routes');
const AuthRoutes = require('./auth.routes');
const router = express.Router();

router.use('/empresas', empresaRoutes);
router.use('/auth', AuthRoutes);

module.exports = router;
