const { createPaymentIntent, getLastFourAndBrand } = require('../../services/stripeService');

const handleCreatePaymentIntent = async (req, res) => {
  try {
    const { items } = req.body;
    console.log("items received for payment intent:", items);

    const clientSecret = await createPaymentIntent(items);

    res.json({ clientSecret });
  } catch (err) {
    console.error("Error in handleCreatePaymentIntent:", err);
    res.status(500).send({ error: err.message });
  }
};

const handleGetLastFour = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.statecafeteaneck.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { paymentIntentId } = req.body;
    const cardDetails = await getLastFourAndBrand(paymentIntentId);
    res.json(cardDetails);
  } catch (err) {
    console.error("Error in handleGetLastFour:", err);
    res.status(500).send({ error: err.message });
  }
};

module.exports = {
  handleCreatePaymentIntent,
  handleGetLastFour
};
