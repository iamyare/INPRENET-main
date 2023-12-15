const express = require('express');
const router = express.Router();
const { getAllAfiliado, createAfiliado} = require('../controllers/afiliado.controller');

router.post('/agregarAfiliado', createAfiliado);
router.get('/', getAllAfiliado);


module.exports = router;