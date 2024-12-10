import React, { createContext, useState, useContext, useEffect } from 'react';
import { getESTDate, formatDateToYYYYMMDD } from '../../src/utils/dateUtilities'; // Import utility functions if not already

const DeliveryDetailsContext = createContext();

export const useDeliveryDetails = () => useContext(DeliveryDetailsContext);

export default function DeliverySlotProvider({ children }) {
  const todayEST = getESTDate(); // Get current date in EST
  const todayFormatted = formatDateToYYYYMMDD(todayEST); // Format as YYYY-MM-DD

  const [deliverySlot, setDeliverySlot] = useState(() => {
    const savedSlot = localStorage.getItem('deliverySlot');
    return savedSlot ? JSON.parse(savedSlot) : "";
  });

  const [unitNumber, setUnitNumber] = useState(() => {
    const savedUnitNumber = localStorage.getItem('unitNumber');
    return savedUnitNumber || "";
  });

  const [deliveryDate, setDeliveryDate] = useState(() => {
    const savedDate = localStorage.getItem('deliveryDate');
    return savedDate || todayFormatted; // Default to today if no saved date exists
  });

  const [phoneNumber, setPhoneNumber] = useState(() => {
    const savedPhoneNumber = localStorage.getItem('phoneNumber');
    return savedPhoneNumber || "";
  });

  useEffect(() => {
    localStorage.setItem('unitNumber', unitNumber);
  }, [unitNumber]);

  useEffect(() => {
    localStorage.setItem('phoneNumber', phoneNumber);
  }, [phoneNumber]);

  useEffect(() => {
    localStorage.setItem('deliverySlot', JSON.stringify(deliverySlot));
  }, [deliverySlot]);

  useEffect(() => {
    localStorage.setItem('deliveryDate', deliveryDate);
  }, [deliveryDate]);

  const clearDeliveryDetails = () => {
    setDeliverySlot("");
    setUnitNumber("");
    setDeliveryDate(todayFormatted); // Reset to today when clearing
    setPhoneNumber("");
    localStorage.removeItem('deliverySlot');
    localStorage.removeItem('unitNumber');
    localStorage.removeItem('deliveryDate');
    localStorage.removeItem('phoneNumber');
  };

  return (
    <DeliveryDetailsContext.Provider
      value={{
        deliverySlot,
        setDeliverySlot,
        unitNumber,
        setUnitNumber,
        deliveryDate,
        setDeliveryDate,
        clearDeliveryDetails,
        phoneNumber,
        setPhoneNumber
      }}>
      {children}
    </DeliveryDetailsContext.Provider>
  );
}
