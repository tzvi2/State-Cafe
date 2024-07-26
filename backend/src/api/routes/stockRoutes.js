// stockRoutes.js
const express = require('express');
const router = express.Router();
const cache = require('../../cache');
const {
  getFullStock,
  updateQuantityRemaining,
  setAllProductQuantitiesToZero,
  updateStockLevels,
  saveWeightData,
  deleteWeightData,
  updateWeightQuantity
} = require('../controllers/stockControllers');

// Middleware for caching
const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);
  if (cachedResponse) {
    return res.json(cachedResponse);
  } else {
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, body);
      res.sendResponse(body);
    };
    next();
  }
};

router.get('/get-remaining-quantity', cacheMiddleware, getFullStock);
router.post('/initialize-quantities', setAllProductQuantitiesToZero);
router.put('/update-quantity-remaining', updateQuantityRemaining);
router.put('/update-stock-from-cart', updateStockLevels);
router.put('/save-weight-data', saveWeightData);
router.delete('/delete-weight-data', deleteWeightData);
router.put('/update-weight-quantity', updateWeightQuantity);

module.exports = router;
