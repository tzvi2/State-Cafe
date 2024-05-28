import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { saveOrder } from '../../api/orderRequests';
import { getLastFourDigits } from '../../api/paymentRequests';
import { bookTimeSlot } from '../../api/timeslotRequests';
import { formatIsoToTime } from '../../utils/timeUtilities';
import styles from '../styles/checkout process styles/OrderConfirmation.module.css';

const OrderDetailsRow = ({ label, value, isLoading }) => {
  return (
    <div className={styles.orderDetailsRow}>
      <span>{label}:</span>
      <span>{isLoading ? <span className={styles.skeleton}></span> : value}</span>
    </div>
  );
};

const OrderConfirmation = () => {
  const { cart, clearCart } = useCart();
  const { deliverySlot, unitNumber, deliveryDate, phoneNumber, clearDeliveryDetails } = useDeliveryDetails();
  const [savedOrder, setSavedOrder] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const processOrder = async () => {
      const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
      let paymentIntentId;

      if (clientSecret) {
        paymentIntentId = clientSecret.split('_secret_')[0];
      }

      if (paymentIntentId && !localStorage.getItem(`orderSaved_${paymentIntentId}`)) {
        try {
          const cardDetails = await getLastFourDigits(paymentIntentId);
          const orderDetails = {
            items: cart.items,
            totalPrice: cart.totalPrice,
            deliverySlot,
            unitNumber,
            lastFourDigits: cardDetails.lastFour,
            cardBrand: cardDetails.brand,
            paymentIntentId,
            phoneNumber
          };

          const savedOrderResponse = await saveOrder(orderDetails);
          setSavedOrder(savedOrderResponse);

          // Book the time slot
          await bookTimeSlot({
            totalCookTime: cart.totalCookTime,
            date: deliveryDate,
            time: deliverySlot,
          });

          // Mark the order as saved in localStorage to prevent duplicates
          localStorage.setItem(`orderSaved_${paymentIntentId}`, 'true');

          // Clear the cart and delivery details after successful order processing
          clearCart()
          clearDeliveryDetails();
          
        } catch (error) {
          console.error('Error processing order:', error);
          // Handle error (e.g., notify the user)
        }
      } else if (paymentIntentId) {
        // If the order was previously saved, retrieve it from localStorage
        const existingOrders = JSON.parse(localStorage.getItem('orderDetails')) || {};
        if (existingOrders[paymentIntentId]) {
          setSavedOrder(existingOrders[paymentIntentId]);
        }
      }
      setIsLoading(false); // Data has been loaded
    };

    processOrder();
    
  }, [cart, deliverySlot, unitNumber, deliveryDate, clearCart, clearDeliveryDetails]);

  // Helper function to convert integers to money format
  const intToMoneyString = (amount) => {
    if (!amount) return "";
    const dollars = amount / 100;
    return `$${dollars.toFixed(2)}`;
  };

  return (
    <div className={styles.confirmationCard}>
      <h2>Your order is complete!</h2>
      <div className={styles.rows}>
        {/* <OrderDetailsRow label="Order ID" value={savedOrder.orderId || 'N/A'} isLoading={isLoading} /> */}
        <OrderDetailsRow label="Total" value={intToMoneyString(savedOrder.totalPrice)} isLoading={isLoading} />
        <OrderDetailsRow label="Payment" value={`${savedOrder.cardBrand?.toUpperCase()} ****${savedOrder.lastFourDigits}`} isLoading={isLoading} />
        <OrderDetailsRow label="Ordered" value={formatIsoToTime(savedOrder.orderedAt)} isLoading={isLoading} />
        <OrderDetailsRow label="Delivery" value={`Unit ${unitNumber} by ${formatIsoToTime(deliverySlot)}`} isLoading={isLoading} />
      </div>
      <p>Something not right? <br/> Contact us: (551) 837-9907</p>
    </div>
  );
};

export default OrderConfirmation;
