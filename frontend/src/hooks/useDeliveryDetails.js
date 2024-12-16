import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { getESTDate, formatDateToYYYYMMDD } from '../../src/utils/dateUtilities';

const DeliveryDetailsContext = createContext();

export const useDeliveryDetails = () => useContext(DeliveryDetailsContext);

export default function DeliverySlotProvider({ children }) {
  const todayEST = useMemo(() => getESTDate(), []);
  const todayFormatted = useMemo(() => formatDateToYYYYMMDD(todayEST), [todayEST]);

  // Retrieve data from sessionStorage or initialize defaults
  const savedDate = sessionStorage.getItem('deliveryDate');
  const initialDeliveryDate = useMemo(() => {
    if (!savedDate) return todayFormatted; // Default to today's date if no saved date exists
    if (new Date(savedDate) < new Date(todayFormatted)) return todayFormatted; // Reset to today if saved date is in the past
    return savedDate; // Use saved date if valid
  }, [savedDate, todayFormatted]);

  const [deliveryDate, setDeliveryDate] = useState(initialDeliveryDate);
  const [deliverySlot, setDeliverySlot] = useState(() => sessionStorage.getItem('deliverySlot') || "");
  const [unitNumber, setUnitNumber] = useState(() => sessionStorage.getItem('unitNumber') || "");
  const [phoneNumber, setPhoneNumber] = useState(() => sessionStorage.getItem('phoneNumber') || "");

  // Persist state in sessionStorage
  useEffect(() => {
    console.log('deliveryDate', deliveryDate)
    sessionStorage.setItem('deliveryDate', deliveryDate);
  }, [deliveryDate]);

  useEffect(() => {
    sessionStorage.setItem('deliverySlot', deliverySlot);
    //console.log('deliverySlot ', deliverySlot)
  }, [deliverySlot]);

  useEffect(() => {
    sessionStorage.setItem('unitNumber', unitNumber);
  }, [unitNumber]);

  useEffect(() => {
    sessionStorage.setItem('phoneNumber', phoneNumber);
  }, [phoneNumber]);

  const clearDeliveryDetails = () => {
    setDeliverySlot("");
    setUnitNumber("");
    setDeliveryDate(todayFormatted); // Reset to today when clearing
    setPhoneNumber("");
    sessionStorage.clear();
  };

  return (
    <DeliveryDetailsContext.Provider
      value={{
        deliveryDate,
        setDeliveryDate,
        deliverySlot,
        setDeliverySlot,
        unitNumber,
        setUnitNumber,
        phoneNumber,
        setPhoneNumber,
        clearDeliveryDetails,
      }}>
      {children}
    </DeliveryDetailsContext.Provider>
  );
}
