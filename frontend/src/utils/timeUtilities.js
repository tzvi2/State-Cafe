export const formatTimeTo12Hour = (date) => {
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? 'pm' : 'am';
	const formattedHours = hours % 12 || 12;
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
	return `${formattedHours}:${formattedMinutes}${ampm}`;
};

export const formatIsoToTime = (isoString) => {
	const date = new Date(isoString);
	return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
}

export function convertTo12HourFormat(time24) {
	// Split the time into hours and minutes
	const [hours, minutes] = time24.split(':').map(Number);

	// Determine if it's AM or PM
	const period = hours >= 12 ? 'pm' : 'am';

	// Convert hours to 12-hour format
	const hours12 = hours % 12 || 12; // Convert 0 or 12 to 12 for 12-hour clock

	// Return the formatted time
	return `${hours12}:${minutes.toString().padStart(2, '0')}${period}`;
}

export function convertIsoTo12HourTime(isoString) {
	const date = new Date(isoString);

	// Extract hours and minutes
	let hours = date.getUTCHours(); // Use UTC time
	const minutes = date.getUTCMinutes();

	// Determine am/pm
	const ampm = hours >= 12 ? 'pm' : 'am';

	// Convert hours from 24-hour to 12-hour format
	hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

	// Format minutes with leading zero
	const formattedMinutes = minutes.toString().padStart(2, '0');

	return `${hours}:${formattedMinutes}${ampm}`;
}

