const express = require('express');
const router = express.Router();

const {getQuantityRemaining, updateQuantityRemaining, setAllProductQuantitiesToZero, updateStockLevels} = require('../controllers/stockControllers')

router.get('/get-remaining-quantity', getQuantityRemaining)
router.post('/initialize-quantities',setAllProductQuantitiesToZero)
router.put('/update-quantity-remaining', updateQuantityRemaining);
router.put('/update-stock-from-cart', updateStockLevels)


module.exports = router