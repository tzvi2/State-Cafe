import React, { createContext, useContext, useState, useEffect } from 'react';
import { dayHasAvailableSlots, getOrderingWindow } from '../api/timeslotRequests';
import { getStockForDate } from '../api/stockRequests';
import { getESTDate, formatDateToYYYYMMDD, getESTDateString } from '../utils/dateUtilities';
import { useDeliveryDetails } from '../hooks/useDeliveryDetails';

const OrderContext = createContext();

export const useOrderContext = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
	const { deliveryDate, setDeliveryDate } = useDeliveryDetails();
	const [acceptingOrders, setAcceptingOrders] = useState(true);
	const [stockAvailable, setStockAvailable] = useState(false);
	const [slotsAvailable, setSlotsAvailable] = useState(false);
	const [inOrderingWindow, setInOrderingWindow] = useState(false);
	const [orderingWindow, setOrderingWindow] = useState(null);

	useEffect(() => {
		if (!deliveryDate) {
			const todayFormatted = formatDateToYYYYMMDD(getESTDate());
			setDeliveryDate(todayFormatted);
			return;
		}

		const checkAcceptingOrders = async () => {
			try {
				// Fetch ordering window status
				const isInOrderingWindow = await checkInOrderingWindow();

				// Fetch stock and slots
				const stockData = await getStockForDate(deliveryDate);
				const isStockAvailable = Object.values(stockData).some((item) => item.quantity > 0);
				setStockAvailable(isStockAvailable);

				const isSlotsAvailable = await dayHasAvailableSlots(deliveryDate);
				setSlotsAvailable(isSlotsAvailable);

				setInOrderingWindow(isInOrderingWindow);

				// Update general acceptance status
				setAcceptingOrders(isStockAvailable && isSlotsAvailable && isInOrderingWindow);
			} catch (error) {
				console.error("Error checking acceptance of orders:", error);
				setStockAvailable(false);
				setSlotsAvailable(false);
				setInOrderingWindow(false);
				setAcceptingOrders(false);
			}
		};


		checkAcceptingOrders();
	}, [deliveryDate]);

	const checkInOrderingWindow = async () => {
		const window = await getOrderingWindow(deliveryDate);
		console.log('window ', window)
		const nowEST = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
		const currentTime = new Date(nowEST);
		const nowTimeString = currentTime.toTimeString().split(" ")[0].substring(0, 5);
		const todayDateString = getESTDateString();

		const isInOrderingWindow = window.some(({ start, end, date }) => {
			// Compare date and time
			return (
				todayDateString === date &&
				nowTimeString >= start &&
				nowTimeString <= end
			);
		});
		return isInOrderingWindow
	}

	return (
		<OrderContext.Provider
			value={{
				acceptingOrders,
				stockAvailable,
				slotsAvailable,
				inOrderingWindow,
				orderingWindow,
				checkInOrderingWindow
			}}
		>
			{children}
		</OrderContext.Provider>
	);
};
