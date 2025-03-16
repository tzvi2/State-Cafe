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
import AvailableTimeslots from "./AvailableTimeslots";
import apiUrl from "../../config";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart, removeItem } = useCart();
  const { deliveryDate, deliverySlot, setDeliverySlot } = useDeliveryDetails();

  const [message, setMessage] = useState("");
  const [formLoading, setFormLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [showTimeslotError, setShowTimeslotError] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState([]);

  useEffect(() => {
    console.log("Cart updated:", cart);
  }, [cart]);


  const handleStockIssues = (outOfStockItems, lowStockItems) => {
    const issuesMessage = [];

    // Out-of-stock items with other items in the cart
    if (outOfStockItems.length > 0 && lowStockItems.length === 0 && outOfStockItems.length < cart.items.length) {
      issuesMessage.push(
        `The following items are out of stock:\n\n${outOfStockItems.map((item) => item.title).join(", ")}`
      );
      const userConfirmed = window.confirm(
        `${issuesMessage.join("\n\n")}\n\nWould you like to automatically remove them from your cart?`
      );
      if (userConfirmed) {
        outOfStockItems.forEach((item) => removeItem(item.cartItemId));
        alert("Out-of-stock items removed from your cart. Please review and try again.");
      }
      return true; // Stop further execution
    }

    // Low-stock items
    if (lowStockItems.length > 0) {
      issuesMessage.push(
        `The following items have limited stock:\n\n${lowStockItems
          .map((item) => `${item.title}: only ${item.available} left`)
          .join("\n")}\n\nPlease adjust your cart.`
      );
      alert(issuesMessage.join("\n\n"));
      return true; // Stop further execution
    }

    // Out-of-stock items with no other items in the cart
    if (outOfStockItems.length > 0) {
      issuesMessage.push(
        `The following items are out of stock:\n\n${outOfStockItems.map((item) => item.title).join(", ")}`
      );
      alert(issuesMessage.join("\n\n"));
      return true; // Stop further execution
    }

    return false; // No stock issues
  };

  const handleRemoveOutOfStockItems = () => {
    outOfStockItems.forEach((item) => {
      removeItem(item.id); // Remove out-of-stock items
    });
    setOutOfStockItems([]);
    setMessage("Out-of-stock items removed from cart.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPaymentLoading(true);
    setMessage("");
    //console.log('delivery date', deliveryDate, 'delivery slot', deliverySlot)

    try {
      // Validate the checkout
      const validationResponse = await fetch(`${apiUrl}/checkout/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: deliveryDate,
          slot: deliverySlot,
          cart: cart.items,
          totalCookTime: cart.totalCookTime,
        }),
      });

      const validationData = await validationResponse.json();
      console.log("Validation Data:", validationData);

      if (!validationData.success) {
        if (validationData.errorType === "stock") {
          const { outOfStockItems = [], lowStockItems = [] } = validationData;
          if (handleStockIssues(outOfStockItems, lowStockItems)) return;
        } else {
          setShowTimeslotError(true);
          throw new Error(validationData.error || "Order validation failed.");
        }
        return;
      }

      // Confirm payment with Stripe
      const paymentResponse = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
        redirect: "if_required",
      });

      if (paymentResponse.error) {
        console.error("Payment Error:", paymentResponse.error);
        await fetch(`${apiUrl}/checkout/release-slot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dueDate: new Date(`${deliveryDate}T${deliverySlot}:00Z`).toISOString(),
            reservationId: validationData.reservationId,
          }),
        });
        throw new Error(paymentResponse.error.message || "Payment failed.");
      }

      // Process the checkout
      const processResponse = await fetch(`${apiUrl}/checkout/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dueDate: new Date(`${deliveryDate}T${deliverySlot}:00Z`).toISOString(),
          slot: deliverySlot,
          cart: cart.items,
          totalCookTime: cart.totalCookTime,
          paymentIntentId: paymentResponse.paymentIntent.id,
          reservationId: validationData.reservationId,
          customerDetails: {
            phoneNumber: sessionStorage.getItem("phoneNumber"),
            unitNumber: sessionStorage.getItem("unitNumber"),
            buildingName: sessionStorage.getItem("buildingName")
          },
        }),
      });

      const processData = await processResponse.json();
      if (!processData.success) {
        throw new Error(processData.error || "Checkout process failed.");
      }

      // Successful payment
      if (paymentResponse.paymentIntent.status === "succeeded") {
        setPaymentSuccessful(true); // Mark payment as successful
        clearCart();
        window.location.href = `/confirmation?payment_intent_client_secret=${paymentResponse.paymentIntent.client_secret}`;
      }
    } catch (error) {
      console.error("Error during checkout:", error.message);
      setMessage(error.message || "An error occurred.");
    } finally {
      if (!paymentSuccessful) setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (!stripe || !elements) return;

    const paymentElement = elements.getElement(PaymentElement);

    if (paymentElement) {
      paymentElement.on("ready", () => setFormLoading(false));
    }

    return () => {
      if (paymentElement) paymentElement.off("ready");
    };
  }, [stripe, elements]);

  return (
    <>
      {message && <p className={styles.error}>{message}</p>}
      {outOfStockItems.length > 0 && (
        <div className={styles.outOfStockPopup}>
          <p>Some items are out of stock:</p>
          <ul>
            {outOfStockItems.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
          <button onClick={handleRemoveOutOfStockItems}>
            Remove Out-of-Stock Items
          </button>
        </div>
      )}
      <form className={styles.checkoutForm} id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement className={styles.stripeElement} />
        {showTimeslotError && (
          <AvailableTimeslots
            onSlotChange={(newSlot) => {
              setDeliverySlot(newSlot);
              setShowTimeslotError(false);
              setMessage("");
            }}
            showError={showTimeslotError}
            autoSelectEarliest={false}
          />
        )}
        {!formLoading && (
          <button
            className={styles.payButton}
            disabled={paymentLoading || (showTimeslotError && !deliverySlot)}
            id="submit"
          >
            <span id="button-text">
              {paymentSuccessful || paymentLoading ? "Processing..." : `Pay ${centsToFormattedPrice(cart.totalPrice)}`}
            </span>
          </button>

        )}
      </form>
    </>
  );
}
