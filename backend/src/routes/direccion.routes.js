const express = require('express');
const router = express.Router();

const { getAllPais, getAllCiudad, getAllProvincia } = require('../controllers/direccion.controller');

router.get('/paises/', getAllPais);
router.get('/ciudades/', getAllCiudad);
router.get('/provincias/', getAllProvincia);

module.exports = router;