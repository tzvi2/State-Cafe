import apiUrl from '../config';

export const setAllStockToZero = async (dateString) => {
  console.log('initializing all to Zero ', dateString, "we're in the frontend");
  try {
    const response = await fetch(`${apiUrl}/stock/initialize-quantities`, {
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
    return result
    
  } catch (error) {
    console.error('Error:', error);
  }
};

export const getStockForDate = async (dateString) => {
  try {
    const response = await fetch(`${apiUrl}/stock/get-remaining-quantity?date=${dateString}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateQuantityRemaining = async (date, menuItemId, quantity) => {
  try {
    const response = await fetch(`${apiUrl}/stock/update-quantity-remaining`, {
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

export const updateQuantityOfAllCartItems = async (date, cartItems) => {
  try {
    const response = await fetch(`${apiUrl}/stock/update-stock-from-cart`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, cartItems }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    //console.log('Stock levels updated successfully:', result);
  } catch (error) {
    console.error('Error updating stock levels:', error);
  }
};

export const saveWeightData = async (date, itemId, weightData) => {
  try {
    const response = await fetch(`${apiUrl}/stock/save-weight-data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, itemId, weightData }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('Weight data saved successfully:', result);
  } catch (error) {
    console.error('Error saving weight data:', error);
    throw error;
  }
};

export const deleteWeightData = async (date, itemId, weightData) => {
  try {
    const response = await fetch(`${apiUrl}/stock/delete-weight-data`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, itemId, weightData }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('Weight data deleted successfully:', result);
  } catch (error) {
    console.error('Error deleting weight data:', error);
    throw error;
  }
};

export const updateWeightQuantity = async (date, itemId, weightIndex, newQuantity) => {
  console.log('Updating weight quantity:', { date, itemId, weightIndex, newQuantity });
  try {
    const response = await fetch(`${apiUrl}/stock/update-weight-quantity`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, itemId, weightIndex, newQuantity }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('Weight quantity updated successfully:', result);
  } catch (error) {
    console.error('Error updating weight quantity:', error);
    throw error;
  }
};
