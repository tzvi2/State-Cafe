import apiUrl from '../config'; // apiUrl is not needed for local development with the emulator

async function uploadImage(file) {
	const formData = new FormData();
	formData.append('image', file);

	// Log the contents of the FormData
	for (let [key, value] of formData.entries()) {
		console.log(`${key}:`, value);
	}

	try {
		const response = await fetch(`http://127.0.0.1:5001/state-cafe/us-central1/api/upload`, {
			method: 'POST',
			body: formData,
		});
		if (!response.ok) throw new Error('Upload failed');

		const data = await response.json();
		return data.url;
	} catch (error) {
		console.error('Image upload error:', error);
		throw error;
	}
}

export default uploadImage;
