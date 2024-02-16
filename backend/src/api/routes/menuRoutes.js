const express = require('express');
const { fetchMenuData, getItemByDocumentId, getItemByItemId, getItemPrice } = require('../controllers/menuController');
const router = express.Router();

router.get('/', fetchMenuData);
router.get('/by-document-id/:documentId', getItemByDocumentId)
router.get('/by-item-id/:itemId', getItemByItemId)
router.get('/price/by-document-id/:documentId', getItemPrice)

module.exports = router;

