import React, { useState, useRef } from 'react';
import { fetchPost } from '../../utils/fetch.utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import logo from '../../assets/image.png';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const toast = useRef(null);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleLogin = async () => {
		setLoading(true);
		if (!email || !password) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Please enter email and password.',
			});
			setLoading(false);
			return;
		}

		try {
			const response = await fetchPost({
				pathName: 'auth/login',
				body: JSON.stringify({ email, password }),
			});

			if (response?.internet) {
				toast.current.show({
					severity: 'error',
					summary: 'Connection Error',
					detail: 'Unable to connect to the server. Please check your network or try again later.',
				});
				setLoading(false);
				return;
			}

			if (response?.success) {
				login(response.data); // Store token and user data
				// Navigate based on role
				switch (response.data.role) {
					case 'citizen':
						navigate('/citizen/dashboard');
						break;
					case 'ngo':
						navigate('/ngo/dashboard');
						break;
					case 'government':
						navigate('/government/dashboard');
						break;
					case 'researcher':
						navigate('/researcher/dashboard');
						break;
					default:
						navigate('/dashboard');
				}
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: `${response?.message || 'Login failed'}`,
				});
			}
		} catch {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Something went wrong!',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleForgotPassword = () => {
		navigate('/forgot-password');
	};

	const handleRegister = () => {
		navigate('/register');
	};

	return (
		<>
			<Toast ref={toast} />
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-gray-100 px-4">
				<h1 className="text-4xl font-extrabold text-[#336699] mb-16 tracking-wide drop-shadow-sm overflow-hidden whitespace-nowrap border-r-4 border-[#336699] animate-typing">
					Blue<span className="text-gray-800">Roots</span>
				</h1>

				<div className="relative w-full max-w-md p-8 rounded-xl shadow-lg backdrop-blur-md bg-white/30 border border-white/40">
					<div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
						<Avatar
							image={logo}
							size="xlarge"
							shape="circle"
							className="size-24 shadow-lg border-4 border-white bg-primary/3 p-1.5"
						/>
					</div>

					<h2 className="text-3xl font-bold text-[#336699] text-center my-10">Login</h2>

					<div className="mb-4">
						<label htmlFor="email" className="block text-[#336699] font-medium mb-1">
							Email
						</label>
						<InputText
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							className="w-full p-3 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-[#336699] hover:border-[#336699]"
						/>
					</div>

					<div className="mb-4">
						<label htmlFor="password" className="block text-[#336699] font-medium mb-1">
							Password
						</label>
						<InputText
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							className="w-full p-3 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-[#336699] hover:border-[#336699]"
						/>
					</div>

					<Button
						label={<div className="text-white font-semibold">Login</div>}
						onClick={handleLogin}
						loading={loading}
						className="w-full bg-[#336699] hover:bg-[#2a547a] transition text-white font-semibold py-2.5 rounded shadow-sm transform hover:scale-105"
					/>

					<div className="mt-4 flex justify-between gap-2">
						<Button
							label={
								<span className="flex items-center gap-2">
									<span>Not registered? Sign Up</span>
								</span>
							}
							onClick={handleRegister}
							className="text-[#336699] hover:text-[#2a547a] bg-transparent border-none px-1 py-0 font-medium transform hover:scale-105 focus:ring-2 focus:ring-[#336699] rounded"
							text
						/>
						<Button
							label={
								<span className="flex items-center gap-2">
									<span>Reset Password</span>
								</span>
							}
							onClick={handleForgotPassword}
							className="text-[#336699] hover:text-[#2a547a] bg-transparent border-none px-1 py-0 font-medium transform hover:scale-105 focus:ring-2 focus:ring-[#336699] rounded"
							text
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
