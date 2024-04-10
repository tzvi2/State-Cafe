import React, { createContext, useState, useContext, useEffect } from 'react';

const DeliveryDetailsContext = createContext();

export const useDeliveryDetails = () => useContext(DeliveryDetailsContext);

export default function DeliverySlotProvider({ children }) {
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
    return savedDate || "";
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
    console.log('number', phoneNumber)
  }, [phoneNumber])

  useEffect(() => {
    localStorage.setItem('deliverySlot', JSON.stringify(deliverySlot));
  }, [deliverySlot]);

  useEffect(() => {
    localStorage.setItem('deliveryDate', deliveryDate);
  }, [deliveryDate]);

  const clearDeliveryDetails = () => {
    setDeliverySlot("");
    setUnitNumber("");
    setDeliveryDate("");
    setPhoneNumber(""); // Clear phone number as well
    localStorage.removeItem('deliverySlot');
    localStorage.removeItem('unitNumber');
    localStorage.removeItem('deliveryDate');
    localStorage.removeItem('phoneNumber'); // Don't forget to clear from localStorage
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
