import { redirect } from 'react-router-dom';
import { fetchGet, fetchPost } from '../utils/fetch.utils';
export const loginLoader = () => {
	const token = localStorage.getItem('token');
	const role = localStorage.getItem('role');

	if (token && role) {
		switch (role) {
			case 'ADMIN':
				return redirect('/admin/dashboard');
			case 'FACULTY':
				return redirect('/faculty/dashboard');
			case 'STUDENT':
				return redirect('/student/dashboard');
			case 'INSTITUTE-HEAD':
				return redirect('/hoi/dashboard');
			case 'DEPARTMENT-HEAD':
				return redirect('/hod/dashboard/');
			default:
				return redirect('/login'); // fallback for unknown roles
		}
	}

	return null;
};
export const verifyLoader = (expectedRole) => {
	return async () => {
		const token = localStorage.getItem('token');
		const role = localStorage.getItem('role');

		if (!token || !role) {
			localStorage.clear();
			return redirect('/login');
		}

		try {
			const result = await fetchGet({ pathName: 'auth/verify', token });
			if (!result || !result.success) {
				const userId = localStorage.getItem('_id');
				await fetchPost({ pathName: 'auth/logout', body: JSON.stringify({ _id: userId }) });
				localStorage.clear();
				return redirect('/login');
			}

			let verify = null;
			if (
				expectedRole === 'admin' ||
				expectedRole === 'faculty' ||
				expectedRole === 'student'
			) {
				verify = expectedRole.toLowerCase() === role.toLowerCase();
			} else if (expectedRole === 'hoi') {
				verify = 'INSTITUTE-HEAD' === role;
			} else if (expectedRole === 'hod') {
				verify = 'DEPARTMENT-HEAD' === role;
			}

			if (verify) {
				return null;
			} else {
				localStorage.clear();
				return redirect('/login');
			}
		} catch (error) {
			console.error('verifyLoader error:', error);
			localStorage.clear();
			return redirect('/login');
		}
	};
};
