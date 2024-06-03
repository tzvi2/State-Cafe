const express = require('express');
const router = express.Router();

const {getQuantityRemaining, updateQuantityRemaining} = require('../controllers/stockControllers')

router.get('get-remaining-quantity', getQuantityRemaining)
router.put('/update-quantity-remaining', updateQuantityRemaining);

module.exports = router