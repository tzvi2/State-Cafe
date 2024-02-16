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
  const { itemId } = req.params; // This is the 'itemId' like 'sushi'
  try {
      const menuItemsRef = db.collection('menuItems');
      const snapshot = await menuItemsRef.where('itemId', '==', itemId).limit(1).get();
      if (snapshot.empty) {
          return res.status(404).json({ message: 'MenuItem not found' });
      }
      let itemData = {};
      snapshot.forEach(doc => {
          itemData = { firestoreId: doc.id, ...doc.data() }; 
      });
      res.json(itemData);
  } catch (error) {
      console.error('Error fetching menu item by itemId:', error);
      res.status(500).json({ error: 'Error fetching menu item' });
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

module.exports = {
  fetchMenuData,
  getItemByDocumentId,
  getItemByItemId,
  getItemPrice
};
