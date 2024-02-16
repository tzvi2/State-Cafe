const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {db} = require('../../../firebase/firebaseAdminConfig') 
const {saveOrder} = require('../../services/firestoreService')

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object; // The payment intent information
        const orderData = {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          customer: paymentIntent.customer,
          // Add more details as needed
				}
				await saveOrder(orderData)
        res.send(200).
        break;
      case 'payment_intent.processing':
        res.send(200).res.json({message: "Your order is processing..."})
        break;
      case 'payment_intent.payment_failed':
        res.send(200).res.json({message: "This is awkward. Your payment didn't go through. Perhaps try a new card?"})
        break;
      default:
        // Unexpected event type
        return res.status(400).end();
    }

    // Response to Stripe
    res.json({received: true});
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

  module.exports = {
    handleStripeWebhook
  }
