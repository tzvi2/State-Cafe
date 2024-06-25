require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../../firebase/firebaseAdminConfig');

const calculateTotal = async (items) => {
  let total = 0;

  // Fetch each item's price from Firestore
  for (const item of items) {
    const docRef = db.collection('menuItems').doc(item.firestoreId);
    const doc = await docRef.get();

    if (doc.exists) {
      const itemData = doc.data();
      // Assume 'price' is stored in cents
      const price = itemData.price; // Make sure 'price' matches your Firestore field
      total += price * item.quantity;
    } else {
      console.log(`Item not found in the database: ${item.firestoreId}`);
      // handle case where item data is not found
    }
  }

  return total;
};

const createPaymentIntent = async (items) => {
  const total = await calculateTotal(items);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: 'usd',
  });
  return paymentIntent.client_secret;
};

const getLastFourAndBrand = async (paymentIntentId) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const paymentMethod = await stripe.paymentMethods.retrieve(
    paymentIntent.payment_method
  );

  const lastFour = paymentMethod.card.last4;
  const brand = paymentMethod.card.brand;

  return { lastFour, brand };
};

module.exports = {
  calculateTotal,
  createPaymentIntent,
  getLastFourAndBrand,
};
