const {db} = require('../../../firebase/firebaseAdminConfig')

exports.getQuantityRemaining = async (req, res) => {
  const { date } = req.query;

  try {
    const doc = await db.collection('stock').doc(date).get();
    if (doc.exists) {
      const data = doc.data();
      res.status(200).json(data);
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


exports.setAllProductQuantitiesToZero = async (req, res) => {
	const {dateString} = req.body
  try {
    // Fetch all menu items from the menuItems collection
    const menuItemsSnapshot = await db.collection('menuItems').get();
    if (menuItemsSnapshot.empty) {
      console.log('No menu items found');
      return;
    }

    // Create an object to hold the menu item quantities set to zero
    let quantities = {};
    menuItemsSnapshot.forEach(doc => {
      const menuItem = doc.data();
      quantities[menuItem.itemId] = {
        quantity: 0
      };
    });

    // Set the quantities for the given date
    const stockRef = db.collection('stock').doc(dateString);
    await stockRef.set(quantities, { merge: true });

    console.log(`All product quantities set to zero for ${dateString}`);
  } catch (error) {
    console.error('Error setting product quantities to zero:', error);
  }
};