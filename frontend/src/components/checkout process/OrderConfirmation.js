import React, { useEffect, useState } from "react";
import styles from "../styles/checkout process styles/OrderConfirmation.module.css";
import { fetchOrderDetails } from "../../api/orderRequests"; // Assumes your fetchOrderDetails is defined here
import { centsToFormattedPrice } from "../../utils/priceUtilities";
import { convertIsoTo12HourTime, formatIsoToTime } from "../../utils/timeUtilities";

const OrderDetailsRow = ({ label, value }) => (
  <div className={styles.orderDetailsRow}>
    <span className={styles.label}>{label}:</span>
    <span>{value}</span>
  </div>
);

const OrderConfirmation = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const clientSecret = urlParams.get("payment_intent_client_secret");

      if (!clientSecret) {
        setMessage("Invalid payment details. Please contact support.");
        setIsLoading(false);
        return;
      }

      const paymentIntentId = clientSecret.split("_secret_")[0];

      try {
        const fetchedOrder = await fetchOrderDetails(paymentIntentId);
        setOrderDetails(fetchedOrder);
      } catch (error) {
        setMessage(error.message || "Failed to retrieve order.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, []);

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!orderDetails) {
    return <div className={styles.error}>{message}</div>;
  }

  const {
    orderedAt,
    dueDate,
    items,
    totalPrice,
    paymentDetails: { cardBrand, lastFour },
    customerDetails: { unitNumber },
  } = orderDetails;

  return (
    <div className={styles.confirmationCard}>
      <h2>Thank you, your order is complete.</h2>
      <div className={styles.rows}>
        {/* <OrderDetailsRow label="Ordered" value={formatIsoToTime(orderedAt)} /> */}
        <OrderDetailsRow
          label="Delivery"
          value={`Unit ${unitNumber} at ${convertIsoTo12HourTime(dueDate)}`}
        />
        <OrderDetailsRow
          label="Payment Method"
          value={`${cardBrand?.toUpperCase()} ending in ${lastFour}`}
        />
      </div>
      <table className={styles.orderTable}>
        <thead>
          <tr>
            <th>Qty</th>
            <th className={styles.itemDescription}>Item</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.quantity}</td>
              <td className={styles.itemDescription}>
                {item.title}
                {item.options.map((option, idx) => (
                  <div key={idx} className={styles.optionRow}>
                    <span>- {option.title}</span>
                    <span className={styles.optionPrice}>
                      +{centsToFormattedPrice(option.price)}
                    </span>
                  </div>
                ))}
              </td>
              <td className={styles.price}>
                {centsToFormattedPrice(item.totalPrice)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2" className={styles.totalLabel}>
              Total:
            </td>
            <td className={styles.price}>{centsToFormattedPrice(totalPrice)}</td>
          </tr>
        </tfoot>
      </table>
      <p>
        Something not right? <br /> Contact us: (551) 837-9907
      </p>
    </div>
  );
};

export default OrderConfirmation;
