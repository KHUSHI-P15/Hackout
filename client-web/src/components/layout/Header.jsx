import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Menu } from 'lucide-react';
import logo from '../../assets/image.png'; // Adjust path to match your logo

export default function Header({ onToggleSidebar }) {
	const { user } = useAuth();
	const navigate = useNavigate();

	return (
		<header className="fixed top-0 left-0 right-0 z-40 w-full h-20 m-0 bg-gradient-to-r from-blue-100 via-white to-gray-100 border-b border-gray-200 flex justify-between items-center px-4 md:px-6 shadow-sm">
			{/* Left: Brand and Menu Toggle */}
			<div className="flex items-center gap-4">
				<Button
					icon={<Menu size={24} />}
					className="md:hidden p-button-text p-button-rounded text-[#336699] hover:bg-[#336699] hover:text-white transition duration-200"
					onClick={onToggleSidebar}
					aria-label="Toggle sidebar"
				/>
				<div className="flex items-center gap-2">
					<img
						src={logo}
						alt="BlueRoots Logo"
						className="w-10 h-10 rounded-full object-contain"
					/>
					<h1 className="text-3xl font-extrabold text-[#336699] tracking-wide">
						Blue<span className="text-gray-800">Roots</span>
					</h1>
				</div>
			</div>

			{/* Right: User Info */}
			<div
				className="flex items-center gap-3 bg-white/80 border border-gray-300 px-4 py-2 rounded-full cursor-pointer shadow-sm hover:shadow-md hover:bg-white transition-all duration-200"
				onClick={() => navigate('/profile')}
			>
				<Avatar icon="pi pi-user" shape="circle" className="bg-blue-100 text-[#336699]" />
				<span className="hidden sm:inline text-sm font-medium text-[#336699]">
					{user ? user.name || user.email : 'Guest'}
				</span>
			</div>
		</header>
	);
}
