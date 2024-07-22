import apiUrl from '../config';
import { collection, query, where, onSnapshot, Timestamp, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const saveOrder = async (order) => {
  try {
    const response = await fetch(`${apiUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error('Failed to save order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}

export const listenToOrdersForDate = (selectedDate, callback) => {
  const orderDocRef = doc(db, 'orders', selectedDate);

  return onSnapshot(orderDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const orders = docSnapshot.data().orders || [];
      callback(orders);
    } else {
      callback([]);
    }
  });
};


export const getOrdersForDate = async (date) => {
  try {
    const response = await fetch(`${apiUrl}/api/orders/get-orders-for-date?date=${date}`)

    if (!response.ok) {
      throw new Error('error getting orders for date: ', date)
    }

    const orders = await response.json()
    return orders
    
  } catch (error) {   
    //console.log(error)
    return {error: error.message}
  }
}