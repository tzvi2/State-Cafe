const populateTwoDays = async (req, res) => {
  try {
    const today = new Date();
    await populateSlotsForDate(today); 

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    await populateSlotsForDate(tomorrow); 

    res.json({ message: 'Successfully populated slots for today and tomorrow.' });
  } catch (error) {
    console.error('Error populating slots:', error);
    res.status(500).send('Failed to populate slots.');
  }
};

async function populateThisWeeksTimeSlots() {
  const today = new Date();
  const endDayOfWeek = 4; // Thursday, assuming Sunday is 0, Monday is 1, etc.
  let datesToPopulate = [];

  // Calculate dates from today through Thursday
  for (let d = today; d.getDay() <= endDayOfWeek; d.setDate(d.getDate() + 1)) {
      datesToPopulate.push(new Date(d));
  }

  // Iterate over each date and populate slots
  for (let date of datesToPopulate) {
      await populateSlotsForDate(date);
  }
}

async function populateSlotsForDate(date) {
  const dateId = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
  const docRef = db.collection('time_slots').doc(dateId);
  const doc = await docRef.get();

  if (!doc.exists) {
      const slots = generateTimeSlots(date); 
      await docRef.set({ slots });
      console.log(`Populated slots for ${dateId}`);
  } else {
      console.log(`Slots for ${dateId} already exist.`);
  }
}

function generateTimeSlots(date) {
  let slots = [];
  const hours = [
      { start: 7, end: 9 }, // Morning hours from 7 AM to 9 AM
      { start: 18, end: 20 } // Evening hours from 6 PM to 8 PM
  ];

  hours.forEach((period) => {
      for (let hour = period.start; hour < period.end; hour++) {
          for (let minute = 0; minute < 60; minute++) { 
              const time = new Date(date);
              time.setHours(hour, minute, 0, 0); 
              slots.push({
                  time: admin.firestore.Timestamp.fromDate(time),
                  isAvailable: true
              });
          }
      }
  });

  return slots;
}

module.exports = {
	populateTwoDays,
	populateThisWeeksTimeSlots
}