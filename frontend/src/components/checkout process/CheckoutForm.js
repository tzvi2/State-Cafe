import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import styles from '../styles/checkout process styles/CheckoutForm.module.css'
import { useCart } from "../../hooks/useCart";
import { centsToFormattedPrice } from "../../utils/priceUtilities";

export default function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()

  const {cart, clearCart} = useCart()

  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      // Stripe has not yet loaded. Prevent form submission until fully loaded.
      return;
    }
    setIsLoading(true);
  
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation`,
      },
    });
  
    if (error) {
      setMessage(error.message);
      setIsLoading(false); 
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment succeeded!');
      setPaymentComplete(true); 
      clearCart(); 
      setIsLoading(false);
    }
  };
  

  return (
    <>
      {!paymentComplete && (
        <form className={styles.checkoutForm} id="payment-form" onSubmit={handleSubmit}>
          <PaymentElement />
          <button className={styles.payButton} disabled={isLoading} id="submit">
            <span id="button-text">
              {isLoading ? <div className="spinner" id="spinner"></div> : `Pay ${centsToFormattedPrice(cart.totalPrice)}`}
            </span>
          </button>
        </form>
      )}
      {paymentComplete && <div>{message}</div>}
    </>
  );
}

