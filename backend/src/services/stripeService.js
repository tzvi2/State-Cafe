require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../../firebase/firebaseAdminConfig');

const calculateTotal = async (items) => {
  let total = 0;

  for (const item of items) {
    // Assuming each item has a title field that matches the title in Firestore
    const querySnapshot = await db.collection('menuItems').where('title', '==', item.title).get();

    if (!querySnapshot.empty) {
      const itemData = querySnapshot.docs[0].data(); // Assuming titles are unique and you only get one result
      const price = itemData.price;
      total += price * item.quantity;
    } else {
      console.log(`Item not found in the database: ${item.title}`);
    }
  }

  return total;
};


const createPaymentIntent = async (items) => {
  console.log('creating payment intent')
  const total = await calculateTotal(items);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: 'usd',
  });
  console.log('something unimportant')
  return paymentIntent.client_secret;
};

const getLastFourAndBrand = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent.payment_method) {
      throw new Error('No payment method found for this payment intent.');
    }
    
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
    console.log('payment method.type ', paymentMethod.type);
    
    let lastFour, brand;
    switch (paymentMethod.type) {
      case 'card':
        lastFour = `**** ${paymentMethod.card.last4}`;
        brand = paymentMethod.card.brand;
        break;
      case 'link':
        lastFour = paymentMethod.link?.email;
        brand = 'Link';
        break;
      default:
        throw new Error(`Unsupported payment method type: ${paymentMethod.type}`);
    }
    
    return { lastFour, brand };
    //return {paymentMethod}
  } catch (error) {
    console.error('Error retrieving payment method:', error);
    throw error;
  }
};

module.exports = {
  calculateTotal,
  createPaymentIntent,
  getLastFourAndBrand,
};
