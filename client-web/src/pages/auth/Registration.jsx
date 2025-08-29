import React, { useState, useRef } from 'react';
import { fetchPost } from '../../utils/fetch.utils';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Avatar } from 'primereact/avatar';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import logo from '../../assets/image.png';

const Register = () => {
	const [name, setName] = useState('');
	const [role, setRole] = useState(null);
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [loading, setLoading] = useState(false);
	const toast = useRef(null);
	const navigate = useNavigate();

	// Frontend role options for display
	const roleOptions = [
		{ label: 'Citizen', value: 'CITIZEN' },
		{ label: 'NGOs', value: 'NGOS' },
		{ label: 'Researchers', value: 'RESEARCHERS' },
		{ label: 'Government', value: 'GOVERNMENT' }, // Added to match schema
	];

	// Map frontend role values to backend schema values
	const roleMap = {
		CITIZEN: 'citizen',
		NGOS: 'ngo',
		RESEARCHERS: 'researcher',
		GOVERNMENT: 'government',
	};

	const handleRegister = async () => {
		setLoading(true);
		if (!name || !role || !password || !email || !phone) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Please fill in all fields.',
			});
			setLoading(false);
			return;
		}

		// Map the selected role to the backend-compatible value
		const mappedRole = roleMap[role];

		try {
			const response = await fetchPost({
				pathName: 'auth/register',
				body: JSON.stringify({ name, role: mappedRole, password, email, phone }),
			});

			if (response?.success) {
				toast.current.show({
					severity: 'success',
					summary: 'Success',
					detail: 'Registration successful! Redirecting to login...',
				});
				setTimeout(() => navigate('/login'), 2000);
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: `${response?.message || 'Registration failed'}`,
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

	return (
		<>
			<Toast ref={toast} />
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-gray-100 px-4">
				<h1 className="text-4xl font-extrabold text-[#336699] mb-16 tracking-wide drop-shadow-sm overflow-hidden whitespace-nowrap border-r-4 border-[#336699] animate-typing">
					Blue<span className="text-gray-800">Roots</span>
				</h1>

				<div className="relative w-full max-w-2xl p-10 rounded-lg shadow-lg backdrop-blur-md bg-white/30 border border-white/40">
					<div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
						<Avatar
							image={logo}
							size="xlarge"
							shape="circle"
							className="size-24 shadow-lg border-4 border-white bg-primary/3 p-1.5"
						/>
					</div>

					<h2 className="text-3xl font-bold text-[#336699] text-center mb-10">
						Register
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						<div>
							<label htmlFor="name" className="block text-[#336699] font-medium mb-2">
								Name
							</label>
							<InputText
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter your name"
								className="w-full p-3 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-[#336699] hover:border-[#336699]"
							/>
						</div>

						<div>
							<label htmlFor="role" className="block text-[#336699] font-medium mb-2">
								Role
							</label>
							<Dropdown
								id="role"
								value={role}
								options={roleOptions}
								onChange={(e) => setRole(e.value)}
								placeholder="Select your role"
								className="w-full p-1 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-[#336699] hover:border-[#336699]"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						<div>
							<label
								htmlFor="email"
								className="block text-[#336699] font-medium mb-2"
							>
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

						<div>
							<label
								htmlFor="phone"
								className="block text-[#336699] font-medium mb-2"
							>
								Phone Number
							</label>
							<InputText
								id="phone"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="Enter your phone number"
								className="w-full p-3 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-[#336699] hover:border-[#336699]"
							/>
						</div>
					</div>

					<div className="mb-6">
						<label htmlFor="password" className="block text-[#336699] font-medium mb-2">
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
						label={<div className="text-white font-semibold">Register</div>}
						onClick={handleRegister}
						loading={loading}
						className="w-full bg-[#336699] hover:bg-[#2a547a] transition text-white font-semibold py-3 rounded shadow-sm transform hover:scale-105"
					/>

					<div className="mt-6 flex flex-col items-end gap-2">
						<Button
							label={
								<span className="flex items-center gap-2">
									<span>Already have an account? Login</span>
								</span>
							}
							onClick={() => navigate('/login')}
							className="text-[#336699] hover:text-[#2a547a] bg-transparent border-none px-1 py-0 font-medium transform hover:scale-105 focus:ring-2 focus:ring-[#336699] rounded"
							text
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default Register;
