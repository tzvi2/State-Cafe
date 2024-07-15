import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import styles from '../styles/checkout process styles/CheckoutForm.module.css';
import { useCart } from "../../hooks/useCart";
import { centsToFormattedPrice } from "../../utils/priceUtilities";
import { getStockForDate } from "../../api/stockRequests";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const { cart, updateItemQuantity, removeFromCart, clearCart } = useCart();

  const [message, setMessage] = useState("");
  const [formLoading, setFormLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe has not yet loaded. Prevent form submission until fully loaded.
      return;
    }

    // Check cart items against stock
    const stockCheckResult = await checkCartItemsAgainstStock();
    if (!stockCheckResult.success) {
      setMessage(stockCheckResult.message);
      return;
    }

    setPaymentLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation`,
      },
    });

    if (error) {
      setMessage(error.message);
      setPaymentLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      //console.log('no error');
      clearCart();
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }

    let buttonPause;

    const handleReady = () => {
      buttonPause = setTimeout(() => {
        setFormLoading(false);
      }, 250);
    };

    const paymentElement = elements.getElement(PaymentElement);

    if (paymentElement) {
      paymentElement.on('ready', handleReady);
    }

    return () => {
      if (paymentElement) {
        paymentElement.off('ready', handleReady);
      }
      if (buttonPause) {
        clearTimeout(buttonPause);
      }
    };
  }, [stripe, elements]);

  const checkCartItemsAgainstStock = async () => {
    const dateString = getLocalDate();
    const stockData = await getStockForDate(dateString);
    const outOfStockItems = [];
    const lowStockItems = [];
  
    cart.items.forEach(item => {
      const availableQuantity = stockData[item.title]?.quantity || 0;
      if (availableQuantity === 0) {
        outOfStockItems.push(item.title);
      } else if (availableQuantity < item.quantity) {
        lowStockItems.push({
          title: item.title,
          availableQuantity,
        });
      }
    });
  
    if (outOfStockItems.length > 0) {
      return {
        success: false,
        message: `The following items have sold out: <span class="${styles.soldOutItems}">${outOfStockItems.join(', ')}</span>. Please remove them from your cart before checking out.`,
      };
    }
  
    if (lowStockItems.length > 0) {
      const userConfirmed = window.confirm(
        `The following items have limited stock:\n\n${lowStockItems
          .map(item => `${item.title}: only ${item.availableQuantity} available`)
          .join('\n')}\n\nWould you like to adjust the quantities to the available stock?`
      );
  
      if (userConfirmed) {
        lowStockItems.forEach(item => {
          const cartItem = cart.items.find(cartItem => cartItem.title === item.title);
          updateItemQuantity(cartItem.cartItemId, item.availableQuantity);
        });
        return {
          success: false, // Indicate the process should halt after adjusting quantities
        };
      } else {
        return {
          success: false,
          message: "Please adjust the quantities of the items with limited stock before checking out.",
        };
      }
    }
  
    return { success: true };
  };

  return (
    <>
      {message && (
        <p className={styles.message} dangerouslySetInnerHTML={{ __html: message }}></p>
      )}
      <form className={styles.checkoutForm} id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement />
        {!formLoading && (
          <button className={styles.payButton} disabled={paymentLoading} id="submit">
            <span id="button-text">
              {paymentLoading ? 'In progress...' : `Pay ${centsToFormattedPrice(cart.totalPrice)}`}
            </span>
          </button>
        )}
      </form>
    </>
  );
}

function getLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
