const {db} = require('../../../firebase/firebaseAdminConfig')

exports.getQuantityRemaining = async (req, res) => {
  const { date } = req.query;

  try {
    const doc = await db.collection('stock').doc(date).get();
    if (doc.exists) {
      const data = doc.data();
      res.status(200).json(data);
    } else {
      // Return a 200 status with a message indicating no data found
      res.status(200).json({ message: 'No stock data found for the given date' });
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

exports.updateStockLevels = async (req, res) => {
  console.log('updating stock levels.');

  const { date, cartItems } = req.body;
  console.log('date ', date);
  //console.log('cartItems ', cartItems);

  if (!date || !cartItems || !Array.isArray(cartItems)) {
    return res.status(400).json({ error: 'Invalid input. Date and cart items are required.' });
  }

  const batch = db.batch();
  const stockRef = db.collection('stock').doc(date);

  try {
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ error: 'Stock document for the specified date does not exist.' });
    }

    const stockData = stockDoc.data();
    console.log('stockData: ', stockData);  // Log the structure of stockData

    cartItems.forEach(item => {
      const itemStock = stockData[item.itemId]?.quantity; // Use optional chaining to safely access the quantity
      console.log(`Item ID ${item.itemId} stock: `, itemStock);

      if (itemStock != null && typeof itemStock === 'number') {
        const updatedQuantity = itemStock - item.quantity;
        if (updatedQuantity >= 0) {
          batch.update(stockRef, { [`${item.itemId}.quantity`]: updatedQuantity }); // Update the nested quantity field
        } else {
          console.error(`Not enough stock for item ID ${item.itemId}. Current stock: ${itemStock}, required: ${item.quantity}`);
        }
      } else {
        console.error(`Item ID ${item.itemId} does not exist in stock data or is not a number.`);
      }
    });

    await batch.commit();
    res.status(200).json({ message: 'Stock levels updated successfully.' });
  } catch (error) {
    console.error('Error updating stock levels:', error);
    res.status(500).json({ error: 'Failed to update stock levels.' });
  }
};