const {db} = require('../../firebase/firebaseAdminConfig'); 

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
  // Convert deliverySlot from ISO string to Date object
  const deliveryTime = new Date(orderData.deliverySlot);

  const newOrder = {
    items: orderData.items,
    totalPrice: orderData.totalPrice,
    orderedAt: new Date(), // Firestore will automatically convert JavaScript Date to Firestore Timestamp
    deliveryTime, // same story as above
    deliveryAddress: orderData.unitNumber,
    lastFourDigits: orderData.lastFourDigits,
    cardBrand: orderData.cardBrand
  };

  try {
    const docRef = await db.collection('orders').add(newOrder);
    const savedOrderWithId = {
      orderId: docRef.id,
      ...newOrder
    };
    return savedOrderWithId;
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
    throw new Error('Error saving order to Firestore');
  }
};

const addMenuItemToFirestore = async (menuItem) => {
  try {
    const docRef = await db.collection('menuItems').add(menuItem);
    return { id: docRef.id, ...menuItem };
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
  try {
    const { itemId, ...updateData } = menuItemDetails;
    // Query for the document with the matching itemId
    const querySnapshot = await db.collection('menuItems').where('itemId', '==', itemId).get();
    
    if (querySnapshot.empty) {
      console.log('No matching document found with itemId:', itemId);
      return null; 
    }

    // Assuming itemId is unique and only one document matches
    querySnapshot.forEach(async (doc) => {
      await db.collection('menuItems').doc(doc.id).update(updateData);
    });

    return { itemId, ...updateData };
  } catch (error) {
    console.error('Error updating menu item details in Firestore:', error);
    throw error;
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
