import { createContext, useContext, useState, useEffect } from 'react';
import { fetchPost } from '../utils/fetch.utils';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [userId, setUserId] = useState(localStorage.getItem('_id') || null);
	const [role, setRole] = useState(localStorage.getItem('role') || null);

	useEffect(() => {
		setUserId(localStorage.getItem('_id') || null);
		setRole(localStorage.getItem('role') || null);
	}, []);

	const login = (user) => {
		localStorage.setItem('_id', user._id);
		localStorage.setItem('username', user.username);
		localStorage.setItem('role', user.role);
		localStorage.setItem('token', user.token);
		localStorage.setItem('data', JSON.stringify(user.profile));

		setUserId(user._id);
		setRole(user.role);
	};

	const logout = async () => {
		const userId = localStorage.getItem('_id');
		await fetchPost({ pathName: 'auth/logout', body: JSON.stringify({ _id: userId }) });
		localStorage.clear();
		setUserId(null);
		setRole(null);
	};

	return (
		<AuthContext.Provider value={{ userId, role, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
