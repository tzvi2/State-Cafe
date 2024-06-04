const {db, admin} = require('../../../firebase/firebaseAdminConfig')
const { addMinutes, isSameMinute } = require('date-fns');
const { format, toDate, fromZonedTime, toZonedTime } = require('date-fns-tz');

const timeZone = 'America/New_York'; // Define your desired time zone here

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
      start: format(range.start, 'hh:mm aa', { timeZone }),
      end: format(range.end, 'hh:mm aa', { timeZone })
    }));

    return res.status(200).json(formattedRanges);
  } catch (error) {
    console.error('Error fetching open hours:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

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

    const newSlots = generateTimeSlots(dateObj, startTime, endTime, timeZone);

    if (!doc.exists) {
      await docRef.set({ slots: newSlots });
      console.log(`Created new document and added slots for ${dateId}`);
    } else {
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

function generateTimeSlots(date, startTime, endTime, timeZone) {
  let slots = [];

  const startDate = fromZonedTime(parseTime(date, startTime), timeZone);
  const endDate = fromZonedTime(parseTime(date, endTime), timeZone);

  for (let time = new Date(startDate); time <= endDate; time.setMinutes(time.getMinutes() + 1)) {
    slots.push({
      time: admin.firestore.Timestamp.fromDate(new Date(time)),
      isAvailable: true
    });
  }

  return slots;
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

const handleRemoveTimeslot = async (req, res) => {
  const { date, startHour, endHour } = req.body;
  console.log('Attempting to remove time slot for date:', date, 'start:', startHour, 'end:', endHour);

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const dateId = dateObj.toISOString().split('T')[0];
    const docRef = db.collection('time_slots').doc(dateId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'No time slots found for this date' });
    }

    const startDate = fromZonedTime(parseTime(date, startHour), timeZone);
    const endDate = fromZonedTime(parseTime(date, endHour), timeZone);

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Invalid start or end time format' });
    }

    console.log('startDate:', startDate, 'endDate:', endDate);

    const existingSlots = doc.data().slots;
    const slotsToRemove = [];

    for (let time = new Date(startDate); time <= endDate; time.setMinutes(time.getMinutes() + 1)) {
      slotsToRemove.push(admin.firestore.Timestamp.fromDate(new Date(time)));
    }

    console.log('slotsToRemove:', slotsToRemove);

    const updatedSlots = existingSlots.filter(slot => {
      const slotTime = slot.time.toDate().getTime();
      return !slotsToRemove.some(toRemove => toRemove.toDate().getTime() === slotTime);
    });

    console.log('updatedSlots:', updatedSlots);

    await docRef.set({ slots: updatedSlots }, { merge: true });
    res.json({ message: 'Time slot removed successfully.' });
  } catch (error) {
    console.error('Error removing time slot:', error);
    res.status(500).send('Failed to remove time slot.');
  }
};

const handle_get_available_timeslots = async (req, res) => {
  try {
    const date = req.query.date;
    console.log('Received date:', date);

    if (!date) {
      return res.status(400).json({ error: 'Date query parameter is required.' });
    }

    const totalCookTimeInSeconds = parseInt(req.query.totalCookTime, 10);
    console.log('Total cook time in seconds:', totalCookTimeInSeconds);

    const deliveryTimeInMinutes = 5;
    const totalOrderExecutionTimeInMinutes = Math.ceil(totalCookTimeInSeconds / 60) + deliveryTimeInMinutes;
    console.log('Total order execution time in minutes:', totalOrderExecutionTimeInMinutes);

    let now = new Date();
    console.log('Current time (UTC):', now);

    const localNow = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    console.log('Current time (Local):', localNow);

    const docRef = db.collection('time_slots').doc(date);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Daily slots document not found.' });
    }

    const slots = doc.data().slots.map(slot => {
      const utcTime = slot.time.toDate();
      const localTime = new Date(utcTime.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      return {
        ...slot,
        time: localTime
      };
    });

   

    //console.log('Slots:', slots);

    const availableTimeSlots = [];

    for (let i = 0; i < slots.length; i++) {
      //console.log(`Checking slot ${i} at ${slots[i].time}`);
      if (slots[i].isAvailable && slots[i].time >= now) {
        let sequenceEndIndex = i + totalOrderExecutionTimeInMinutes - 1;
        if (sequenceEndIndex < slots.length) {
          let allFollowingSlotsAvailable = true;
          for (let j = 1; j < totalOrderExecutionTimeInMinutes; j++) {
            //console.log(`Checking sequence slot ${i + j} at ${slots[i + j].time}`);
            if (!slots[i + j].isAvailable || slots[i + j].time - slots[i].time < j * 60000) {
              allFollowingSlotsAvailable = false;
              break;
            }
          }
          if (allFollowingSlotsAvailable) {
            availableTimeSlots.push(slots[sequenceEndIndex].time.toISOString());
          }
        }
      }
    }

    //console.log('Available time slots:', availableTimeSlots);
    res.json({ availableTimeSlots: availableTimeSlots });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ error: error.message });
  }
};


async function bookSlots(date, startTime, endTime) {
  // Everything between start and end times (inclusive) should be marked false for the isAvailable property.
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
  // TIMELINE
  // 5 minutes before delivery slot | delivery minute | two minutes to get home
  // (handle_get_available_timeslots only shows slots for delivery after accounting for five minute pack and delivery)
  // In this function, I want to set start and end times as follows:
  // start time: five minutes before the minute time slot that the customer selected for delivery
  // end time: block off two minutes after the delivery slot to allow the order deliverer to return to the cafe, so end time should be 2 minutes after the delivery slot
  const { totalCookTime, date, time } = req.body; // Assuming the time is provided in a compatible format
  const returnBuffer = 2; // 2 minutes to get back to the café
  const preDeliveryBuffer = 5; // 5 minutes before the delivery slot

  console.log('date: ', date, "time: ", time);

  try {
    // Calculate start and end times
    const deliveryTime = new Date(`${date}T${time}`);
    const startTime = new Date(deliveryTime.getTime() - preDeliveryBuffer * 60000);
    const endTime = new Date(deliveryTime.getTime() + returnBuffer * 60000);

    console.log('startTime: ', startTime.toLocaleTimeString(), "endTime: ", endTime.toLocaleTimeString());
    
    // Book the slots
    await bookSlots(date, startTime, endTime);

    res.send({message: "Time slots booked successfully."});
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