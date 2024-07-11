export const capitalizeFirstLetters = (str) => {
	let arr = str.split(" ");
	let results = []; 
	for (let s of arr) {
			results.push(s.charAt(0).toUpperCase() + s.substring(1)); 
	}
	return results.join(" ");
}

export function formatPhoneNumber(phoneNumber) {

  if (phoneNumber.includes('-')) {
    return phoneNumber.replace(/^(\d{3})/, '($1)');
  } else {
    return phoneNumber.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1)-$2-$3');
  }
}