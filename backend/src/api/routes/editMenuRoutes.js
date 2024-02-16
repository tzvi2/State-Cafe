const express = require('express');
const router = express.Router();
const { addMenuItemToFirestore, updateMenuItemActiveStatusInFirestore, updateMenuItemDetailsInFirestore, deleteMenuItem } = require('../../services/firestoreService');

router.post('/add-menu-item', async (req, res) => {
  try {
    const menuItem = req.body;
    const response = await addMenuItemToFirestore(menuItem);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/update-status', async (req, res) => {
  try {
    const { itemId, active } = req.body;
    const response = await updateMenuItemActiveStatusInFirestore(itemId, active);
    res.json(response);
  } catch (error) {
    console.error('Error updating menu item status:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/update-item', async (req, res) => {
  try {
    const menuItemDetails = req.body;
    const response = await updateMenuItemDetailsInFirestore(menuItemDetails);
    res.json(response);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/delete-menu-item', async (req, res) => {
	try {
		const {itemId} = req.body
		const response = await deleteMenuItem(itemId)
		res.json(response)
	} catch (error) {
		console.error('Error deleting menu item:', error);
    res.status(500).json({ error: error.message });
	}
})

module.exports = router;
