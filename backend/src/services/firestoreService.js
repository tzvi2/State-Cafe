const {db, FieldValue} = require('../../firebase/firebaseAdminConfig'); 
const moment = require('moment-timezone'); // Import moment-timezone

const getAllMenuItems = async (category) => {
  let query = db.collection('menuItems');

  if (category) {
    query = query.where('category', '==', category);
  }

  const snapshot = await query.get();
  if (snapshot.empty) {
    console.log('No matching documents.');
    return [];
  }

  const menuItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return menuItems;
};

const saveOrder = async (orderData) => {
  console.log('received order ', orderData);

  // Parse the delivery slot time and convert to the local time zone (EDT)
  const deliveryTime = moment(orderData.deliverySlot).tz('America/New_York');

  // Extract the local date string
  const dateString = deliveryTime.format('YYYY-MM-DD');

  console.log('date string: ', dateString);

  const docRef = db.collection('orders').doc(dateString);

  try {
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      await docRef.update({ orders: FieldValue.arrayUnion(orderData) });
    } else {
      await docRef.set({ orders: [orderData] });
    }

    return { orderId: dateString, ...orderData };
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
    throw new Error('Error saving order to Firestore');
  }
};

const addMenuItemToFirestore = async (menuItem) => {
  try {
    let newItem = { ...menuItem };

    // Convert pieces, price, and timeToCook to numbers
    if (newItem.pieces) newItem.pieces = parseInt(newItem.pieces, 10);
    if (newItem.price) newItem.price = parseFloat(newItem.price);
    if (newItem.timeToCook) newItem.timeToCook = parseInt(newItem.timeToCook, 10);

    // Convert options' price and timeToCook to numbers
    if (newItem.options && Array.isArray(newItem.options)) {
      newItem.options = newItem.options.map(option => ({
        ...option,
        price: option.price ? parseFloat(option.price) : option.price,
        timeToCook: option.timeToCook ? parseInt(option.timeToCook, 10) : option.timeToCook,
      }));
    }
    
    // Sanitize itemId to ensure it's a valid Firestore document ID
    const sanitizedItemId = newItem.title.replace(/[\/\\#?]/g, '_').replace(/\s+/g, ' ');
    
    // Use the sanitized itemId as the document ID
    const docRef = await db.collection('menuItems').doc(sanitizedItemId).set(newItem);
    return { id: sanitizedItemId, ...newItem };
  } catch (error) {
    console.error('Error adding menu item to Firestore:', error);
    throw error;
  }
  
};


const updateMenuItemActiveStatusInFirestore = async (itemId, active) => {
  try {
    const docRef = db.collection('menuItems').doc(itemId);
    await docRef.update({ active });
    return { itemId, active };
  } catch (error) {
    console.error('Error updating menu item active status in Firestore:', error);
    throw error;
  }
};

const updateMenuItemDetailsInFirestore = async (menuItemDetails) => {
  const { itemId, newMenuItem } = menuItemDetails;
  try {
    console.log('itemId ', itemId)
    console.log('newMenuItem ', newMenuItem)
    const item = await db.collection('menuItems').doc(itemId).get()

    if (!item.exists) {
      console.log('Item not found - cannot update.')
      return { status: 'error', message: 'Item not found' };
    }

    await db.collection('menuItems').doc(itemId).update(newMenuItem)
    console.log('Menu item updated successfully.')
    return { status: 'success', message: 'Menu item updated successfully.' };

  } catch (error) {
    console.error('Error updating item: ', error)
    return { status: 'error', message: 'Error updating item' };
  }
};


const deleteMenuItem = async (documentId) => {
  try {
    const docRef = db.collection('menuItems').doc(documentId)
    await docRef.delete()
    return {message: "Menu item deleted successfully."}
  } catch (error) {
    console.log('error deleting item with documentId: ', documentId, "\n", error)
  }
  
}


module.exports = {
  getAllMenuItems,
  saveOrder,
  addMenuItemToFirestore,
  updateMenuItemActiveStatusInFirestore,
  updateMenuItemDetailsInFirestore,
  deleteMenuItem
};
