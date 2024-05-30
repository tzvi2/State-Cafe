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

  const saveOrderToDatabase = async (paymentIntentId, orderDetails) => {
    try {
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

      // Save order details in local storage for future reference
      localStorage.setItem(`orderDetails_${paymentIntentId}`, JSON.stringify(savedOrderResponse));
    } catch (error) {
      console.error('Error saving order to database:', error);
      // Handle error (e.g., notify the user)
    }
  };

  useEffect(() => {
    const processOrder = async () => {
      const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
      let paymentIntentId;

      if (clientSecret) {
        paymentIntentId = clientSecret.split('_secret_')[0];
      }

      if (paymentIntentId && !localStorage.getItem(`orderSaved_${paymentIntentId}`)) {
        try {
          const cardInfo = await getLastFourDigits(paymentIntentId);

          const orderDetails = {
            items: cart.items,
            totalPrice: cart.totalPrice,
            deliverySlot,
            unitNumber,
            lastFourDigits: cardInfo.lastFour,
            cardBrand: cardInfo.brand,
            paymentIntentId,
            phoneNumber,
            deliveryAddress: unitNumber,
            deliveryTime: deliverySlot,
            orderedAt: new Date().toISOString(), // Add orderedAt for consistency
          };

          await saveOrderToDatabase(paymentIntentId, orderDetails);
          
        } catch (error) {
          console.error('Error processing order:', error);
          // Handle error (e.g., notify the user)
        } finally {
          // Clear the cart and delivery details after attempting to process the order, regardless of success or failure
          clearCart();
          clearDeliveryDetails();
        }
      } else if (paymentIntentId) {
        console.log('Order already saved, fetching from local storage');
        // If the order was previously saved, retrieve it from localStorage
        const existingOrder = JSON.parse(localStorage.getItem(`orderDetails_${paymentIntentId}`));
        if (existingOrder) {
          setSavedOrder(existingOrder);
        }
        // Clear the cart and delivery details in case the order was already saved
        clearCart();
        clearDeliveryDetails();
      }
      setIsLoading(false); // Data has been loaded
    };

    processOrder();
  }, []); // Empty array means the effect runs only once

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
        <OrderDetailsRow label="Total" value={intToMoneyString(savedOrder.totalPrice)} isLoading={isLoading} />
        <OrderDetailsRow label="Payment" value={`${savedOrder.cardBrand?.toUpperCase()} ****${savedOrder.lastFourDigits}`} isLoading={isLoading} />
        <OrderDetailsRow label="Ordered" value={formatIsoToTime(savedOrder.orderedAt)} isLoading={isLoading} />
        <OrderDetailsRow label="Delivery" value={`Unit ${savedOrder.deliveryAddress} by ${formatIsoToTime(savedOrder.deliveryTime)}`} isLoading={isLoading} />
      </div>
      <p>Something not right? <br/> Contact us: (551) 837-9907</p>
    </div>
  );
};

export default OrderConfirmation;
