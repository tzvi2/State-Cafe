import { format } from 'date-fns';
import { db } from '../firebaseConfig';
import apiUrl from '../config';

export const availableSlotsRemain = async () => {
  try {
    const response = await fetch(`${apiUrl}/timeslots/available-slots-remain`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error('Error checking open hours:', error);
    return false; // Or handle the error appropriately
  }
};

export const bookTimeSlot = async ({ totalCookTime, date, time }) => {
  const formattedTime = new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  //console.log("Booking time slot, totalCookTime", totalCookTime, "date", date, "formatted time: ", formattedTime)
	
	try {
			const response = await fetch(`${apiUrl}/timeslots/book-timeslot`, {
					method: 'POST',
					headers: {
							'Content-Type': 'application/json',
					},
					body: JSON.stringify({
							totalCookTime, // total cook time in minutes
							date, // selected date in 'YYYY-MM-DD' format
							time: formattedTime, // selected time slot in 'HH:MM' format
					}),
			});

			if (!response.ok) {
					throw new Error('Network response was not ok');
			}

			const data = await response.json();
			return data; 
	} catch (error) {
			console.error('There was a problem with the fetch operation:', error);
			throw error; 
	}
};

export const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOpenHours = async (date) => {
  try {
    const response = await fetch(`${apiUrl}/timeslots/open-hours?date=${date}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
};

export const addTimeSlot = async (date, startTime, endTime) => {
  console.log("sending new range to backend ", date, startTime, endTime)
  try {
    const response = await fetch(`${apiUrl}/timeslots/add-time-slot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, startTime, endTime })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding time slot:', error);
    throw error;
  }
};

export const removeTimeSlot = async (date, startHour, endHour) => {
  console.log('removing timeslot ', date, startHour, endHour)
 
  try {
    const response = await fetch(`${apiUrl}/timeslots/remove-time-slot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, startHour, endHour })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing time slot:', error);
    throw error;
  }
};

