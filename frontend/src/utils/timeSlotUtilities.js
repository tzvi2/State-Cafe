export function filterTimeSlots(timeSlots) {

  const parsedTimeSlots = timeSlots.map(slot => ({
    ...slot,
    dateObj: new Date(slot.time)
  }));

  parsedTimeSlots.sort((a, b) => a.dateObj - b.dateObj);

  let filteredSlots = [];
  let lastAddedTime = null;

  for (const slot of parsedTimeSlots) {
    if (!lastAddedTime) {
      // Add the first slot
      filteredSlots.push({time: slot.time, displayTime: slot.displayTime});
      lastAddedTime = slot.dateObj;
    } else {
      const diffMinutes = (slot.dateObj - lastAddedTime) / (1000 * 60);

      // If difference is at least five minutes, add to return list
      if (diffMinutes >= 5) {
        filteredSlots.push({time: slot.time, displayTime: slot.displayTime});
        lastAddedTime = slot.dateObj; 
      }
    }
  }

  return filteredSlots;
}

