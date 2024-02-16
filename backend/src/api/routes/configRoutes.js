const express = require('express')
const router = express.Router()
const {handleConfigRequest} = require('../controllers/configController')

router.get('/', handleConfigRequest)

module.exports = router