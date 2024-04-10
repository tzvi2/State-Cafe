import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, orderBy, onSnapshot, query } from 'firebase/firestore';
import styles from '../styles/dashboard/OrdersDashboard.module.css'
import { useAuth } from '../../hooks/useAuth';

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const { user, signInWithGoogle } = useAuth(); 
	const AUTHORIZED_EMAILS = ['tzvib8@gmail.com']; 
	const isAuthorized = user && AUTHORIZED_EMAILS.includes(user.email);

  function formatTime(firestoreTimestamp) {
    if (!firestoreTimestamp) return '';

    // Convert Firestore Timestamp to JavaScript Date object
    const date = new Date(firestoreTimestamp.seconds * 1000 + firestoreTimestamp.nanoseconds / 1000000);

    // Format the date as you wish
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
}


  useEffect(() => {
    // Create a query against the collection
    const ordersQuery = query(collection(db, 'orders'), orderBy('orderedAt', 'desc'));

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    });

    // Clean up the subscription
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log('orders: ', orders)
  }, [orders])

  if (!isAuthorized) {
    return (
      <p>You need to sign in to view this page</p>
    )
  }

  return (
    <div className={styles.orders}>
      <h2>Orders Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Ordered</th>
            <th>Items</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Due</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>

        {orders.map((order, orderIndex) => order.items.map((item, itemIndex) => {

        return (
          <tr key={`${order.id}_${itemIndex}`}>
            {itemIndex === 0 ? (
              <>
                <td rowSpan={order.items.length}>{formatTime(order.orderedAt)}</td>
                <td>
                  {item.title}
                  <ul>
                    {item.options && item.options.map((option, optionIndex) => (
                      <li key={`${order.id}_${itemIndex}_${optionIndex}`}>
                        + {option.title}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{item.quantity}</td>
                <td rowSpan={order.items.length}>{order.deliveryAddress}</td>
                <td rowSpan={order.items.length}>{formatTime(order.deliveryTime)}</td>
                <td rowSpan={order.items.length}>{formatTime(order.deliveryTime)}</td>
                <td rowSpan={order.items.length}> {order.phoneNumber}</td>
              </>
            ) : (
              <>
                <td >
                  {item.title}
                  <ul>
                    {item.options && item.options.map((option, optionIndex) => (
                      <li key={`${order.id}_${itemIndex}_${optionIndex}`}>
                        {option.title}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{item.quantity}</td>
              </>
            )}
          </tr>
        );
      }))}

        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
