import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from '../styles/dashboard/OrdersPage.module.css';
import { listenToOrdersForDate } from '../../api/orderRequests';
import { formatPhoneNumber } from '../../utils/stringUtilities';

function OrdersPage() {
  const [selectedDate] = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 760);

  function formatTime(isoString) {
    if (!isoString) return '';

    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  }

  useEffect(() => {
    if (!selectedDate) return;

    setIsLoading(true);
    setError(null);
    const unsubscribe = listenToOrdersForDate(selectedDate, (fetchedOrders) => {
      setOrders(fetchedOrders);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 760);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!orders.length) {
    return <div>No orders found for the selected date.</div>;
  }

  return (
    <div className={styles.ordersContainer}>
      {isMobile ? (
        <ul className={styles.orders}>
          {orders.map((order, orderIndex) => (
            <li className={styles.order} key={order.id || orderIndex}>
              <div className={styles.detailRow}>
                <span>Unit</span>
                <span>{order.deliveryAddress}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Delivery</span>
                <span>{formatTime(order.deliverySlot)}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Phone</span>
                <span>{formatPhoneNumber(order.phoneNumber)}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Ordered</span>
                <span>{formatTime(order.orderedAt)}</span>
              </div>
              <ul className={styles.items}>
                {order.items.map((item, itemIndex) => (
                  <li className={styles.item} key={`${order.id || orderIndex}_${itemIndex}`}>
                    <div className={styles.description}>
                      <p className={styles.title}>{item.title}</p>
                      <ul className={styles.options}>
                        {item.options && item.options.map((option, optionIndex) => (
                          <li className={styles.option} key={`${order.id || orderIndex}_${itemIndex}_${optionIndex}`}>
                            + {option.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.quantity}>
                      <p>{item.quantity}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>Ordered</th>
              <th className={styles.items_header}>
                <span>Items</span>
                <span>Qty</span>
              </th>
              <th>Phone</th>
              <th>Unit</th>
              <th>Delivery</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, orderIndex) => (
              <tr key={order.id || orderIndex}>
                <td className={styles.topAlign}>{formatTime(order.orderedAt)}</td>
                <td className={styles.topAlign}>
                  <ul className={styles.items}>
                    {order.items.map((item, itemIndex) => (
                      <li className={styles.item} key={`${order.id || orderIndex}_${itemIndex}`}>
                        <div className={styles.description}>
                          <p className={styles.title}>
                            <span>{item.title}</span>
                            <span className={styles.qty}>{item.quantity}</span>
                          </p>
                          <ul className={styles.options}>
                            {item.options && item.options.map((option, optionIndex) => (
                              <li className={styles.option} key={`${order.id || orderIndex}_${itemIndex}_${optionIndex}`}>
                                + {option.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className={styles.topAlign}>{formatPhoneNumber(order.phoneNumber)}</td>
                <td className={styles.topAlign}>{order.deliveryAddress}</td>
                <td className={styles.topAlign}>{formatTime(order.deliverySlot)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrdersPage;
