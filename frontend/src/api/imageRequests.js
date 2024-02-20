async function uploadImage(file) {
	const formData = new FormData();
	formData.append('image', file);

	try {
		const response = await fetch('https://state-cafe.vercel.app/upload', {
			method: 'POST',
			body: formData,
		});
		if (!response.ok) throw new Error('Upload failed');
		
		const data = await response.json();
		return data.url
		// You can now set the image URL in your state and use it as needed
	} catch (error) {
		console.error(error);
	}
}

export default uploadImage