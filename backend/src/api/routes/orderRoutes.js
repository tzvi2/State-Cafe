const express = require('express')
const router = express.Router()
const {handleSaveOrder} = require('../controllers/orderController')

router.post("/", handleSaveOrder)

module.exports = router