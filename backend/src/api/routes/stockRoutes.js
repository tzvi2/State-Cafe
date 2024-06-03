const express = require('express');
const router = express.Router();

const {getQuantityRemaining, updateQuantityRemaining, setAllProductQuantitiesToZero} = require('../controllers/stockControllers')

router.get('/get-remaining-quantity', getQuantityRemaining)
router.post('/initialize-quantities',setAllProductQuantitiesToZero)
router.put('/update-quantity-remaining', updateQuantityRemaining);


module.exports = router