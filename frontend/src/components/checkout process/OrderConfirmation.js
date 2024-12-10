import React, { useEffect, useState } from "react";
import styles from "../styles/checkout process styles/OrderConfirmation.module.css";
import { placeOrder } from "../../api/orderRequests";
import apiUrl from "../../config";
import { centsToFormattedPrice } from "../../utils/priceUtilities";
import { formatIsoToTime } from "../../utils/timeUtilities";
import { useCart } from "../../hooks/useCart";

const OrderDetailsRow = ({ label, value, isLoading }) => (
  <div className={styles.orderDetailsRow}>
    <span className={styles.label}>{label}:</span>
    <span>{isLoading ? <span className={styles.skeleton}></span> : value}</span>
  </div>
);

const OrderConfirmation = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const { clearCart } = useCart();

  useEffect(() => {
    const fetchAndSaveOrder = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const clientSecret = urlParams.get("payment_intent_client_secret");

      console.log("clientSecret from URL:", clientSecret);

      if (!clientSecret) {
        setMessage("No payment details found. Please contact support.");
        setIsLoading(false);
        return;
      }

      try {
        const paymentIntentId = clientSecret.split("_secret_")[0];
        console.log("Extracted paymentIntentId:", paymentIntentId);

        // Fetch card details
        const response = await fetch(`${apiUrl}/payment/get-last-four`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentIntentId }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch card details.");
        }

        const { lastFour, brand } = await response.json();
        console.log("Card details fetched:", { lastFour, brand });

        // Retrieve stored data
        const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        const dueDate = new Date(localStorage.getItem("dueDate"));
        const totalPrice = Number(localStorage.getItem("totalPrice"));
        const phoneNumber = localStorage.getItem("phoneNumber");
        const unitNumber = localStorage.getItem("unitNumber");

        if (!cartItems || !dueDate || !totalPrice || !phoneNumber || !unitNumber) {
          throw new Error("Missing required data from local storage.");
        }

        // Calculate total cooking time
        const timeToCook = cartItems.reduce(
          (total, item) => total + (item.totalTimeToCook || 0),
          0
        );

        const newOrderDetails = {
          items: cartItems,
          dueDate: dueDate.toISOString(),
          orderedAt: new Date().toISOString(),
          totalPrice,
          paymentDetails: {
            cardBrand: brand || "unknown",
            lastFour: lastFour || "N/A",
            paymentIntentId,
          },
          customerDetails: {
            phoneNumber,
            unitNumber,
          },
        };

        console.log("Saving order details:", newOrderDetails);

        // Save order to database
        await placeOrder(newOrderDetails);

        // Book the delivery slot
        const date = dueDate.toISOString().split("T")[0]; // Extract UTC date
        const time = dueDate.toISOString().split("T")[1].slice(0, 5); // Extract UTC time

        console.log("Booking slot with:", { date, time, timeToCook });

        const slotResponse = await fetch(`${apiUrl}/hours/${date}/book-slot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            time,
            timeToCook,
          }),
        });

        if (!slotResponse.ok) {
          throw new Error("Failed to book slot.");
        }

        console.log("Slot booked successfully.");

        setOrderDetails(newOrderDetails);
        setMessage("Order saved and slot booked successfully!");
        clearCart();
      } catch (error) {
        console.error("Error saving order or booking slot:", error);
        setMessage("Failed to save order or book slot. Please contact support.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSaveOrder();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.confirmationCard}>
      <h2>Thank you, your order is complete.</h2>
      <div className={styles.rows}>
        <OrderDetailsRow label="Ordered" value={formatIsoToTime(orderDetails.orderedAt)} isLoading={isLoading} />
        <OrderDetailsRow label="Delivery" value={`Unit ${orderDetails.customerDetails.unitNumber} at ${formatIsoToTime(orderDetails.dueDate)}`} isLoading={isLoading} />
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
          {orderDetails.items?.map((item, idx) => (
            <tr key={idx}>
              <td>{item.quantity}</td>
              <td className={styles.itemDescription}>
                {item.title}
                {item.options.map((option, idx) => (
                  <div key={idx} className={styles.optionRow}>
                    <span>-{option.title}</span>
                    <span className={styles.optionPrice}>+{centsToFormattedPrice(option.price)}</span>
                  </div>
                ))}
              </td>
              <td className={styles.price}>{centsToFormattedPrice(item.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2" className={styles.totalLabel}>Total:</td>
            <td className={styles.price}>{centsToFormattedPrice(orderDetails.totalPrice)}</td>
          </tr>
        </tfoot>
      </table>
      <OrderDetailsRow label="Payment Method" value={`${orderDetails.paymentDetails.cardBrand?.toUpperCase()} ${orderDetails.paymentDetails.lastFour}`} isLoading={isLoading} />
      <p>Something not right? <br /> Contact us: (551) 837-9907</p>
    </div>
  );
};

export default OrderConfirmation;
