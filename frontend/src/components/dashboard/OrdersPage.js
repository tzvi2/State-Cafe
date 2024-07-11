import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from '../styles/dashboard/OrdersPage.module.css';
import { getOrdersForDate } from '../../api/orderRequests';
import {formatPhoneNumber} from '../../utils/stringUtilities'

function OrdersPage() {
  const [selectedDate] = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  function formatTime(isoString) {
    if (!isoString) return '';

    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  }

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedOrders = await getOrdersForDate(selectedDate);
        setOrders(fetchedOrders || []);
      } catch (err) {
        console.log(err.message);
        setError('Failed to fetch orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedDate) {
      fetchOrders();
    }
  }, [selectedDate]);

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
    <div className={styles.orders}>
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
    </div>
  );
}

export default OrdersPage;
