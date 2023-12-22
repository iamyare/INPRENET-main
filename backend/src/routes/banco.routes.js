const express = require('express');
const router = express.Router();

const { getAllBancos } = require('../controllers/banco.controller');

router.get('/', getAllBancos);

module.exports = router;