import apiUrl from '../config';

// Retrieve all stock data for a specific date
export const getStockForDate = async (date) => {
  //console.log('Fetching stock for', date);
  try {
    const res = await fetch(`${apiUrl}/stock/${date}`);
    if (!res.ok) {
      console.error(`Failed to fetch stock for date ${date}, Status Code: ${res.status}`);
      return {}; // Return an empty object if no stock is found
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return {}; // Return empty object on error
  }
};

// Initialize stock for a given date
export const setAllStockToZero = async (dateString) => {
  console.log('Initializing all stock to zero for', dateString);
  try {
    const response = await fetch(`${apiUrl}/stock/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dateString }),
    });

    if (!response.ok) {
      throw new Error('Failed to initialize stock');
    }

    return await response.json();
  } catch (error) {
    console.error('Error initializing stock:', error);
  }
};

// Retrieve stock for a specific item on a specific date
export const getItemStockLeft = async (date, itemId) => {
  console.log('Fetching stock for item', itemId, 'on date', date);
  try {
    const res = await fetch(`${apiUrl}/stock/${date}/${itemId}`);
    if (!res.ok) {
      console.error(`Failed to fetch stock for item ${itemId}, Status Code: ${res.status}`);
      return { quantity: 0 };
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching item stock:', error);
    return { quantity: 0 };
  }
};

// Update stock for a specific item on a specific date
export const updateQuantityRemaining = async (date, itemId, quantity) => {
  console.log('Updating stock for item', itemId, 'on date', date, 'to quantity', quantity);
  try {
    const response = await fetch(`${apiUrl}/stock/${date}/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update quantity remaining');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating quantity remaining:', error);
    throw error;
  }
};

// Save weight data for an item
export const saveWeightData = async (date, itemId, weightData) => {
  console.log('Saving weight data for item', itemId, 'on date', date);
  try {
    const response = await fetch(`${apiUrl}/stock/${date}/${itemId}/weights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weightData }),
    });

    if (!response.ok) {
      throw new Error('Failed to save weight data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving weight data:', error);
    throw error;
  }
};

// Delete weight data for an item
export const deleteWeightData = async (date, itemId, weightIndex) => {
  console.log('Deleting weight data for item', itemId, 'on date', date, 'index', weightIndex);
  try {
    const response = await fetch(`${apiUrl}/stock/${date}/${itemId}/weights/${weightIndex}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete weight data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting weight data:', error);
    throw error;
  }
};

// Update weight quantity for an item
export const updateWeightQuantity = async (date, itemId, weightIndex, newQuantity) => {
  console.log('Updating weight quantity for item', itemId, 'on date', date, 'index', weightIndex, 'to quantity', newQuantity);
  try {
    const response = await fetch(`${apiUrl}/stock/${date}/${itemId}/weights/${weightIndex}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity: newQuantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update weight quantity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating weight quantity:', error);
    throw error;
  }
};
