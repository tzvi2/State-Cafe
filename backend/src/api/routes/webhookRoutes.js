const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const {handleStripeWebhook} = require('../controllers/webhookController');

router.post('/', bodyParser.raw({type: 'application/json'}), handleStripeWebhook);

module.exports = router;