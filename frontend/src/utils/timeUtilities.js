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