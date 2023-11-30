const express = require('express');
const router = express.Router();
const { getAllEmpresas, getEmpresaById, createEmpresa, updateEmpresa, deleteEmpresa } = require('../controllers/empresa.controller');

router.get('/', getAllEmpresas);

router.get('/:id', getEmpresaById);

router.post('/', createEmpresa);

router.put('/:id', updateEmpresa);

router.delete('/:id', deleteEmpresa);

module.exports = router;
