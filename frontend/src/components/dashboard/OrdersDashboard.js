import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import styles from '../styles/dashboard/OrdersDashboard.module.css';
import { useAuth } from '../../hooks/useAuth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
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
    console.log('user change ', user);
  }, [user]);

  useEffect(() => {
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Create a query against the collection for the selected date
    const ordersQuery = query(
      collection(db, 'orders'),
      where('deliveryTime', '>=', startOfDay),
      where('deliveryTime', '<=', endOfDay),
      orderBy('deliveryTime', 'asc')
    );

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
  }, [selectedDate]);

  useEffect(() => {
    console.log('orders: ', orders);
  }, [orders]);

  if (user === undefined) { 
    return <p>Checking authentication...</p>;
  }
  
  if (!isAuthorized) {
    return (
      <p>You need to sign in to view this page</p>
    );
  }

  return (
    <div className={styles.orders}>
      <h2>Orders Dashboard</h2>
      <div className={styles.datePicker}>
        <label>Orders Due On: </label>
        <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />
      </div>
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
          {orders.map((order, orderIndex) => order.items.map((item, itemIndex) => (
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
                  <td rowSpan={order.items.length}>{order.phoneNumber}</td>
                </>
              ) : (
                <>
                  <td>
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
          )))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
