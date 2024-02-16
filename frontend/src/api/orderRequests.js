export const saveOrder = async (order) => {
  try {
    const response = await fetch(`https://state-cafe-qfb19b9yi-tzvi2.vercel.app:8000/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: order.items,
        totalPrice: order.totalPrice,
				deliverySlot: order.deliverySlot,
				unitNumber: order.unitNumber,
				lastFourDigits: order.lastFourDigits,
        cardBrand: order.cardBrand
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save order');
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error('Error saving order:', error);
    throw error; 
  }
};

