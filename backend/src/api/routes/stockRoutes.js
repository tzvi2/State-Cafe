
const express = require('express');
const router = express.Router();

const {
  getFullStock,
  updateQuantityRemaining,
  setAllProductQuantitiesToZero,
  updateStockLevels,
  saveWeightData,
  deleteWeightData,
  updateWeightQuantity,
  getItemStock
} = require('../controllers/stockControllers');

router.get('/get-remaining-quantity', getFullStock);
router.get('/get-item-stock', getItemStock)
router.post('/initialize-quantities', setAllProductQuantitiesToZero);
router.put('/update-quantity-remaining', updateQuantityRemaining);
router.put('/update-stock-from-cart', updateStockLevels);
router.put('/save-weight-data', saveWeightData);
router.delete('/delete-weight-data', deleteWeightData);
router.put('/update-weight-quantity', updateWeightQuantity);

module.exports = router;
