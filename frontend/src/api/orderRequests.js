import apiUrl from '../config';
import { collection, query, where, onSnapshot, Timestamp, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const placeOrder = async (order) => {
  console.log('Sending order to backend:', order); // Debugging
  try {
    const response = await fetch(`${apiUrl}/orders/place-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderDetails: order }),
    });

    if (!response.ok) {
      throw new Error('Failed to save order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};


export const listenToOrdersForDate = (date, callback) => {
  const unsubscribe = db.collection('orders')
    .where('date', '==', date)
    .orderBy('deliverySlot', 'asc') // Orders by deliverySlot in ascending order
    .onSnapshot(
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(orders);
      },
      (error) => {
        console.error('Error listening to orders:', error);
        callback([]); // Send empty array on error
      }
    );
  return unsubscribe; // Allows cleanup on component unmount
};

export const getOrdersForDate = async (date) => {
  try {
    const response = await fetch(`${apiUrl}/orders/get-orders-for-date?date=${date}`)

    if (!response.ok) {
      throw new Error('error getting orders for date: ', date)
    }

    const orders = await response.json()
    return orders

  } catch (error) {
    //console.log(error)
    return { error: error.message }
  }
}