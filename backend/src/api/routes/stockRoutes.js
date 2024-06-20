const express = require('express');
const router = express.Router();

const { 
  getQuantityRemaining, 
  updateQuantityRemaining, 
  setAllProductQuantitiesToZero, 
  updateStockLevels, 
  saveWeightData, 
  deleteWeightData, 
  updateWeightQuantity 
} = require('../controllers/stockControllers');

router.get('/get-remaining-quantity', getQuantityRemaining);
router.post('/initialize-quantities', setAllProductQuantitiesToZero);
router.put('/update-quantity-remaining', updateQuantityRemaining);
router.put('/update-stock-from-cart', updateStockLevels);
router.put('/save-weight-data', saveWeightData);
router.delete('/delete-weight-data', deleteWeightData);
router.put('/update-weight-quantity', updateWeightQuantity);

module.exports = router;
