const { db } = require('../../../firebase/firebaseAdminConfig');

const admin = require('firebase-admin');

const FieldValue = admin.firestore.FieldValue;

exports.getFullStock = async (req, res) => {
  const { date } = req.query;
  console.log('stock for ', date)
  try {
    const doc = await db.collection('stock').doc(date).get();
    if (doc.exists) {
      const data = doc.data();
      res.status(200).json(data);
    } else {
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
      const data = doc.data();
      const updatedData = {
        ...data,
        [menuItemId]: {
          quantity: quantity
        }
      };
      await stockRef.set(updatedData);
    } else {
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
  const { dateString } = req.body;
  try {
    const menuItemsSnapshot = await db.collection('menuItems').get();
    if (menuItemsSnapshot.empty) {
      console.log('No menu items found');
      return res.status(404).json({ message: 'No menu items found' });
    }

    let quantities = {};
    menuItemsSnapshot.forEach(doc => {
      const menuItem = doc.data();
      const menuItemId = doc.id; // Ensure you get the document ID
      
      if (menuItem.soldByWeight) {
        quantities[menuItemId] = []; // Ensure using the correct document ID
      } else {
        quantities[menuItemId] = { quantity: 0 }; // Ensure using the correct document ID
      }
    });

    const stockRef = db.collection('stock').doc(dateString);
    await stockRef.set(quantities, { merge: true });

    console.log(`Set all product quantities to zero for ${dateString}:`, quantities);

    res.status(200).json({ message: `All product quantities set to zero for ${dateString}` });
  } catch (error) {
    console.error('Error setting product quantities to zero:', error);
    res.status(500).json({ message: 'Error setting product quantities to zero' });
  }
};

exports.updateStockLevels = async (req, res) => {
  console.log('updating stock levels.');

  const { date, cartItems } = req.body;

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
    console.log('stockData: ', stockData);

    cartItems.forEach(item => {
      const itemStock = stockData[item.title]?.quantity;

      if (itemStock != null && typeof itemStock === 'number') {
        const updatedQuantity = itemStock - item.quantity;
        if (updatedQuantity >= 0) {
          batch.update(stockRef, { [`${item.title}.quantity`]: updatedQuantity });
        } else {
          console.error(`Not enough stock for item ID ${item.title}. Current stock: ${itemStock}, required: ${item.quantity}`);
        }
      } else {
        console.error(`Item ID ${item.title} does not exist in stock data or is not a number.`);
      }
    });

    await batch.commit();
    res.status(200).json({ message: 'Stock levels updated successfully.' });
  } catch (error) {
    console.error('Error updating stock levels:', error);
    res.status(500).json({ error: 'Failed to update stock levels.' });
  }
};

exports.saveWeightData = async (req, res) => {
  const { date, itemId, weightData } = req.body;

  console.log(`Received request to save weight data: date=${date}, itemId=${itemId}, weightData=${JSON.stringify(weightData)}`);

  try {
    const stockRef = db.collection('stock').doc(date);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ message: 'Stock document not found' });
    }

    // Retrieve current weight data array for the item, if it exists
    let currentWeightData = stockDoc.data()[itemId] || [];

    // Ensure currentWeightData is an array
    if (!Array.isArray(currentWeightData)) {
      return res.status(500).json({ message: 'Existing weight data is not an array' });
    }

    // Add the new weight data object to the array
    currentWeightData.push(weightData);

    const updatedData = {
      [itemId]: currentWeightData
    };

    console.log(`Updating stock with: ${JSON.stringify(updatedData)}`);

    await stockRef.update(updatedData);

    res.status(200).json({ message: 'Weight data saved successfully' });
  } catch (error) {
    console.error('Error saving weight data:', error);
    res.status(500).json({ message: 'Error saving weight data' });
  }
};

exports.deleteWeightData = async (req, res) => {
  const { date, itemId, weightData } = req.body;

  try {
    const stockRef = db.collection('stock').doc(date);
    await stockRef.update({
      [itemId]: FieldValue.arrayRemove(weightData)
    });
    res.status(200).json({ message: 'Weight data deleted successfully' });
  } catch (error) {
    console.error('Error deleting weight data:', error);
    res.status(500).json({ message: 'Error deleting weight data' });
  }
};

exports.updateWeightQuantity = async (req, res) => {
  const { date, itemId, weightIndex, newQuantity } = req.body;

  console.log(`Received request to update weight quantity: date=${date}, itemId=${itemId}, weightIndex=${weightIndex}, newQuantity=${newQuantity}`);

  if (!date || !itemId || weightIndex === undefined || newQuantity === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const stockRef = db.collection('stock').doc(date);
    const stockDoc = await stockRef.get();

    if (!stockDoc.exists) {
      return res.status(404).json({ message: 'Stock document not found' });
    }

    const stockData = stockDoc.data();
    if (!stockData[itemId] || !Array.isArray(stockData[itemId]) || !stockData[itemId][weightIndex]) {
      return res.status(400).json({ message: 'Invalid item ID or weight index' });
    }

    // Update the specific weight entry's quantity
    const updatedWeightData = [...stockData[itemId]];
    updatedWeightData[weightIndex].quantity = newQuantity;

    console.log(`Updating weight data for itemId ${itemId} at index ${weightIndex} with new quantity ${newQuantity}`);
    console.log(`Updated weight data:`, updatedWeightData);

    await stockRef.update({
      [itemId]: updatedWeightData
    });

    res.status(200).json({ message: 'Weight quantity updated successfully' });
  } catch (error) {
    console.error('Error updating weight quantity:', error);
    res.status(500).json({ message: 'Error updating weight quantity' });
  }
};
//exports.getItemWeightOptions = async (req)