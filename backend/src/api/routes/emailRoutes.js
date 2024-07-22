const express = require('express');
const { handleCheckEmails } = require('../controllers/emailController');
const router = express.Router();

router.post('/', handleCheckEmails);

module.exports = router;
