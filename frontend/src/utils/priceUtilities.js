export const centsToFormattedPrice = (cents) => {
	let dollars = cents / 100
	return `$${dollars.toFixed(2)}`
}