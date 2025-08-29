const apiURL = import.meta.env.VITE_URL;
export async function fetchPost({
	pathName,
	token = null,
	body,
	method = 'POST',
	contentType = 'application/json',
}) {
	if (!navigator.onLine) {
		return { success: false, internet: true, message: 'Connection Issue' };
	}

	try {
		const token = localStorage.getItem('token');
		const response = await fetch(apiURL + pathName, {
			method,
			headers: {
				...(token && { Authorization: 'Bearer ' + token }),
				'Content-Type': contentType,
			},
			body,
		});

		if (response.status === 405) {
			localStorage.removeItem('token');
			localStorage.removeItem('role');
			window.open('/', '_self');
			return;
		}

		if (response.status === 401) {
			// Token is invalid/expired
			localStorage.clear();
			window.location.href = '/login'; // 🔁 Redirect to login
			return;
		}

		// Parse response as JSON
		const result = await response.json();
		return result;
	} catch (error) {
		console.error('Fetch error:', error);
		return { success: false, internet: true, message: 'Connection Issue' };
	}
}

export async function fetchGet({ pathName, token = null, method = 'GET' }) {
	const apiURL = import.meta.env.VITE_URL;
	if (!navigator.onLine) {
		return { success: false, internet: true, message: 'Connection Issue' };
	}
	try {
		const token = localStorage.getItem('token');
		const request = await fetch(apiURL + pathName, {
			method,
			headers: { Authorization: 'Bearer ' + token },
		});
		if (request.status == 405) {
			//localStorage.removeItem('role');
			localStorage.removeItem('token');
			window.open('/', '_self');
			return;
		}
		if (request.status === 401) {
			// Token is invalid/expired
			localStorage.clear();
			window.location.href = '/login'; // 🔁 Redirect to login
			return;
		}
		const response = await request.json();
		return response;
	} catch (error) {
		return { success: false, internet: true, message: 'Connection Issue' };
	}
}
