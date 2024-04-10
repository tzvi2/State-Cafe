const {saveOrder} = require('../../services/firestoreService')

exports.handleSaveOrder = async (req, res) => {
  try {
    const { items, totalPrice, deliverySlot, unitNumber, lastFourDigits, cardBrand, phoneNumber } = req.body;
    
    const savedOrder = await saveOrder({ items, totalPrice, deliverySlot, unitNumber, lastFourDigits, cardBrand, phoneNumber });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to save order' });
  }
};
