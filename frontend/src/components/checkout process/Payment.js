import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '../../hooks/useCart';
import apiUrl from '../../config';

function Checkout(props) {
  const { cart } = useCart();
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    fetch(`${apiUrl}/payment/config`).then(async (res) => {
      const { publishableKey } = await res.json();
      setStripePromise(loadStripe(publishableKey));
    });
  }, []);

  useEffect(() => {
    console.log('fetching payment intent secret')
    fetch(`${apiUrl}/payment/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart.items }),
    }).then(async (res) => {
      const { clientSecret } = await res.json();
      setClientSecret(clientSecret);
    });
  }, [cart.items]);

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Payment with Stripe</h1>
      {stripePromise && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
}

export default Checkout;
