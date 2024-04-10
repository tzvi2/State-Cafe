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

  const [phoneNumber, setPhoneNumber] = useState(null)

  useEffect(() => {
    localStorage.setItem('unitNumber', unitNumber);
  }, [unitNumber]);

  useEffect(() => {
    localStorage.setItem('deliverySlot', JSON.stringify(deliverySlot));
  }, [deliverySlot]);

  useEffect(() => {
    localStorage.setItem('deliveryDate', deliveryDate);
  }, [deliveryDate]);

  const clearDeliveryDetails = () => {
    setDeliverySlot("")
    setUnitNumber("")
    setDeliveryDate("")
    localStorage.removeItem('deliverySlot')
    localStorage.removeItem('unitNumber')
    localStorage.removeItem('deliveryDate')
  }

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
