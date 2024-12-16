import React, { useEffect, useState } from "react";
import styles from "../styles/checkout process styles/OrderConfirmation.module.css";
import { placeOrder } from "../../api/orderRequests";
import { bookTimeSlot } from '../../api/timeslotRequests'
import apiUrl from "../../config";
import { centsToFormattedPrice } from "../../utils/priceUtilities";
import { formatIsoToTime } from "../../utils/timeUtilities";
import { useCart } from "../../hooks/useCart";
import { useDeliveryDetails } from "../../hooks/useDeliveryDetails";

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

  const { clearCart, cart } = useCart();
  const { deliverySlot } = useDeliveryDetails()

  const getRequiredData = () => {
    try {
      const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      const deliveryDate = sessionStorage.getItem("deliveryDate");
      const deliverySlot = sessionStorage.getItem("deliverySlot");
      const totalPrice = Number(localStorage.getItem("totalPrice"));
      const phoneNumber = sessionStorage.getItem("phoneNumber");
      const unitNumber = sessionStorage.getItem("unitNumber");

      if (!cartItems.length || !deliveryDate || !deliverySlot || !totalPrice || !phoneNumber || !unitNumber) {
        throw new Error("Missing or invalid data from storage.");
      }

      const dueDate = calculateDueDate(deliveryDate, deliverySlot); // Combine date and slot

      return { cartItems, dueDate, totalPrice, phoneNumber, unitNumber };
    } catch (error) {
      console.error("Error validating storage data:", error);
      return null;
    }
  };

  const calculateDueDate = (deliveryDate, deliverySlot) => {
    const [hour, minute] = deliverySlot.split(":").map(Number);
    const dueDate = new Date(deliveryDate);

    // Set the delivery time in local time
    dueDate.setHours(hour, minute, 0, 0);

    return dueDate.toISOString(); // Return ISO format expected by the backend
  };


  useEffect(() => {
    const fetchAndSaveOrder = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const clientSecret = urlParams.get("payment_intent_client_secret");

      if (!clientSecret) {
        setMessage("No payment details found. Please contact support.");
        setIsLoading(false);
        return;
      }

      try {
        const paymentIntentId = clientSecret.split("_secret_")[0];

        // Fetch card details
        const response = await fetch(`${apiUrl}/payment/get-last-four`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch card details.");
        }

        const { lastFour, brand } = await response.json();

        // Validate and retrieve required data
        const validatedData = getRequiredData();
        if (!validatedData) {
          throw new Error("Missing required data from storage.");
        }

        const { cartItems, dueDate, totalPrice, phoneNumber, unitNumber } = validatedData;

        // Extract date and time from dueDate
        const deliveryDate = dueDate.split("T")[0];
        const deliveryTime = dueDate.split("T")[1].slice(0, 5);

        // Save order to backend
        const orderDetails = {
          items: cartItems,
          dueDate,
          totalPrice,
          paymentDetails: { cardBrand: brand || "unknown", lastFour: lastFour || "N/A", paymentIntentId },
          customerDetails: { phoneNumber, unitNumber },
        };

        const saveOrderResponse = await placeOrder(orderDetails);
        console.log("saveOrderResponse:", saveOrderResponse);

        const bookedTimeslotResponse = await bookTimeSlot(deliveryDate, deliverySlot, cart.totalCookTime);
        console.log("Booked timeslot response:", bookedTimeslotResponse);

        const orderedAt = saveOrderResponse.savedOrder?.order?.orderedAt;
        if (!orderedAt) {
          throw new Error("orderedAt is missing from backend response.");
        }

        setOrderDetails({
          ...orderDetails,
          orderedAt,
        });

        setMessage("Order saved successfully!");
        clearCart();
      } catch (error) {
        console.error("Error saving order or booking slot:", error);
        setMessage("Failed to save order. Please contact support.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSaveOrder();
  }, []);



  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!orderDetails) {
    return <div>{message}</div>;
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
