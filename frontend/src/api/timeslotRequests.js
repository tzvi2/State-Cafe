export const bookTimeSlot = async ({ totalCookTime, date, time }) => {
	console.log("totalCookTime: ", totalCookTime)
	console.log("date: ", date)
	console.log("time: ", time)
	
	try {
			const response = await fetch(`https://state-cafe.vercel.app/timeslots/book-timeslot`, {
					method: 'POST',
					headers: {
							'Content-Type': 'application/json',
					},
					body: JSON.stringify({
							totalCookTime, // total cook time in minutes
							date, // selected date in 'YYYY-MM-DD' format
							time, // selected time slot in 'HH:MM' format
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
