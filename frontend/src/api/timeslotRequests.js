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
export const bookTimeSlot = async (date, time, timeToCook) => {
  console.log('sending book request ', date, time, timeToCook)
  try {
    const response = await fetch(`${apiUrl}/hours/${date}/book-slot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        time,
        timeToCook,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to book the time slot');
    }

    const data = await response.json();
    console.log('Time slot booked:', data);
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

export const dayHasAvailableSlots = async (date) => {
  try {
    const response = await fetch(`${apiUrl}/hours/${date}/has-available-slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error('Error checking available slots:', response.statusText);
      return false; // Default to false on error
    }

    const data = await response.json();
    return data.available || false; // Return the 'available' field from the response
  } catch (error) {
    console.error('Error checking available slots:', error);
    return false; // Default to false on exception
  }
};

export const getOrderingWindow = async (date) => {
  try {
    const response = await fetch(`${apiUrl}/hours/${date}/get-ordering-window`);
    if (!response.ok) {
      console.error('Error fetching ordering window:', response.statusText);
      return [];
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching ordering window:', error);
    return []; // Return an empty array if there's an error
  }
};

export const addOrderingWindow = async (date, start, end) => {
  try {
    // First, check if an ordering window already exists
    const existingOrderingWindow = await getOrderingWindow(date);
    if (existingOrderingWindow.length > 0) {
      return { message: 'An ordering window already exists for this date.' };
    }

    // Add the new ordering window
    const response = await fetch(`${apiUrl}/hours/${date}/add-ordering-window`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start, end }),
    });

    if (!response.ok) {
      console.error('Error adding ordering window:', response.statusText);
      return { error: 'Failed to add ordering window.' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding ordering window:', error);
    return { error: 'Failed to add ordering window.' };
  }
};

export const removeOrderingWindow = async (date, start, end) => {
  try {
    // First, check if an ordering window exists
    const existingOrderingWindow = await getOrderingWindow(date);
    if (existingOrderingWindow.length === 0) {
      return { message: 'No ordering window exists for this date.' };
    }

    // Remove the specified ordering window
    const response = await fetch(`${apiUrl}/hours/${date}/remove-ordering-window`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start, end }),
    });

    if (!response.ok) {
      console.error('Error removing ordering window:', response.statusText);
      return { error: 'Failed to remove ordering window.' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error removing ordering window:', error);
    return { error: 'Failed to remove ordering window.' };
  }
};

export const validateTimeSlot = async (deliveryDate, deliverySlot, totalCookTime) => {
  try {
    const response = await fetch(
      `${apiUrl}/hours/${deliveryDate}/${deliverySlot}/${totalCookTime}/slot-is-available`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to validate the time slot.");
    }

    const { message } = await response.json();
    console.log("Time slot validation:", message);

    return { success: true, message };
  } catch (error) {
    console.error("Error validating time slot:", error);
    return {
      success: false,
      message: error.message || "Failed to validate the selected time slot.",
    };
  }
};