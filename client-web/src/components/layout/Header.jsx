import React from 'react';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { useNavigate } from 'react-router-dom';
// import logo from '../../images/skillScript.png';

export default function Header({ onToggleSidebar }) {
	const navigate = useNavigate();
	const username = localStorage.getItem('username');
	const userData = JSON.parse(localStorage.getItem('data') || '{}');
	const role = localStorage.getItem('role');

	function handleProfileClick() {
		if (role === 'STUDENT') {
			navigate('/student/profile');
		} else if (role === 'FACULTY') {
			navigate('/faculty/profile');
		} else if (role === 'DEPARTMENT-HEAD') {
			navigate('/hod/profile');
		}
	}

	return (
		<header className="flex items-center justify-between px-3 py-3 bg-white shadow-md z-50 w-full">
			<div className="flex items-center gap-2 min-w-0">
				<Button
					icon="pi pi-bars"
					className="p-button-text md:hidden my-auto"
					onClick={onToggleSidebar}
					aria-label="Toggle Menu"
				/>
				{/* <Avatar image={logo} size="xlarge" shape="circle" className="w-12 h-12 my-auto" /> */}
				<h1 className="text-2xl sm:text-3xl font-bold text-sky-800 truncate my-auto">
					SkillScript
				</h1>
			</div>

			<div
				className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:ring-1 hover:ring-primary-hover focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1 sm:p-2 transition-all"
				onClick={handleProfileClick}
			>
				<span className="hidden sm:inline text-xl font-semibold text-primary truncate max-w-[100px] sm:max-w-xs">
					{username || 'Guest'}
				</span>
				{/* <Avatar
					shape="circle"
					className="text-primary bg-gray-200 w-10 h-10"
					icon={
						role === 'STUDENT' && !userData?.profile?.url
							? 'pi pi-user text-xl'
							: 'pi pi-user text-xl'
					}
					image={
						role === 'STUDENT' && userData?.profile?.url
							? `${userData.profile.url}` // backend URL + stored path
							: undefined
					}
				/> */}
			</div>
		</header>
	);
}
