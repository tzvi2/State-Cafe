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
  
    if (!paymentIntent.payment_method) {
      throw new Error('No payment method found for this payment intent.');
    }
  
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
  
    let lastFour, brand;
    
    switch (paymentMethod.type) {
      case 'card':
        lastFour = paymentMethod.card.last4;
        brand = paymentMethod.card.brand;
        break;
      case 'link':
        lastFour = paymentMethod.link?.last4;
        brand = 'Link';
        break;
      // Handle other payment methods as needed
      default:
        throw new Error(`Unsupported payment method type: ${paymentMethod.type}`);
    }
  
    return { lastFour, brand };
  };

module.exports = {
  calculateTotal,
  createPaymentIntent,
  getLastFourAndBrand,
};
