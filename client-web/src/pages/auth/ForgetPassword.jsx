import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { fetchPost } from '../../utils/fetch.utils';
import { Avatar } from 'primereact/avatar';
import logo from '../../images/skillScript.png';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
	const [username, setUsername] = useState('');
	const [loading, setLoading] = useState(false);
	const [showResend, setShowResend] = useState(false);
	const toast = useRef(null);

	useEffect(() => {
		let timer;
		if (loading) {
			timer = setTimeout(() => {
				setShowResend(true);
			}, 60000); // Show resend option after 60 seconds
		}
		return () => clearTimeout(timer);
	}, [loading]);

	const handleSendEmail = async () => {
		setLoading(true);
		setShowResend(false);
		if (!username) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Please Enter Username to Reset Password.',
			});
			setLoading(false);
			return;
		}
		try {
			const response = await fetchPost({
				pathName: 'auth/forgot-password',
				body: JSON.stringify({ username }),
			});

			if (response?.success) {
				toast.current.show({
					severity: 'success',
					summary: 'Success',
					detail: 'Password reset email sent to your registered email address!',
					life: 5000,
				});
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: `${response?.message || 'Failed to send reset email.'}`,
				});
			}
		} catch (error) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to send reset email. Please try again.',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleResendEmail = async () => {
		setLoading(true);
		try {
			const response = await fetchPost({
				pathName: 'auth/forgot-password',
				body: JSON.stringify({ username }),
			});

			if (response?.success) {
				toast.current.show({
					severity: 'success',
					summary: 'Success',
					detail: 'Password reset email resent successfully!',
					life: 5000,
				});
			} else {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: `${response?.message || 'Failed to resend email.'}`,
				});
			}
		} catch (error) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to resend email. Please try again.',
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
					Skill<span className="text-gray-800">Script</span>
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

					<h2 className="text-3xl font-bold text-[#336699] text-center my-10">
						Reset Password
					</h2>

					<div className="mb-4">
						<label htmlFor="username" className="block text-[#336699] font-medium mb-1">
							Username
						</label>
						<InputText
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Enter your username"
							className="w-full p-3 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-[#336699] hover:border-[#336699]"
						/>
					</div>

					<Button
						label={<div className="text-white font-semibold">Send Email</div>}
						onClick={handleSendEmail}
						loading={loading}
						className="w-full bg-[#336699] hover:bg-[#2a547a] transition text-white font-semibold py-2.5 rounded shadow-sm transform hover:scale-105"
					/>

					{showResend && (
						<div className="mt-4 flex justify-end">
							<Button
								label={
									<div className="text-[#336699] font-medium flex items-center gap-2">
										<i className="pi pi-refresh text-base" />
										Resend Email
									</div>
								}
								onClick={handleResendEmail}
								loading={loading}
								className="p-0 bg-transparent hover:bg-[#336699]/10 transition rounded border-none focus:ring-2 focus:ring-[#336699] transform hover:scale-105"
								disabled={!username || loading}
								tooltip="Resend password reset email"
								tooltipOptions={{ position: 'top' }}
								text
							/>
						</div>
					)}

					<div className="mt-4 flex justify-end">
						<Link to="/login">
							<Button
								label={
									<div className="text-[#336699] font-medium flex items-center gap-2">
										<i className="pi pi-arrow-left text-base" />
										Back to Login
									</div>
								}
								className="text-[#336699] hover:text-[#2a547a] bg-transparent border-none px-1 py-0 font-medium transform hover:scale-105 focus:ring-2 focus:ring-[#336699] rounded"
								text
							/>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
};

export default ForgotPassword;
