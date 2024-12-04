import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { useCart } from '../../hooks/useCart';
import styles from '../styles/checkout process styles/DeliveryPage.module.css';
import apiUrl from '../../config';

function DeliveryPage() {
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const { cart } = useCart();
  const {
    setDeliverySlot,
    setUnitNumber,
    unitNumber,
    deliverySlot,
    deliveryDate,
    phoneNumber,
    setPhoneNumber,
  } = useDeliveryDetails();
  const [apartmentNumberError, setApartmentNumberError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const navigate = useNavigate();

  const fetchTimeSlots = useCallback(async () => {
    if (!deliveryDate || cart.totalCookTime <= 0) {
      setAvailableTimeSlots([]);
      setDeliveryAvailable(false);
      return;
    }

    const url = `${apiUrl}/hours/${deliveryDate}/available-slots?timeToCook=${cart.totalCookTime}`;
    console.log(`Fetching time slots from: ${url}, total cook time: ${cart.totalCookTime}`);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch available delivery slots');

      const { available_slots: slots } = await response.json();
      console.log('Raw time slots from backend:', slots);

      const formattedSlots = slots.map(slot => ({
        time: slot,
        displayTime: new Intl.DateTimeFormat([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'UTC', // Ensure consistent timezone formatting
        }).format(new Date(`1970-01-01T${slot}:00Z`)),
      }));

      console.log('Formatted slots:', formattedSlots);

      setAvailableTimeSlots(formattedSlots);
      setDeliveryAvailable(formattedSlots.length > 0);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setAvailableTimeSlots([]);
      setDeliveryAvailable(false);
    }
  }, [deliveryDate, cart.totalCookTime]);


  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  useEffect(() => {
    console.log('available slots', availableTimeSlots)
  }, [availableTimeSlots])

  const handlePhoneNumberChange = (e) => setPhoneNumber(e.target.value);

  const handleSlotSelection = (e) => setDeliverySlot(e.target.value);

  const handleApartmentNumberChange = (e) => setUnitNumber(e.target.value);

  const handleSubmit = () => {
    let isValid = true;

    if (!unitNumber || unitNumber.length !== 3 || unitNumber < 201 || unitNumber > 558) {
      setApartmentNumberError('Apartment number should be 3 digits between 201 and 558.');
      isValid = false;
    } else {
      setApartmentNumberError('');
    }

    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneNumber || !phonePattern.test(phoneNumber)) {
      setPhoneNumberError('Phone number should be in the format 123-456-7890.');
      isValid = false;
    } else {
      setPhoneNumberError('');
    }

    if (isValid && deliverySlot && deliveryDate) {
      navigate('/payment');
    }
  };

  return (
    <div className={styles.deliveryPage}>
      <div className={styles.errorRow}>
        {apartmentNumberError && <p className={styles.error}>{apartmentNumberError}</p>}
      </div>

      <div className={styles.flexRow}>
        <label htmlFor="apartmentNumber">Apartment:</label>
        <input
          type="number"
          id="apartmentNumber"
          value={unitNumber}
          onChange={handleApartmentNumberChange}
          min={201}
          max={558}
          placeholder="e.g., 305"
        />
      </div>

      <div className={styles.errorRow}>
        {phoneNumberError && <p className={styles.error}>{phoneNumberError}</p>}
      </div>

      <div className={styles.flexRow}>
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="123-456-7890"
        />
      </div>

      {deliveryDate && (
        <>
          {deliveryAvailable ? (
            <select
              className={styles.wideBtn}
              value={deliverySlot}
              onChange={handleSlotSelection}
            >
              <option value="">Select a delivery time</option>
              {availableTimeSlots.map((slot) => (
                <option
                  key={slot.time}
                  value={slot.time}
                  className={slot.displayTime.endsWith('AM') ? styles.morningHours : styles.eveningHours}
                >
                  {slot.displayTime}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ textAlign: 'center' }}>No delivery slots available for the selected date</div>
          )}

          <button
            className={styles.wideBtn}
            onClick={handleSubmit}
            disabled={!deliveryAvailable || !deliverySlot || !unitNumber}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default DeliveryPage;
