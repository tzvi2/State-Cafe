import React, { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

function Dashboard() {
  const [orders, setOrders] = useState([]);


  function formatTime(firestoreTimestamp) {
    if (!firestoreTimestamp) return '';

    // Convert Firestore Timestamp to JavaScript Date object
    const date = new Date(firestoreTimestamp.seconds * 1000 + firestoreTimestamp.nanoseconds / 1000000);

    // Format the date as you wish
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  }



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
