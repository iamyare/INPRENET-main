const express = require('express');
const router = express.Router();
const { signUp, confirm, updateData} = require('../controllers/auth.controller')


router.post('/signup', signUp);

router.get('/confirm/:token', confirm);
router.get('/updateData/:token', updateData)

module.exports = router;