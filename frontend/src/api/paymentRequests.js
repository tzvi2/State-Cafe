export const getLastFourDigits = async (paymentIntentId) => {
	try {
			const response = await fetch(`https://state-cafe.vercel.app/api/payment/get-last-four`, { 
					method: 'POST',
					headers: {
							'Content-Type': 'application/json',
					},
					body: JSON.stringify({ paymentIntentId }),
			});

			if (!response.ok) {
					throw new Error('Failed to retrieve card details');
			}

			const data = await response.json();
			return { lastFour: data.lastFour, brand: data.brand }; 

	} catch (error) {
			console.error('Error retrieving card details:', error);
			return { lastFour: '****', brand: 'Unknown' }; 
	}
};
