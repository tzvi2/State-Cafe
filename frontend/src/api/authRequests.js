import apiUrl from "../config";

export const checkUserPermissions = async (email) => {
	try {
		const response = await fetch(`${apiUrl}/auth/check-permission`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		});

		if (!response.ok) {
			console.error('Failed to check email permissions:', response.statusText);
			return false;
		}

		const data = await response.json();
		return data.isAllowed;
	} catch (error) {
		console.error('Error checking email permissions:', error);
		return false;
	}
};