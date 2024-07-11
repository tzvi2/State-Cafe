const { createPaymentIntent, getLastFourAndBrand } = require('../../services/stripeService');

const handleCreatePaymentIntent = async (req, res) => {
  try {
    const { items } = req.body;
    //console.log("items received for payment intent:", items);

    console.log('request: ', req)
    const clientSecret = await createPaymentIntent(items);
    res.json({ clientSecret });
  } catch (err) {
    console.error("Error in handleCreatePaymentIntent:", err);
    res.status(500).send({ error: err.message });
  }
};

const handleGetLastFour = async (req, res) => {
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
  handleGetLastFour,
};
