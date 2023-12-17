const express = require('express');
const router = express.Router();
const { signUp, confirmAndUpdateSecurityInfo, updateData} = require('../controllers/auth.controller')


router.post('/signup', signUp);

router.put('/confirm', confirmAndUpdateSecurityInfo);
router.get('/updateData/:token', updateData)

module.exports = router;