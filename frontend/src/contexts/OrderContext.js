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
				// Fetch ordering window
				const window = await getOrderingWindow(deliveryDate);
				setOrderingWindow(window);

				// Fetch stock and slots
				const stockData = await getStockForDate(deliveryDate);
				const isStockAvailable = Object.values(stockData).some((item) => item.quantity > 0);
				setStockAvailable(isStockAvailable);
				//console.log("stock available ", isStockAvailable);

				const isSlotsAvailable = await dayHasAvailableSlots(deliveryDate);
				setSlotsAvailable(isSlotsAvailable);
				//console.log("slots available ", isSlotsAvailable);

				// Check current time and date against ordering window
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

				setInOrderingWindow(isInOrderingWindow);
				if (!window.length === 0) {
					console.log(`currently in ordering window for date ${deliveryDate}: ${isInOrderingWindow}. The ordering window is ${window[0].date} from ${window[0].start} to ${window[0].end}`);
				} else {
					console.log(`no ordering window set for ${deliveryDate}`)
				}

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
