const express = require('express')
const router = express.Router()
const {handleCreatePaymentIntent, handleGetLastFour} = require('../controllers/paymentController')

router.post('/create-payment-intent', handleCreatePaymentIntent)
router.post('/get-last-four', handleGetLastFour)

module.exports = router