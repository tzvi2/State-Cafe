const {db} = require('../../../firebase/firebaseAdminConfig');

const { getAllMenuItems } = require('../../services/firestoreService');

const fetchMenuData = async (req, res) => {
  try {
    const {category} = req.query
    const menuItems = await getAllMenuItems(category);
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).send("Error retrieving menu items");
  }
};

const getMenuWithStock = async (req, res) => {
  const {date} = req.query
  console.log('selected Date' ,date)
  if (!date) {
    return res.status(400).send("Error: 'date' query parameter is required.");
  }

  try {
    const menuItemsSnapshot = await db.collection('menuItems').get();
    const menuItems = {};

    menuItemsSnapshot.forEach(doc => {
      menuItems[doc.id] = doc.data();
    });

    const stockDoc = await db.collection('stock').doc(date).get();
    //console.log('stock Doc', stockDoc)
    const stock = stockDoc.exists ? stockDoc.data() : {};

    console.log('stock ', stock)

    const menuItemsWithStock = Object.keys(menuItems).map(id => ({
      id, // Adding the document ID as the id property
      ...menuItems[id],
      quantity: stock[id]?.quantity || 0 // Accessing quantity correctly
    }));

    //console.log('menu items with stock', menuItemsWithStock);

    res.json(menuItemsWithStock);
  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).send("Error fetching data");
  }
};


const fetchQuickView = async (req, res) => {
  try {
    const menuItemsRef = db.collection('menuItems');
    const snapshot = await menuItemsRef.select('title', 'img', 'price', 'category', 'active', 'soldByWeight').get();
    const quickViewMenu = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(quickViewMenu);
  } catch (err) {
    console.error("Error fetching quick view menu:", err);
    res.status(500).send("Error fetching quick view menu");
  }
};



const getItemByDocumentId = async (req, res) => {
  const { documentId } = req.params
  try {
    const doc = await db.collection('menuItems').doc(documentId).get()
    if (!doc.exists) {
      return res.status(404).json({message: "no item found with id", documentId})
    }
    res.json({documentId, ...doc.data()})
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching menu item' });
  }
}

const getItemByItemId = async (req, res) => {
  
  const { itemId } = req.params;

  console.log('attempting to get item with itemId ',itemId)
  try {
    const itemDoc = await db.collection('menuItems').doc(itemId).get();

    if (!itemDoc.exists) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const itemData = itemDoc.data();
    return res.status(200).json(itemData);
  } catch (error) {
    console.error('Error getting item by itemId:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getItemPrice = async (req, res) => {
  const {documentId} = req.params
  try {
    const docRef = db.collection('menuItems').doc(documentId)
    const doc = await docRef.get()
    if (doc.exists) {
      const itemData = doc.data()
      res.send(itemData.price)
    } else {
      return res.status(404).json({message: 'no item with document id ', documentId})
    }
  } catch (err) {
    console.error(err)
    return null
  }
}

const updateMenuItemIds = async (req, res) => {
  try {
    const collectionRef = db.collection('menuItems');
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No documents found in collection.' });
    }

    console.log('Starting to update document IDs...');

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const itemId = data.itemId;

      if (itemId) {
        // Create a new document with the itemId as the document ID
        await collectionRef.doc(itemId).set(data);

        // Delete the old document
        await doc.ref.delete();

        console.log(`Document with ID: ${doc.id} has been updated to new ID: ${itemId}`);
      } else {
        console.error(`Document with ID: ${doc.id} does not have an itemId field.`);
      }
    }

    console.log('Document ID update completed.');
    return res.status(200).json({ message: 'Document ID update completed.' });
  } catch (error) {
    console.error('Error updating document IDs:', error);
    return res.status(500).json({ message: 'Error updating document IDs.', error: error.message });
  }
};



module.exports = {
  fetchMenuData,
  getItemByDocumentId,
  getItemByItemId,
  getItemPrice,
  fetchQuickView,
  updateMenuItemIds,
  getMenuWithStock
};
