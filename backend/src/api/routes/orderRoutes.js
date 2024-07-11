const express = require('express')
const router = express.Router()
const {handleSaveOrder, getOrdersForDate} = require('../controllers/orderController')

router.post("/", handleSaveOrder)
router.get('/get-orders-for-date', getOrdersForDate)

module.exports = router