const { saveOrder } = require('../../services/firestoreService');
const {db} = require('../../../firebase/firebaseAdminConfig')

exports.handleSaveOrder = async (req, res) => {
  try {
    const savedOrder = await saveOrder(req.body);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to save order' });
  }
};

exports.getOrdersForDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date query parameter is required' });
  }

  try {
    const ordersSnapshot = await db.collection('orders').doc(date).get();

    if (!ordersSnapshot.exists) {
      return res.status(404).json({ error: 'No orders found for the given date' });
    }

    const ordersData = ordersSnapshot.data();
    return res.status(200).json(ordersData.orders || []);
  } catch (error) {
    console.error('Error getting orders by date:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};