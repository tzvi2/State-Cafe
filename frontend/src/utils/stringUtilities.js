export const capitalizeFirstLetters = (str) => {
	let arr = str.split(" ");
	let results = []; 
	for (let s of arr) {
			results.push(s.charAt(0).toUpperCase() + s.substring(1)); 
	}
	return results.join(" ");
}
