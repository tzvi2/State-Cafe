import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import { useCart } from '../../hooks/useCart';
import { useOrderContext } from '../../contexts/OrderContext';
import styles from '../styles/checkout process styles/DeliveryPage.module.css';
import apiUrl from '../../config';
import AvailableTimeslots from './AvailableTimeslots';
import BackArrow from '../BackArrow';

function DeliveryPage() {
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const { cart } = useCart();
  const { acceptingOrders } = useOrderContext()
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

  const handlePhoneNumberChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
    if (input.length > 3 && input.length <= 6) {
      input = input.replace(/(\d{3})(\d+)/, "$1-$2"); // Add dash after first 3 digits
    } else if (input.length > 6) {
      input = input.replace(/(\d{3})(\d{3})(\d+)/, "$1-$2-$3"); // Add dashes after first 3 and next 3 digits
    }
    setPhoneNumber(input);
  };

  const handleApartmentNumberChange = (e) => setUnitNumber(e.target.value);

  const handleSubmit = () => {
    console.log(acceptingOrders, phoneNumber, deliverySlot, unitNumber)
    //return
    //console.log('delivery slot', deliverySlot);
    let isValid = true;

    // Validate apartment number
    if (!unitNumber || unitNumber.length !== 3 || unitNumber < 201 || unitNumber > 558) {
      setApartmentNumberError('Apartment number should be 3 digits between 201 and 558.');
      isValid = false;
    } else {
      setApartmentNumberError('');
    }

    // Validate phone number
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneNumber || !phonePattern.test(phoneNumber)) {
      setPhoneNumberError('Phone number should be in the format 123-456-7890.');
      isValid = false;
    } else {
      setPhoneNumberError('');
    }

    // Save to sessionStorage if valid
    if (isValid) {
      sessionStorage.setItem('phoneNumber', phoneNumber);
      sessionStorage.setItem('unitNumber', unitNumber);

      if (deliverySlot && deliveryDate) {
        navigate('/payment');
      } else {
        console.warn('Missing delivery slot or date.');
      }
    }
  };

  return (
    <>
      <BackArrow />
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
            <AvailableTimeslots autoSelectEarliest={true} />

            <button
              className={styles.wideBtn}
              onClick={handleSubmit}
              disabled={!acceptingOrders || !phoneNumber || !deliverySlot || !unitNumber}
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default DeliveryPage;
