const express = require('express');
const router = express.Router();
const { getAllAfiliado } = require('../controllers/afiliado.controller');

router.get('/', getAllAfiliado);


module.exports = router;