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

	// Calculate the UTC offset for EST (Eastern Standard Time)
	const EST_OFFSET = -5; // EST is UTC-5
	const isDST = date.toLocaleTimeString('en-US', { timeZone: 'America/New_York' }).includes('EDT');
	const effectiveOffset = isDST ? -4 : EST_OFFSET; // Adjust for daylight saving time (EDT is UTC-4)

	// Get the UTC time and apply the EST/EDT offset
	const utcHours = date.getUTCHours();
	const utcMinutes = date.getUTCMinutes();
	let hours = (utcHours + effectiveOffset + 24) % 24; // Adjust hours for EST/EDT and ensure positive values
	const minutes = utcMinutes;

	// Determine am/pm
	const ampm = hours >= 12 ? 'pm' : 'am';

	// Convert hours from 24-hour to 12-hour format
	hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

	// Format minutes with leading zero
	const formattedMinutes = minutes.toString().padStart(2, '0');

	return `${hours}:${formattedMinutes}${ampm}`;
}


