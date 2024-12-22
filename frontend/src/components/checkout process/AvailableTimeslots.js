import React, { useEffect, useState } from 'react'
import styles from '../styles/checkout process styles/DeliveryPage.module.css';
import { useCart } from '../../hooks/useCart';
import { useDeliveryDetails } from '../../hooks/useDeliveryDetails';
import apiUrl from '../../config';

function AvailableTimeslots({ onSlotChange, showError }) {
	const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
	const [deliveryAvailable, setDeliveryAvailable] = useState(true);
	const { cart } = useCart();
	const { setDeliverySlot, deliverySlot, deliveryDate } = useDeliveryDetails();

	useEffect(() => {
		const fetchTimeSlots = async () => {
			if (!deliveryDate || cart.totalCookTime <= 0) {
				setAvailableTimeSlots([]);
				setDeliveryAvailable(false);
				return;
			}

			const formattedDate = new Date(deliveryDate).toISOString().split("T")[0];
			const url = `${apiUrl}/hours/${formattedDate}/available-slots?timeToCook=${cart.totalCookTime}`;
			console.log(`Fetching time slots from: ${url}, total cook time: ${cart.totalCookTime}`);

			try {
				const response = await fetch(url);
				if (!response.ok) throw new Error("Failed to fetch available delivery slots");

				const { available_slots: slots } = await response.json();
				const formattedSlots = slots.map((slot, index) => ({
					time: slot,
					displayTime: index === 0
						? `Earliest (${new Intl.DateTimeFormat([], {
							hour: "numeric",
							minute: "2-digit",
							hour12: true,
							timeZone: "UTC",
						}).format(new Date(`1970-01-01T${slot}:00Z`))})`
						: new Intl.DateTimeFormat([], {
							hour: "numeric",
							minute: "2-digit",
							hour12: true,
							timeZone: "UTC",
						}).format(new Date(`1970-01-01T${slot}:00Z`)),
				}));

				setAvailableTimeSlots(formattedSlots);
				setDeliveryAvailable(formattedSlots.length > 0);

				if (formattedSlots.length > 0) {
					const soonestSlot = formattedSlots[0].time;
					setDeliverySlot(soonestSlot); // Automatically select the soonest slot
					onSlotChange?.(soonestSlot); // Notify parent component
				}
			} catch (error) {
				console.error("Error fetching time slots:", error);
				setAvailableTimeSlots([]);
				setDeliveryAvailable(false);
			}
		};

		fetchTimeSlots();
	}, [deliveryDate, cart.totalCookTime]);


	const handleSlotSelection = (e) => {
		const newSlot = e.target.value;
		setDeliverySlot(newSlot);
		onSlotChange?.(newSlot); // Notify parent about the change
	};

	return (
		<>
			{deliveryDate && (
				<>
					{deliveryAvailable ? (
						<>
							{showError && (
								<p className={styles.slotError}>
									Your selected delivery time is no longer available. Please select a new delivery time.
								</p>
							)}
							<select
								className={styles.wideBtn}
								value={deliverySlot}
								onChange={handleSlotSelection}
							>
								<option value="">Select a delivery time</option>
								{availableTimeSlots.map((slot) => (
									<option
										key={slot.time}
										value={slot.time}
										className={slot.displayTime.endsWith('AM') ? styles.morningHours : styles.eveningHours}
									>
										{slot.displayTime}
									</option>
								))}
							</select>
						</>
					) : (
						<div style={{ textAlign: 'center' }}>No delivery slots available for the selected date</div>
					)}
				</>
			)}
		</>
	);
}


export default AvailableTimeslots