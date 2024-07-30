const express = require('express');
const { 
  fetchMenuData, 
  getItemByDocumentId, 
  getItemByItemId, 
  getItemPrice, 
  fetchQuickView, 
  updateMenuItemIds,
  getMenuWithStock
} = require('../controllers/menuController');

const router = express.Router();

router.get('/', fetchMenuData);
router.get('/quickView', fetchQuickView);
router.get('/menuWithStock', getMenuWithStock);
router.get('/by-document-id/:documentId', getItemByDocumentId)
router.get('/by-item-id/:itemId', getItemByItemId)
router.get('/price/by-document-id/:documentId', getItemPrice)
router.get('/update-menu-item-ids', updateMenuItemIds)

module.exports = router;

