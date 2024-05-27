const { db, admin } = require('../../../firebase/firebaseAdminConfig');

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

function generateTimeSlots(date, startHour, endHour) {
  let slots = [];
  
  function isEDT(date) {
    const march = new Date(date.getFullYear(), 2, 14);
    const november = new Date(date.getFullYear(), 10, 7);
    return date >= march && date < november;
  }

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute++) {
      const time = new Date(date);
      const offset = isEDT(time) ? 4 : 5;
      time.setUTCHours(hour + offset, minute, 0, 0);

      slots.push({
        time: admin.firestore.Timestamp.fromDate(time),
        isAvailable: true
      });
    }
  }

  return slots;
}

async function addTimeSlot(date, startHour, endHour) {
  const dateId = date.toISOString().split('T')[0];
  const docRef = db.collection('time_slots').doc(dateId);
  const newSlots = generateTimeSlots(date, startHour, endHour);

  await docRef.set({
    slots: admin.firestore.FieldValue.arrayUnion(...newSlots)
  }, { merge: true });
}

async function removeTimeSlot(date, startTime, endTime) {
  const dateId = date.toISOString().split('T')[0];
  const docRef = db.collection('time_slots').doc(dateId);
  const doc = await docRef.get();

  if (doc.exists) {
    const existingSlots = doc.data().slots;
    const updatedSlots = existingSlots.filter(slot => {
      const slotTime = slot.time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      return slotTime !== startTime && slotTime !== endTime;
    });

    await docRef.set({ slots: updatedSlots });
  }
}


module.exports = {
  populateSlotsForDate,
  generateTimeSlots,
  addTimeSlot,
  removeTimeSlot
};
