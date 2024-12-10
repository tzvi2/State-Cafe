import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import styles from "../styles/checkout process styles/CheckoutForm.module.css";
import { useCart } from "../../hooks/useCart";
import { useDeliveryDetails } from "../../hooks/useDeliveryDetails";
import { centsToFormattedPrice } from "../../utils/priceUtilities";
import { getStockForDate } from "../../api/stockRequests";
import { saveOrder } from "../../api/orderRequests";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, updateItemQuantity, clearCart } = useCart();
  const { deliveryDate, deliverySlot, unitNumber, phoneNumber } =
    useDeliveryDetails();

  const [message, setMessage] = useState("");
  const [formLoading, setFormLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const checkCartItemsAgainstStock = async () => {
    console.log("Checking cart items against stock...");
    const stockData = await getStockForDate(deliveryDate);
    console.log("Stock data:", stockData);

    const outOfStockItems = [];
    const lowStockItems = [];

    cart.items.forEach((item) => {
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
      console.log("Out of stock items:", outOfStockItems);
      return {
        success: false,
        message: `The following items are out of stock: ${outOfStockItems.join(
          ", "
        )}. Please remove them from your cart.`,
      };
    }

    if (lowStockItems.length > 0) {
      console.log("Low stock items:", lowStockItems);
      const userConfirmed = window.confirm(
        `The following items have limited stock:\n\n${lowStockItems
          .map((item) => `${item.title}: only ${item.availableQuantity} left`)
          .join("\n")}\n\nWould you like to adjust quantities?`
      );

      if (userConfirmed) {
        lowStockItems.forEach((item) => {
          const cartItem = cart.items.find(
            (cartItem) => cartItem.title === item.title
          );
          updateItemQuantity(cartItem.cartItemId, item.availableQuantity);
        });
        return { success: false }; // Let user adjust and try again
      } else {
        return {
          success: false,
          message: "Please adjust item quantities before proceeding.",
        };
      }
    }

    console.log("All items are in stock.");
    return { success: true };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.log("Stripe or Elements not loaded.");
      return;
    }

    const stockCheckResult = await checkCartItemsAgainstStock();
    if (!stockCheckResult.success) {
      setMessage(stockCheckResult.message);
      console.log("Stock check failed:", stockCheckResult.message);
      return;
    }

    setPaymentLoading(true);
    console.log("Processing payment...");

    try {
      // Confirm the payment and get the response
      const paymentResponse = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
        redirect: "if_required", // Prevent auto-redirection
      });

      // Check if the response contains an error or payment intent
      if (paymentResponse.error) {
        console.error("Payment error:", paymentResponse.error.message);
        setMessage(paymentResponse.error.message);
        setPaymentLoading(false);
        return;
      }

      const paymentIntent = paymentResponse.paymentIntent;

      if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment successful. Payment Intent:", paymentIntent);

        // Calculate dueDate and save to localStorage
        const dueDate = new Date(`${deliveryDate}T${deliverySlot}:00`).toISOString();
        console.log("Calculated dueDate:", dueDate);
        localStorage.setItem("dueDate", dueDate);

        // Save paymentIntentId in localStorage for backup
        localStorage.setItem("paymentIntentId", paymentIntent.id);
        console.log("PaymentIntentId saved to localStorage:", paymentIntent.id);

        // Redirect to confirmation page
        window.location.href = `/confirmation?payment_intent_client_secret=${paymentIntent.client_secret}`;
      } else {
        console.log("Payment intent status:", paymentIntent?.status);
      }
    } catch (error) {
      console.error("Error during payment process:", error);
      setMessage("An error occurred during payment. Please try again.");
    } finally {
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
        console.log("PaymentElement is ready.");
      }, 250);
    };

    const paymentElement = elements.getElement(PaymentElement);

    if (paymentElement) {
      paymentElement.on("ready", handleReady);
    }

    return () => {
      if (paymentElement) {
        paymentElement.off("ready", handleReady);
      }
      if (buttonPause) {
        clearTimeout(buttonPause);
      }
    };
  }, [stripe, elements]);

  return (
    <>
      {message && <p className={styles.message}>{message}</p>}
      <form className={styles.checkoutForm} id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement />
        {!formLoading && (
          <button className={styles.payButton} disabled={paymentLoading} id="submit">
            <span id="button-text">
              {paymentLoading ? "In progress..." : `Pay ${centsToFormattedPrice(cart.totalPrice)}`}
            </span>
          </button>
        )}
      </form>
    </>
  );
}
