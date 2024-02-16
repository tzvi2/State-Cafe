const handleConfigRequest = async (req, res) => {
	res.send({
		publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
	})
}

module.exports = {
	handleConfigRequest
}