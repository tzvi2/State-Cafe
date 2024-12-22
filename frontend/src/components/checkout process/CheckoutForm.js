import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import styles from "../styles/checkout process styles/CheckoutForm.module.css";
import { useCart } from "../../hooks/useCart";
import { useDeliveryDetails } from "../../hooks/useDeliveryDetails";
import { useOrderContext } from "../../contexts/OrderContext";
import { centsToFormattedPrice } from "../../utils/priceUtilities";
import { validateTimeSlot } from "../../api/timeslotRequests";
import AvailableTimeslots from "./AvailableTimeslots";
import { getStockForDate } from '../../api/stockRequests'
import apiUrl from "../../config";
import { processOrder } from "../../api/orderRequests";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, updateItemQuantity, setCartItems, removeFromCart } = useCart();
  const { deliveryDate, deliverySlot, setDeliverySlot } = useDeliveryDetails();
  const { inOrderingWindow } = useOrderContext()

  const [message, setMessage] = useState("");
  const [slotMessage, setSlotMessage] = useState("");
  const [formLoading, setFormLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showTimeslotError, setShowTimeslotError] = useState(false);
  const [showTimeslots, setShowTimeslots] = useState(false); // New state
  const [cartAdjustmentMessage, setCartAdjustmentMessage] = useState("")

  const handleSlotValidation = async () => {
    try {
      const validationResult = await validateTimeSlot(
        deliveryDate,
        deliverySlot,
        cart.totalCookTime
      );

      console.log('validation result ', validationResult)

      if (!validationResult.success) {
        setSlotMessage(
          "Your selected delivery time is no longer available. Please select a new delivery time."
        );
        setShowTimeslotError(true);
        setShowTimeslots(true); // Keep the component visible
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating time slot:", error);
      setMessage("An error occurred while validating the selected timeslot.");
      return false;
    }
  };

  const validateCartStock = async () => {
    console.log("Checking cart items against stock...");
    const stockData = await getStockForDate(deliveryDate);
    console.log("Stock data:", stockData);

    const outOfStockItems = [];
    const lowStockItems = [];

    cart.items.forEach((item) => {
      const availableQuantity = stockData[item.title]?.quantity || 0;

      if (availableQuantity === 0) {
        outOfStockItems.push(item);
      } else if (availableQuantity < item.quantity) {
        lowStockItems.push({
          ...item,
          availableQuantity,
        });
      }
    });

    if (outOfStockItems.length > 0 && lowStockItems.length === 0) {
      const userConfirmed = window.confirm(
        `The following items are out of stock:\n\n${outOfStockItems
          .map((item) => item.title)
          .join(", ")}\n\nWould you like to automatically remove them from your cart?`
      );

      if (userConfirmed) {
        outOfStockItems.forEach((item) => removeFromCart(item.cartItemId));
        return {
          success: false,
          message: "Out-of-stock items were removed from your cart. Please review your cart and try again.",
        };
      } else {
        return {
          success: false,
          message: "Please remove out-of-stock items before proceeding.",
        };
      }
    }

    if (outOfStockItems.length === 0 && lowStockItems.length > 0) {
      const userConfirmed = window.confirm(
        `The following items have limited quantities:\n\n${lowStockItems
          .map((item) => `${item.title}: only ${item.availableQuantity} left`)
          .join("\n")}\n\nWould you like to adjust the quantities in your cart?`
      );

      if (userConfirmed) {
        lowStockItems.forEach((item) => updateItemQuantity(item.cartItemId, item.availableQuantity));
        return {
          success: false,
          message: "Cart has been updated to reflect available items.",
        };
      } else {
        return {
          success: false,
          message: "Please adjust your cart before proceeding.",
        };
      }
    }

    if (outOfStockItems.length > 0 && lowStockItems.length > 0) {
      const userConfirmed = window.confirm(
        `The following items are out of stock:\n\n${outOfStockItems
          .map((item) => item.title)
          .join(", ")}\n\nThe following items have limited quantities:\n\n${lowStockItems
            .map((item) => `${item.title}: only ${item.availableQuantity} left`)
            .join("\n")}\n\nWould you like to automatically remove out-of-stock items and adjust the quantities of limited stock items?`
      );

      if (userConfirmed) {
        outOfStockItems.forEach((item) => removeFromCart(item.cartItemId));
        lowStockItems.forEach((item) => updateItemQuantity(item.cartItemId, item.availableQuantity));
        return {
          success: false,
          message: "Cart has been updated to reflect available items.",
        };
      } else {
        return {
          success: false,
          message: "Please adjust your cart before proceeding.",
        };
      }
    }

    console.log("All items are in stock.");
    return { success: true };
  };

  const handleNewTimeslotSelection = (slot) => {
    setDeliverySlot(slot); // Update the selected delivery slot
    setSlotMessage(""); // Clear the message
    setShowTimeslotError(false); // Clear error
    setShowTimeslots(true); // Keep the component visible
  };

  const validateAndReserve = async (deliveryDate, deliverySlot, cart, totalCookTime) => {
    try {
      const response = await fetch(`${apiUrl}/orders/checkout/validate-and-reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: deliveryDate,
          slot: deliverySlot,
          cart,
          totalCookTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.stockIssues) {
          const outOfStockItems = data.stockIssues.filter((item) => item.available === 0);
          const lowStockItems = data.stockIssues.filter(
            (item) => item.available > 0 && item.available < item.requested
          );
          return { success: false, outOfStockItems, lowStockItems };
        }
        throw new Error(data.error || "Failed to validate and reserve.");
      }

      return { success: true };
    } catch (error) {
      console.error("Validation error:", error.message);
      return { success: false, message: error.message };
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setPaymentLoading(true);

    try {
      // 1. Validate and reserve slot
      const validationResult = await validateAndReserve(
        deliveryDate,
        deliverySlot,
        cart.items,
        cart.totalCookTime
      );

      if (!validationResult.success) {
        setMessage(validationResult.message || "Validation failed");
        return;
      }

      // 2. Confirm payment
      const paymentResponse = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
        redirect: "if_required",
      });

      if (paymentResponse.error) {
        console.log('payment response', paymentResponse);
        setMessage(paymentResponse.error.message);
        return;
      }

      console.log('payment reonse', paymentResponse);


      // 3. Process order on backend
      const response = await fetch(`${apiUrl}/orders/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentResponse.paymentIntent.id,
          orderDetails: {
            items: cart.items,
            dueDate: `${deliveryDate}T${deliverySlot}:00`,
            totalPrice: cart.totalPrice,
            customerDetails: {
              phoneNumber: sessionStorage.getItem("phoneNumber"),
              unitNumber: sessionStorage.getItem("unitNumber"),
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process order.");
      }

      const data = await response.json();
      window.location.href = `/confirmation?payment_intent_client_secret=${paymentResponse.paymentIntent.client_secret}`;
    } catch (error) {
      setMessage(error.message || "Payment or order processing failed. Please try again.");
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
        <p>{cartAdjustmentMessage}</p>
        {(showTimeslotError || showTimeslots) && (
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
