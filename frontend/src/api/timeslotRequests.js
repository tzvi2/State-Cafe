import apiUrl from '../config'; // Ensure this points to your API's base URL

// Check if available slots remain for the day
export const availableSlotsRemain = async () => {
  try {
    const response = await fetch(`${apiUrl}/hours/available-slots-remain`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error('Failed to check available slots');
    }
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error('Error checking available slots:', error);
    return false; // Default to false if an error occurs
  }
};

// Book a time slot for delivery
export const bookTimeSlot = async ({ totalCookTime, date, time }) => {
  console.log('Booking time slot:', { totalCookTime, date, time });

  try {
    const response = await fetch(`${apiUrl}/hours/${date}/book-slot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        time,
        timeToCook: totalCookTime,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error('Failed to book time slot');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error booking time slot:', error);
    throw error;
  }
};

// Fetch open hours for a specific date
export const getOpenHours = async (date) => {
  console.log('Fetching open hours for date:', date);

  try {
    const response = await fetch(`${apiUrl}/hours/${date}/open-ranges`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error('Failed to fetch open hours');
    }

    const data = await response.json();
    return data.open_ranges;
  } catch (error) {
    console.error('Error fetching open hours:', error);
    throw error;
  }
};

// Add a new time slot range
export const addTimeSlot = async (date, startTime, endTime) => {
  console.log('Sending new time slot range:', { date, startTime, endTime });

  try {
    const response = await fetch(`${apiUrl}/hours/${date}/add-range`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start: startTime, end: endTime }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error('Failed to add time slot');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding time slot:', error);
    throw error;
  }
};

// Remove an existing time slot range
export const removeTimeSlot = async (date, startHour, endHour) => {
  console.log('Removing time slot range:', { date, startHour, endHour });

  try {
    const response = await fetch(`${apiUrl}/hours/${date}/remove-range`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start: startHour, end: endHour }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error('Failed to remove time slot');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing time slot:', error);
    throw error;
  }
};

// Get available delivery slots
export const getAvailableDeliverySlots = async (date, timeToCook) => {
  console.log('Fetching available delivery slots:', { date, timeToCook });

  try {
    const response = await fetch(
      `${apiUrl}/hours/${date}/available-slots?timeToCook=${timeToCook}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error('Failed to fetch available delivery slots');
    }

    const data = await response.json();
    return data.available_slots;
  } catch (error) {
    console.error('Error fetching delivery slots:', error);
    throw error;
  }
};
