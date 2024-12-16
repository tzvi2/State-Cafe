import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "../styles/dashboard/OrdersPage.module.css";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, Timestamp } from "../../firebaseConfig";
import { formatPhoneNumber } from "../../utils/stringUtilities";

function OrdersPage() {
  const [selectedDate] = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 760);

  function formatTime(isoString) {
    if (!isoString) return "";

    const date = new Date(isoString);
    return date
      .toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
      .toLowerCase();
  }

  // useEffect(() => {
  //   console.log('orders ', orders)
  // }, [orders])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 760);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    console.log("Selected date:", selectedDate);

    // Parse selectedDate as a UTC date
    const [year, month, day] = selectedDate.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // Use UTC
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)); // Use UTC

    console.log("Start of day (UTC):", startOfDay);
    console.log("End of day (UTC):", endOfDay);

    const ordersRef = collection(db, "orders");

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const fetchedOrders = snapshot.docs
          .map((doc) => {
            const order = doc.data();
            const dueDate = new Date(order.dueDate); // Convert dueDate string to Date
            const orderedAt = new Date(order.orderedAt); // Convert orderedAt string to Date
            console.log("Order ID:", doc.id, "dueDate (UTC):", dueDate, "orderedAt (UTC):", orderedAt);
            return { id: doc.id, ...order, dueDate, orderedAt };
          })
          .filter(
            (order) => order.dueDate >= startOfDay && order.dueDate <= endOfDay
          )
          .sort((a, b) => {
            if (a.dueDate.getTime() !== b.dueDate.getTime()) {
              return a.dueDate - b.dueDate; // Primary sort by earliest dueDate
            }
            return a.orderedAt - b.orderedAt; // Secondary sort by earliest orderedAt
          });

        console.log("Filtered and sorted orders:", fetchedOrders);
        setOrders(fetchedOrders);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders. Please try again.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
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
    <div className={styles.ordersContainer}>
      {isMobile ? (
        <ul className={styles.orders}>
          {orders.map((order, orderIndex) => (
            <li className={styles.order} key={order.id || orderIndex}>
              <div className={styles.detailRow}>
                <span>Unit</span>
                <span>{order.customerDetails.unitNumber}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Delivery</span>
                <span>{formatTime(order.dueDate)}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Phone</span>
                <span>{formatPhoneNumber(order.customerDetails.phoneNumber)}</span>
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
                        {item.options &&
                          item.options.map((option, optionIndex) => (
                            <li
                              className={styles.option}
                              key={`${order.id || orderIndex}_${itemIndex}_${optionIndex}`}
                            >
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
                            {item.options &&
                              item.options.map((option, optionIndex) => (
                                <li
                                  className={styles.option}
                                  key={`${order.id || orderIndex}_${itemIndex}_${optionIndex}`}
                                >
                                  + {option.title}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className={styles.topAlign}>{formatPhoneNumber(order.customerDetails.phoneNumber)}</td>
                <td className={styles.topAlign}>{order.customerDetails.unitNumber}</td>
                <td className={styles.topAlign}>{formatTime(order.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrdersPage;
