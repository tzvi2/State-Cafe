const {db} = require('../../../firebase/firebaseAdminConfig')

exports.getQuantityRemaining = async (req, res) => {
  const { date, menuItemId } = req.query;

  try {
    const doc = await db.collection('stock').doc(date).get();
    if (doc.exists) {
      const data = doc.data();
      const quantity = data[menuItemId] ? data[menuItemId].quantity : 0;
      res.status(200).json({ quantity });
    } else {
      res.status(404).json({ message: 'No data found for the given date' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateQuantityRemaining = async (req, res) => {
  const { date, menuItemId, quantity } = req.body;

  try {
    const stockRef = db.collection('stock').doc(date);
    const doc = await stockRef.get();

    if (doc.exists) {
      // If the document exists, update or add the menu item field
      const data = doc.data();
      const updatedData = {
        ...data,
        [menuItemId]: {
          quantity: quantity
        }
      };
      await stockRef.set(updatedData);
    } else {
      // If the document does not exist, create it with the menu item field
      await stockRef.set({
        [menuItemId]: {
          quantity: quantity
        }
      });
    }

    res.status(200).json({ message: 'Stock quantity updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};