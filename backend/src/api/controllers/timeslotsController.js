const {db, admin} = require('../../../firebase/firebaseAdminConfig')
const { format, parseISO, addMinutes, isSameMinute } = require('date-fns');
const dateFnsTz = require('date-fns-tz');
const toZonedTime = dateFnsTz.toZonedTime;
const formatTz = dateFnsTz.format;

const handleGetOpenHours = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    const docRef = db.collection('time_slots').doc(date);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'No open hours found for this date' });
    }

    const slots = doc.data().slots;

    if (!slots || slots.length === 0) {
      return res.status(200).json([]);
    }

    const timeZone = 'America/New_York'; // Set your desired time zone here
    const openRanges = [];
    let start = null;

    for (let i = 0; i < slots.length; i++) {
      const currentSlot = slots[i];
      if (!currentSlot.time || !currentSlot.time.toDate || !currentSlot.isAvailable) {
        continue; // Skip if the slot is not properly structured or not available
      }
      const currentSlotTime = toZonedTime(currentSlot.time.toDate(), timeZone);

      if (currentSlot.isAvailable) {
        if (!start) {
          start = currentSlotTime;
        }

        const nextSlot = slots[i + 1];
        if (!nextSlot || !nextSlot.time || !nextSlot.time.toDate || !isSameMinute(currentSlotTime, addMinutes(toZonedTime(nextSlot.time.toDate(), timeZone), -1))) {
          openRanges.push({
            start: start,
            end: currentSlotTime
          });
          start = null;
        }
      }
    }

    // Format the ranges to the desired time format
    const formattedRanges = openRanges.map(range => ({
      start: formatTz(range.start, 'yyyy-MM-dd\'T\'HH:mm:ssXXX', { timeZone }),
      end: formatTz(range.end, 'yyyy-MM-dd\'T\'HH:mm:ssXXX', { timeZone })
    }));

    return res.status(200).json(formattedRanges);
  } catch (error) {
    console.error('Error fetching open hours:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

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

async function populateSlotsForDate(date, startHour, endHour) {
  const dateId = date.toISOString().split('T')[0];
  const docRef = db.collection('time_slots').doc(dateId);
  const doc = await docRef.get();

  if (!doc.exists) {
    const slots = generateTimeSlots(date, startHour, endHour);
    await docRef.set({ slots });
    console.log(`Populated slots for ${dateId}`);
  } else {
    console.log(`Slots for ${dateId} already exist.`);
  }
}

function parseTime(date, timeString) {
  const [time, modifier] = timeString.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
    return null;
  }

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  const parsedDate = new Date(date);
  parsedDate.setHours(hours, minutes, 0, 0);
  return parsedDate;
}


const handleAddTimeslot = async (req, res) => {
  const { date, startTime, endTime } = req.body;
  console.log('Adding time slot for date:', date, 'start:', startTime, 'end:', endTime);

  try {
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, start time, and end time are required' });
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const dateId = dateObj.toISOString().split('T')[0];
    const docRef = db.collection('time_slots').doc(dateId);
    const doc = await docRef.get();

    // Generate time slots for the given range
    const newSlots = generateTimeSlots(dateObj, startTime, endTime);

    if (!doc.exists) {
      // If document does not exist, create it with the new slots
      await docRef.set({ slots: newSlots });
      console.log(`Created new document and added slots for ${dateId}`);
    } else {
      // If document exists, add the new slots to the existing ones
      await docRef.set({
        slots: admin.firestore.FieldValue.arrayUnion(...newSlots)
      }, { merge: true });
      console.log(`Added new slots to existing document for ${dateId}`);
    }

    res.json({ message: 'Time slot added successfully.' });
  } catch (error) {
    console.error('Error adding time slot:', error);
    res.status(500).send('Failed to add time slot.');
  }
};

// Ensure generateTimeSlots correctly handles both startTime and endTime
function generateTimeSlots(date, startTime, endTime) {
  let slots = [];
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startDate = new Date(date);
  startDate.setHours(startHour, startMinute, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(endHour, endMinute, 0, 0);

  for (let time = startDate; time <= endDate; time.setMinutes(time.getMinutes() + 1)) {
    slots.push({
      time: admin.firestore.Timestamp.fromDate(new Date(time)),
      isAvailable: true
    });
  }

  return slots;
}

const handleRemoveTimeslot = async (req, res) => {
  const { date, startHour, endHour } = req.body;
  console.log('Attempting to remove time slot for date:', date, 'start:', startHour, 'end:', endHour);

  try {
    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Convert date to Firestore document ID format (YYYY-MM-DD)
    const dateId = dateObj.toISOString().split('T')[0];
    const docRef = db.collection('time_slots').doc(dateId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'No time slots found for this date' });
    }

    // Parse start and end times to Date objects
    const startDate = parseTime(date, startHour);
    const endDate = parseTime(date, endHour);

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Invalid start or end time format' });
    }

    console.log('startDate:', startDate, 'endDate:', endDate);

    const existingSlots = doc.data().slots;
    const slotsToRemove = [];

    // Generate list of timestamps to be removed
    for (let time = new Date(startDate); time <= endDate; time.setMinutes(time.getMinutes() + 1)) {
      slotsToRemove.push(admin.firestore.Timestamp.fromDate(new Date(time)));
    }

    console.log('slotsToRemove:', slotsToRemove);

    // Filter out the slots to be removed
    const updatedSlots = existingSlots.filter(slot => {
      const slotTime = slot.time.toDate().getTime();
      return !slotsToRemove.some(toRemove => toRemove.toDate().getTime() === slotTime);
    });

    console.log('updatedSlots:', updatedSlots);

    // Update the Firestore document with the updated slots
    await docRef.set({ slots: updatedSlots }, { merge: true });
    res.json({ message: 'Time slot removed successfully.' });
  } catch (error) {
    console.error('Error removing time slot:', error);
    res.status(500).send('Failed to remove time slot.');
  }
};


const handleUpdateTimeslot = async (req, res) => {
  const { date, oldStartHour, oldEndHour, newStartHour, newEndHour } = req.body;

  try {
    await handleRemoveTimeslot({ body: { date, startHour: oldStartHour, endHour: oldEndHour } }, res);
    await handleAddTimeslot({ body: { date, startHour: newStartHour, endHour: newEndHour } }, res);
    res.json({ message: 'Time slot updated successfully.' });
  } catch (error) {
    console.error('Error updating time slot:', error);
    res.status(500).send('Failed to update time slot.');
  }
};

module.exports = {
	handle_get_available_timeslots,
	handleBookTimeslot,
	handleGetOpenHours,
	handleAddTimeslot,
	handleRemoveTimeslot,
	handleUpdateTimeslot
}