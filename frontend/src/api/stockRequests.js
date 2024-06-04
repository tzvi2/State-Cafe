export const setAllStockToZero = async (dateString) => {
	console.log('initializing all to Zero ', dateString, "we're in the frontned")
  try {
    const response = await fetch('https://state-cafe.vercel.app/stock/initialize-quantities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dateString })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log(result.message);
  } catch (error) {
    console.error('Error:', error);
  }
};

export const getStockForDate = async (dateString) => {
  try {
    const response = await fetch(`https://state-cafe.vercel.app/stock/get-remaining-quantity?date=${dateString}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

export const updateQuantityRemaining = async (date, menuItemId, quantity) => {
  try {
    const response = await fetch('https://state-cafe.vercel.app/stock/update-quantity-remaining', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, menuItemId, quantity }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating quantity:', error);
    throw error;
  }
};
