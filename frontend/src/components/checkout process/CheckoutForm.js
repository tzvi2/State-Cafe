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

  const [message, setMessage] = useState("")
  const [formLoading, setFormLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      // Stripe has not yet loaded. Prevent form submission until fully loaded.
      return;
    }

    setPaymentLoading(true)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation`,
      },
    });
  
    if (error) {
      setMessage(error.message);
      setPaymentLoading(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      clearCart(); 
      setPaymentLoading(false)
    }
  };

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }
  
    let buttonPause

    const handleReady = () => {
      buttonPause = setTimeout(() => {
        setFormLoading(false)
      }, 250)
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
        clearTimeout(buttonPause)
      }
    };
  }, [stripe, elements]);
  

  return (
    <>
    <p className={styles.message}>{message}</p>
      <form className={styles.checkoutForm} id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement />
        {!formLoading && <button className={styles.payButton} disabled={paymentLoading} id="submit">
          <span id="button-text">
            {paymentLoading ? '...' : `Pay ${centsToFormattedPrice(cart.totalPrice)}`}
          </span>
        </button>}
      </form>
    
      
    </>
  );
}

