const {saveOrder} = require('../../services/firestoreService')

exports.handleSaveOrder = async (req, res) => {
  try {
    const { items, totalPrice, deliverySlot, unitNumber, lastFourDigits, cardBrand } = req.body;
    
    const savedOrder = await saveOrder({ items, totalPrice, deliverySlot, unitNumber, lastFourDigits, cardBrand });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to save order' });
  }
};
