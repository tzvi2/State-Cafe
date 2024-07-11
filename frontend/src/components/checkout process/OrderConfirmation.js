import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { saveOrder } from '../../api/orderRequests';
import { getLastFourDigits } from '../../api/paymentRequests';
import { bookTimeSlot } from '../../api/timeslotRequests';
import styles from '../styles/checkout process styles/OrderConfirmation.module.css';
import { updateQuantityOfAllCartItems } from '../../api/stockRequests';
import { centsToFormattedPrice } from '../../utils/priceUtilities';
import { formatIsoToTime } from '../../utils/timeUtilities';

const OrderDetailsRow = ({ label, value, isLoading }) => (
  <div className={styles.orderDetailsRow}>
    <span className={styles.label}>{label}:</span>
    <span>{isLoading ? <span className={styles.skeleton}></span> : value}</span>
  </div>
);

const OrderConfirmation = () => {
  const { cart, clearCart } = useCart();
  const { deliverySlot, unitNumber, deliveryDate, phoneNumber, clearDeliveryDetails } = useDeliveryDetails();
  const [savedOrder, setSavedOrder] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const saveOrderToDatabase = async (paymentIntentId, orderDetails) => {
    try {
      const definedOrderDetails = {
        ...orderDetails,
        lastFourDigits: orderDetails.lastFourDigits || '',
        cardBrand: orderDetails.cardBrand || 'Unknown',
      };
      const savedOrderResponse = await saveOrder(definedOrderDetails);
      setSavedOrder(savedOrderResponse);

      await bookTimeSlot({
        totalCookTime: cart.totalCookTime,
        date: deliveryDate,
        time: deliverySlot,
      });

      localStorage.setItem(`orderSaved_${paymentIntentId}`, 'true');
      localStorage.setItem(`orderDetails_${paymentIntentId}`, JSON.stringify(savedOrderResponse));
      localStorage.setItem('lastOrder', JSON.stringify(savedOrderResponse));
    } catch (error) {
      console.error('Error saving order to database:', error);
    }
  };

  useEffect(() => {
    const processOrder = async () => {
      const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
      const paymentIntentId = clientSecret?.split('_secret_')[0];

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
            orderedAt: new Date().toISOString(),
          };

          await saveOrderToDatabase(paymentIntentId, orderDetails);
          await updateQuantityOfAllCartItems(deliveryDate, cart.items);
        } catch (error) {
          console.error('Error processing order:', error);
        } finally {
          clearCart();
          clearDeliveryDetails();
        }
      } else if (paymentIntentId) {
        const existingOrder = JSON.parse(localStorage.getItem(`orderDetails_${paymentIntentId}`));
        if (existingOrder) {
          setSavedOrder(existingOrder);
        }
        clearCart();
        clearDeliveryDetails();
      } else {
        const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
        if (lastOrder) {
          setSavedOrder(lastOrder);
        }
      }
      setIsLoading(false);
    };

    processOrder();
  }, []);

  return (
    <div className={styles.confirmationCard}>
      <h2>Thank you, your order is complete.</h2>
      <div className={styles.rows}>
        <OrderDetailsRow label="Ordered" value={formatIsoToTime(savedOrder.orderedAt)} isLoading={isLoading} />
        <OrderDetailsRow label="Delivery" value={`Unit ${savedOrder.deliveryAddress} at ${formatIsoToTime(savedOrder.deliverySlot)}`} isLoading={isLoading} />
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
          {isLoading ? (
            <tr>
              <td colSpan="3">
                <div className={styles.skeletonRow}></div>
              </td>
            </tr>
          ) : (
            savedOrder.items?.map((item, idx) => (
              <tr key={idx}>
                <td>{item.quantity}</td>
                <td className={styles.itemDescription}>
                  {item.itemId}
                  {item.options.map((option, idx) => (
                    <div key={idx} className={styles.optionRow}>
                      <span>-{option.title}</span>
                      <span className={styles.optionPrice}>+{centsToFormattedPrice(option.price)}</span>
                    </div>
                  ))}
                </td>
                <td className={styles.price}>{centsToFormattedPrice(item.total)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2" className={styles.totalLabel}>Total:</td>
            <td className={styles.price}>{centsToFormattedPrice(savedOrder.totalPrice)}</td>
          </tr>
        </tfoot>
      </table>
      <OrderDetailsRow label="Payment Method" value={`${savedOrder.cardBrand?.toUpperCase()} ${savedOrder.lastFourDigits}`} isLoading={isLoading} />
      <p>Something not right? <br /> Contact us: (551) 837-9907</p>
    </div>
  );
};

export default OrderConfirmation;
