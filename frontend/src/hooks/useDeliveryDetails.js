import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { getESTDate, formatDateToYYYYMMDD } from '../../src/utils/dateUtilities';

const DeliveryDetailsContext = createContext();

export const useDeliveryDetails = () => useContext(DeliveryDetailsContext);

export default function DeliverySlotProvider({ children }) {
  const todayEST = useMemo(() => getESTDate(), []);
  const todayFormatted = useMemo(() => formatDateToYYYYMMDD(todayEST), [todayEST]);

  const savedDate = sessionStorage.getItem('deliveryDate');
  const initialDeliveryDate = useMemo(() => {
    if (!savedDate) return todayFormatted;
    if (new Date(savedDate) < new Date(todayFormatted)) return todayFormatted;
    return savedDate;
  }, [savedDate, todayFormatted]);

  const [deliveryDate, setDeliveryDate] = useState(initialDeliveryDate);
  const [deliverySlot, setDeliverySlot] = useState(() => sessionStorage.getItem('deliverySlot') || "");
  const [unitNumber, setUnitNumber] = useState(() => sessionStorage.getItem('unitNumber') || "");
  const [phoneNumber, setPhoneNumber] = useState(() => sessionStorage.getItem('phoneNumber') || "");
  const [buildingName, setBuildingName] = useState(() => sessionStorage.getItem('buildingName') || "");

  useEffect(() => {
    sessionStorage.setItem('deliveryDate', deliveryDate);
  }, [deliveryDate]);

  useEffect(() => {
    sessionStorage.setItem('deliverySlot', deliverySlot);
  }, [deliverySlot]);

  useEffect(() => {
    sessionStorage.setItem('unitNumber', unitNumber);
  }, [unitNumber]);

  useEffect(() => {
    sessionStorage.setItem('phoneNumber', phoneNumber);
  }, [phoneNumber]);

  useEffect(() => {
    sessionStorage.setItem('buildingName', buildingName);
  }, [buildingName]);

  const clearDeliveryDetails = () => {
    setDeliverySlot("");
    setUnitNumber("");
    setDeliveryDate(todayFormatted);
    setPhoneNumber("");
    setBuildingName(""); // Clear building name
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
        buildingName,
        setBuildingName,
        clearDeliveryDetails,
      }}>
      {children}
    </DeliveryDetailsContext.Provider>
  );
}
