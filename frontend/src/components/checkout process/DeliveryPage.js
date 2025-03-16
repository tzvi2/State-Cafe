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
  const { acceptingOrders } = useOrderContext();
  const {
    setDeliverySlot,
    setUnitNumber,
    unitNumber,
    deliverySlot,
    deliveryDate,
    phoneNumber,
    setPhoneNumber,
    buildingName,
    setBuildingName,
  } = useDeliveryDetails();
  const [apartmentNumberError, setApartmentNumberError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const navigate = useNavigate();

  const handleBuildingChange = (e) => {
    setBuildingName(e.target.value); // Update the selected building
  };

  const handlePhoneNumberChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
    if (input.length > 3 && input.length <= 6) {
      input = input.replace(/(\d{3})(\d+)/, "$1-$2"); // Add dash after first 3 digits
    } else if (input.length > 6) {
      input = input.replace(/(\d{3})(\d{3})(\d+)/, "$1-$2-$3"); // Add dashes after first 3 and next 3 digits
    }
    setPhoneNumber(input);
  };

  const handleSubmit = () => {
    console.log(acceptingOrders, phoneNumber, deliverySlot, unitNumber)
    //return
    //console.log('delivery slot', deliverySlot);
    let isValid = true;

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

      if (deliverySlot && deliveryDate && buildingName) {
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
          <label htmlFor="building">Apartment:</label>
          <select value={buildingName} onChange={handleBuildingChange}>
            <option value="">Select a building</option>
            <option value="One500">One500</option>
            <option value="Terrace Circle">Terrace Circle</option>
            <option value="Teaneck Square">Teaneck Square</option>
            <option value="The Castle">The Castle</option>
            <option value="Ayers Court">Ayers Court</option>
            <option value="Walraven">Walraven</option>
            {/* <option value="Avalon">Avalon (Windsor rd)</option> */}
          </select>
        </div>

        <div className={styles.flexRow}>
          <label htmlFor="apartmentNumber">Unit/Address:</label>
          <input
            type="text"
            id="apartmentNumber"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            placeholder="e.g. 200"
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
            {!acceptingOrders && (
              <p className={styles.centered}>We're not taking orders at the moment.</p>
            )}
            <button
              className={styles.wideBtn}
              onClick={handleSubmit}
              disabled={!acceptingOrders || !phoneNumber || !deliverySlot || !unitNumber || !buildingName}
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
