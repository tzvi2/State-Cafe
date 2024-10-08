const {db, admin} = require('../../../firebase/firebaseAdminConfig')
const { addMinutes, isSameMinute, parse, format } = require('date-fns');
const { toDate, fromZonedTime, toZonedTime, formatInTimeZone, getTimezoneOffset } = require('date-fns-tz');
const moment = require("moment-timezone")

const timeZone = 'America/New_York';

const does_today_have_more_open_hours = async (req, res) => {
  try {
    const currentDate = moment().tz(timeZone).format('YYYY-MM-DD');
    const currentTime = moment().tz(timeZone).toDate();

    const docRef = db.collection('time_slots').doc(currentDate);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ available: false });
    }

    const slots = doc.data().slots || [];
    
    for (const slot of slots) {
      const slotTime = slot.time.toDate();
      if (slotTime > currentTime && slot.isAvailable) {
        return res.status(200).json({ available: true });
      }
    }

    return res.status(200).json({ available: false });
  } catch (error) {
    console.error('Error checking open hours:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handleGetOpenHours = async (req, res) => {
  const { date } = req.query;
  const timeZone = 'America/New_York';

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
      if (!currentSlot.time || !currentSlot.time.toDate) {
        continue; // Skip if the slot is not properly structured
      }
      const currentSlotTime = toZonedTime(currentSlot.time.toDate(), timeZone);

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

    // Generate time slots for the given range
    const newSlots = generateTimeSlots(date, startTime, endTime);

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

function generateTimeSlots(dateString, startTime, endTime, timeZone = 'America/New_York') {
  let slots = [];

  console.log("dateString: ", dateString, 'startTime: ', startTime, "endTime: ", endTime);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  // Combine date and time and convert to the desired time zone
  const startDateTime = `${dateString}T${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`;
  const endDateTime = `${dateString}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`;

  const startDate = fromZonedTime(new Date(startDateTime), timeZone);
  const endDate = fromZonedTime(new Date(endDateTime), timeZone);

  console.log("start date: ", startDate, "end date: ", endDate);

  for (let time = new Date(startDate); time <= endDate; time.setMinutes(time.getMinutes() + 1)) {
    slots.push({
      time: admin.firestore.Timestamp.fromDate(new Date(time)),
      isAvailable: true
    });
  }

  return slots;
}

const handleRemoveTimeslot = async (req, res) => {
  const { date, startHour, endHour } = req.body;
  const timeZone = 'America/New_York';
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

    const startTimeStr = `${date} ${startHour}`;
    const endTimeStr = `${date} ${endHour}`;

    // Convert the combined date-time string to the desired time zone
    const startDate = fromZonedTime(new Date(startTimeStr), timeZone);
    const endDate = fromZonedTime(new Date(endTimeStr), timeZone);

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Invalid start or end time format' });
    }

    console.log('startDate:', startDate.toISOString(), 'endDate:', endDate.toISOString());

    const existingSlots = doc.data().slots;
    const slotsToRemove = [];

    for (let time = new Date(startDate); time <= endDate; time.setMinutes(time.getMinutes() + 1)) {
      slotsToRemove.push(admin.firestore.Timestamp.fromDate(new Date(time)));
    }

    const updatedSlots = existingSlots.filter(slot => {
      const slotTime = slot.time.toDate().getTime();
      return !slotsToRemove.some(toRemove => toRemove.toDate().getTime() === slotTime);
    });

    await docRef.set({ slots: updatedSlots }, { merge: true });
    res.json({ message: 'Time slot removed successfully.' });
  } catch (error) {
    console.error('Error removing time slot:', error);
    res.status(500).send('Failed to remove time slot.');
  }
};

function getCurrentTimeInEST() {
  const timeZone = 'America/New_York';
  return moment.tz(timeZone).toISOString();
}

const get_available_delivery_slots_for_order = async (req, res) => {
  // return timeslots as array of ISO strings 
  try {
    const { date, totalCookTime } = req.query;
    console.log('date: ', date, "total cook time in minutes: ", parseInt(totalCookTime, 10) / 60);

    if (!date || !totalCookTime) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const cookTimeInMinutes = parseInt(totalCookTime, 10) / 60;
    const deliveryTimeInMinutes = 5;
    const requiredTimeInMinutes = cookTimeInMinutes + deliveryTimeInMinutes;

    const docRef = db.collection('time_slots').doc(date);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.json({ availableTimeSlots: [] });
    }

    // Get current time adjusted to EST/EDT
    const current_time = getCurrentTimeInEST();
    console.log('current time: ', current_time);

    const currentTimeDate = new Date(current_time)
    console.log('current time date: ', currentTimeDate)

    const dateWithBufferAdded = new Date(currentTimeDate.getTime() + requiredTimeInMinutes * 60000).toISOString()
    console.log('date with buffer added: ', dateWithBufferAdded)
    
    const slots = doc.data().slots || [];
    const availableTimeSlots = [];

    // Filter out slot objects whose time is before buffer
    const availableSlotsAfterBuffer = slots.filter(slot => {
      const slotTime = slot.time.toDate().toISOString();
      return slotTime > dateWithBufferAdded && slot.isAvailable;
    });

    console.log("number of available slots after buffer: ", availableSlotsAfterBuffer.length)

    // at this point, slots is an array of objects like in firestore (time: timestamp, isAvailable: bool)

    // check for consecutive available slots
    for (const slot of availableSlotsAfterBuffer) {
      const slotTime = slot.time.toDate();
      const startRequiredTime = new Date(slotTime.getTime() - requiredTimeInMinutes * 60 * 1000);
      let allSlotsAvailable = true;

      for (let i = startRequiredTime; i < slotTime; i = new Date(i.getTime() + 60 * 1000)) {
        const matchingSlot = slots.find(s => s.time.toDate().getTime() === i.getTime());
        if (!matchingSlot || !matchingSlot.isAvailable) {
          allSlotsAvailable = false;
          break;
        }
      }

      if (allSlotsAvailable) {
        availableTimeSlots.push(slotTime.toISOString());
      }
    }

    //console.log("Final available time slots: ", availableTimeSlots);
    res.json({ availableTimeSlots });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const convertESTDateAndTimeToUTC = (dateString, timeString) => {
  const timeZone = 'America/New_York';

  // Combine date and time into a single string
  const dateTimeString = `${dateString} ${timeString}`;

  // Parse the combined string into a Date object assuming it's in the EST timezone
  const parsedDate = parse(dateTimeString, 'yyyy-MM-dd HH:mm', new Date());

  if (isNaN(parsedDate)) {
    console.error('Error parsing date:', dateTimeString);
    return new Date('Invalid Date');
  }

  // Convert the parsed date to a UTC Date object
  const utcDate = fromZonedTime(parsedDate, timeZone);

  return utcDate;
};

async function bookSlots(date, startTime, endTime) {
  //console.log("start: ", startTime, "end: ", endTime);

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
  const { totalCookTime, date, time } = req.body; 

  // total cook time in seconds, date "MM-DD-YYYY" time "HH:MM"

  console.log('total cook time: ', totalCookTime, "date: ", date, "time: ", time);

  const deliveryBuffer = 5; // 5 minutes for delivery buffer

  try {
    // End date as UTC date object from given date string plus time in EST
    const endDate = convertESTDateAndTimeToUTC(date, time);

    // Start date as UTC date object from buffer + totalCookTime minutes before endDate
    const startDate = new Date(endDate.getTime() - (totalCookTime * 1000) - (deliveryBuffer * 60 * 1000));

    console.log("startDate: ", startDate, "endDate: ", endDate);

    // Book the slots
    await bookSlots(date, startDate, endDate);

    res.json({ message: "Time slots booked successfully." });
  } catch (error) {
    console.error("Error booking time slots:", error);
    res.status(500).send("Failed to book time slots.");
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
	get_available_delivery_slots_for_order,
	handleBookTimeslot,
	handleGetOpenHours,
	handleAddTimeslot,
	handleRemoveTimeslot,
	handleUpdateTimeslot,
  does_today_have_more_open_hours
}