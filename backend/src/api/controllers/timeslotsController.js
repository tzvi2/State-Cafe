const {db} = require('../../../firebase/firebaseAdminConfig')

const admin = require('firebase-admin');

const handle_get_available_timeslots = async (req, res) => {
	// return an array of utc strings
	try {

			const date = req.query.date; // Expecting date in YYYY-MM-DD format
			console.log('date ', date)

			if (!date) {
					return res.status(400).json({ error: 'Date query parameter is required.' });
			}

			const totalCookTimeInSeconds = parseInt(req.query.totalCookTime, 10); // Cook time in seconds
			console.log('totalCookTimeInSeconds: ', totalCookTimeInSeconds)
			const deliveryTimeInMinutes = 6; // Fixed delivery time in minutes
			
			const totalOrderExecutionTimeInMinutes = Math.ceil(totalCookTimeInSeconds / 60) + deliveryTimeInMinutes;

			let now = new Date()
			console.log('now: ', now);

			console.log("totalOrderExecutionInMinutes: ", totalOrderExecutionTimeInMinutes)

			const docRef = db.collection('time_slots').doc(date);
			const doc = await docRef.get();

			if (!doc.exists) {
					return res.status(404).json({ error: 'Daily slots document not found.' });
			}

			const slots = doc.data().slots.map(slot => ({
					...slot,
					time: slot.time.toDate() // Convert timestamp to Date
			}));
			
			const availableTimeSlots = [];

			// Iterate through slots, checking for availability and sufficiency of consecutive slots
			for (let i = 0; i < slots.length; i++) {
					if (slots[i].isAvailable && slots[i].time >= now) {
							let sequenceEndIndex = i + totalOrderExecutionTimeInMinutes - 1;
							if (sequenceEndIndex < slots.length) {
									let allFollowingSlotsAvailable = true;
									for (let j = 1; j < totalOrderExecutionTimeInMinutes; j++) {
											if (!slots[i + j].isAvailable || slots[i + j].time - slots[i].time < j * 60000) {
													allFollowingSlotsAvailable = false;
													break;
											}
									}
									if (allFollowingSlotsAvailable) {
											// Add the ending slot's time as an available time slot
											availableTimeSlots.push(slots[sequenceEndIndex].time);
									}
							}
					}
			}
			console.log('availableTimeSlots: ', availableTimeSlots)

			res.json({ availableTimeSlots: availableTimeSlots });
	} catch (error) {
			console.error('Error fetching available time slots:', error);
			res.status(500).json({ error: error.message });
	}
};

async function bookSlots(date, startTime, endTime) {
	const dateId = date; // Assuming date is already in YYYY-MM-DD format
	const docRef = db.collection('time_slots').doc(dateId);
	const doc = await docRef.get();

	if (doc.exists) {
			let slots = doc.data().slots;
			let isUpdated = false;

			slots = slots.map(slot => {
					const slotTime = slot.time.toDate();
					if (slotTime >= startTime && slotTime <= endTime) {
							isUpdated = true;
							return { ...slot, isAvailable: false }; 
					}
					return slot;
			});

			// Update Firestore only if changes were made
			if (isUpdated) {
					await docRef.set({ slots });
			}
	} else {
			console.log(`No slots found for ${dateId}.`);
	}
}


const handleBookTimeslot = async (req, res) => {
	const { totalCookTime, date, time } = req.body; // Assuming the time is provided in a compatible format
	const deliveryBuffer = 5; // 5 minutes for delivery buffer

	try {
			// Calculate end time based on totalCookTime and deliveryBuffer
			const startTime = new Date(`${date}T${time}`);
			const endTime = new Date(startTime.getTime() + totalCookTime * 60000 + deliveryBuffer * 60000);

			// Book the slots
			await bookSlots(date, startTime, endTime);

			res.send("Time slots booked successfully.");
	} catch (error) {
			console.error("Error booking time slots:", error);
			res.status(500).send("Failed to book time slots.");
	}
};





module.exports = {
	handle_get_available_timeslots,
	handleBookTimeslot
}