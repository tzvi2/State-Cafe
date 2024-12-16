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
import { validateTimeSlot } from "../../api/timeslotRequests";
import AvailableTimeslots from "./AvailableTimeslots";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { cart } = useCart();
  const { deliveryDate, deliverySlot, setDeliverySlot } = useDeliveryDetails();

  const [message, setMessage] = useState("");
  const [slotMessage, setSlotMessage] = useState("")
  const [formLoading, setFormLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showTimeslotError, setShowTimeslotError] = useState(false);

  const handleSlotValidation = async () => {
    try {
      const validationResult = await validateTimeSlot(
        deliveryDate,
        deliverySlot,
        cart.totalCookTime
      );

      if (!validationResult.success) {
        setSlotMessage(
          "Your selected delivery time is no longer available. Please select a new delivery time."
        );
        setShowTimeslotError(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating time slot:", error);
      setMessage("An error occurred while validating the selected timeslot.");
      return false;
    }
  };

  const handleNewTimeslotSelection = (slot) => {
    setDeliverySlot(slot); // Update the selected delivery slot
    setShowTimeslotError(false); // Hide error message
    setSlotMessage(""); // Clear the message
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.log("Stripe or Elements not loaded.");
      return;
    }

    const isSlotValid = await handleSlotValidation();
    if (!isSlotValid) {
      return; // Don't proceed if the slot is invalid
    }

    setPaymentLoading(true);

    try {
      const paymentResponse = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
        redirect: "if_required",
      });

      if (paymentResponse.error) {
        console.error("Payment error:", paymentResponse.error.message);
        setMessage(paymentResponse.error.message);
        setPaymentLoading(false);
        return;
      }

      const paymentIntent = paymentResponse.paymentIntent;

      if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment successful:", paymentIntent);
        localStorage.setItem(
          "dueDate",
          new Date(`${deliveryDate}T${deliverySlot}:00`).toISOString()
        );
        localStorage.setItem("paymentIntentId", paymentIntent.id);
        window.location.href = `/confirmation?payment_intent_client_secret=${paymentIntent.client_secret}`;
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

    const paymentElement = elements.getElement(PaymentElement);

    if (paymentElement) {
      paymentElement.on("ready", () => {
        setFormLoading(false);
        console.log("PaymentElement is ready.");
      });
    }

    return () => {
      if (paymentElement) {
        paymentElement.off("ready");
      }
    };
  }, [stripe, elements]);

  return (
    <>
      {message && <p className={styles.error}>{message}</p>}
      <form
        className={styles.checkoutForm}
        id="payment-form"
        onSubmit={handleSubmit}
      >
        <PaymentElement className={styles.stripeElement} />
        {showTimeslotError && (
          <AvailableTimeslots
            onSlotChange={handleNewTimeslotSelection}
            showError={showTimeslotError}
          />
        )}
        {!formLoading && (
          <button
            className={styles.payButton}
            disabled={paymentLoading || showTimeslotError} // Disable if error is showing
            id="submit"
          >
            <span id="button-text">
              {paymentLoading
                ? "In progress..."
                : `Pay ${centsToFormattedPrice(cart.totalPrice)}`}
            </span>
          </button>
        )}
      </form>
    </>
  );
}
