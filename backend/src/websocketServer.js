const admin = require('firebase-admin');
const {db} =  require('../firebase/firebaseAdminConfig')
const WebSocket = require('ws');

const startWebSocketServer = () => {
  const wss = new WebSocket.Server({ port: 8080 });

  wss.on('connection', ws => {
    console.log('A new client Connected!');

    // Calculate start and end of the current day
    const startOfDay = admin.firestore.Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)));
    const endOfDay = admin.firestore.Timestamp.fromDate(new Date(new Date().setHours(23, 59, 59, 999)));

    db.collection('orders')
      .where('deliveryTime', '>=', startOfDay)
      .where('deliveryTime', '<=', endOfDay)
      .orderBy('deliveryTime', 'asc')
      .onSnapshot(querySnapshot => {
        const orders = [];
        querySnapshot.forEach(doc => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        ws.send(JSON.stringify(orders)); // Send only today's orders to frontend
      });
  });
};

module.exports = startWebSocketServer;
