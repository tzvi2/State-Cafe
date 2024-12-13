import React, { createContext, useContext, useState, useEffect } from 'react';
import { dayHasAvailableSlots, getOrderingWindow } from '../api/timeslotRequests';
import { getStockForDate } from '../api/stockRequests';
import { getESTDate, formatDateToYYYYMMDD } from '../utils/dateUtilities'; // Ensure correct import
import { useDeliveryDetails } from '../hooks/useDeliveryDetails';

const OrderContext = createContext();

export const useOrderContext = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
	const { deliveryDate, setDeliveryDate } = useDeliveryDetails();
	const [acceptingOrders, setAcceptingOrders] = useState(true);

	useEffect(() => {
		// Set a default delivery date if not already set
		if (!deliveryDate) {
			const todayFormatted = formatDateToYYYYMMDD(getESTDate());
			console.log('Setting default delivery date:', todayFormatted);
			setDeliveryDate(todayFormatted); // Set default delivery date
			return; // Exit early until deliveryDate is updated
		}

		const checkAcceptingOrders = async () => {
			console.log('Determining acceptance of orders...');
			try {
				const stockData = await getStockForDate(deliveryDate);
				const stockAvailable = Object.values(stockData).some(item => item.quantity > 0);
				console.log('Stock available:', stockAvailable);

				const slotsAvailable = await dayHasAvailableSlots(deliveryDate);
				console.log('Slots available:', slotsAvailable);

				const orderingWindow = await getOrderingWindow(deliveryDate);
				console.log('ordering window:', orderingWindow);

				// Get the current time in EST in HH:mm format
				const nowEST = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
				const currentTime = new Date(nowEST);
				const nowTimeString = currentTime.toTimeString().split(' ')[0].substring(0, 5); // "HH:mm"

				console.log('Current EST time:', nowTimeString);

				// Check if the current time is within any ordering window
				const withinOrderingWindow = orderingWindow.some(({ start, end }) => {
					return nowTimeString >= start && nowTimeString <= end;
				});

				console.log('Within ordering window:', withinOrderingWindow);

				setAcceptingOrders(stockAvailable && slotsAvailable && withinOrderingWindow);
			} catch (error) {
				console.error('Error checking acceptance of orders:', error);
				setAcceptingOrders(false);
			}
		};



		checkAcceptingOrders();
	}, [deliveryDate]); // Only depend on deliveryDate

	return (
		<OrderContext.Provider value={{ acceptingOrders }}>
			{children}
		</OrderContext.Provider>
	);
};
