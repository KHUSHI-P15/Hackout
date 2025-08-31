import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAuth } from '../../contexts/AuthContext';
import {
	LayoutDashboard,
	PlusCircle,
	History,
	Trophy,
	Users,
	CheckCheck,
	PenSquare,
	ShieldCheck,
	CheckSquare,
	BarChart2,
	BookOpen,
} from 'lucide-react';

// Ensure dependencies are installed:
// npm install lucide-react react-router-dom primereact primeicons
// Import primeicons CSS in index.js or App.js:
// import 'primeicons/primeicons.css';

export default function Sidebar({ isVisible, onClose }) {
	const navigate = useNavigate();
	const { role, logout } = useAuth(); // Ensure AuthContext provides role and logout

	// Map icon names to components to avoid inline JSX in roleRoutes
	const iconMap = {
		LayoutDashboard: LayoutDashboard,
		PlusCircle: PlusCircle,
		History: History,
		Trophy: Trophy,
		Users: Users,
		CheckCheck: CheckCheck,
		PenSquare: PenSquare,
		ShieldCheck: ShieldCheck,
		CheckSquare: CheckSquare,
		BarChart2: BarChart2,
		BookOpen: BookOpen,
	};

	const roleRoutes = {
		citizen: [
			{ name: 'Dashboard', route: '/citizen/dashboard', icon: 'LayoutDashboard' },
			{ name: 'Add Report', route: '/citizen/add-report', icon: 'PlusCircle' },
			{ name: 'History', route: '/citizen/history', icon: 'History' },
			{ name: 'Leaderboard', route: '/leaderboard', icon: 'Trophy' },
			{ name: 'Announcements', route: '/community', icon: 'Users' },
		],
		ngo: [
			{ name: 'Dashboard', route: '/ngo/dashboard', icon: 'LayoutDashboard' },
			{ name: 'Verify Reports', route: '/ngo/verify-reports', icon: 'CheckCheck' },
			{ name: 'Announcements', route: '/community', icon: 'PenSquare' },
			{ name: 'Leaderboard', route: '/leaderboard', icon: 'Trophy' },
		],
		government: [
			{ name: 'Dashboard', route: '/government/dashboard', icon: 'LayoutDashboard' },
			{
				name: 'Verify NGOs/Researchers',
				route: '/government/verify-entities',
				icon: 'ShieldCheck',
			},
			{ name: 'Resolve Reports', route: '/government/resolve-reports', icon: 'CheckSquare' },
			{ name: 'Data Insights', route: '/government/data-insights', icon: 'BarChart2' },
			{ name: 'Announcements', route: '/community', icon: 'PenSquare' },
		],
		researcher: [
			{ name: 'Dashboard', route: '/researcher/dashboard', icon: 'LayoutDashboard' },
			{ name: 'Add Insights', route: '/researcher/add-insights', icon: 'BookOpen' },
			{ name: 'Data Insights', route: '/researcher/data-insights', icon: 'BarChart2' },
			{ name: 'Announcements', route: '/community', icon: 'PenSquare' },
		],
	};

	const handleLogout = async () => {
		await logout();
		navigate('/login');
	};

	const handleLogoutConfirm = () => {
		confirmDialog({
			message: 'Are you sure you want to logout?',
			header: 'Logout Confirmation',
			icon: 'pi pi-sign-out',
			className: 'md:w-96 sm:w-90',
			acceptClassName: 'p-button-danger ml-3',
			rejectClassName: 'p-button-secondary p-button-text',
			acceptLabel: 'Yes',
			rejectLabel: 'No',
			draggable: false,
			accept: () => handleLogout(),
			reject: () => {},
		});
	};

	const links = roleRoutes[role] || [];

	return (
		<>
			<ConfirmDialog />
			<nav className="px-6 py-4 space-y-2 flex-1">
				{links.map((link) => {
					const IconComponent = iconMap[link.icon];
					return (
						<NavLink
							key={link.name}
							to={link.route}
							onClick={onClose}
							className={({ isActive }) =>
								`flex items-center gap-4 px-5 py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
									isActive
										? 'bg-[#336699] text-white shadow-md'
										: 'text-[#336699] hover:bg-[#336699]/10 hover:text-[#336699] hover:shadow'
								}`
							}
						>
							<span className="text-xl">
								{IconComponent ? <IconComponent size={20} /> : null}
							</span>
							<span>{link.name}</span>
						</NavLink>
					);
				})}
			</nav>

			<div className="px-6 py-6 border-t border-gray-200">
				<Button
					icon="pi pi-sign-out"
					label="Logout"
					onClick={handleLogoutConfirm}
					className="w-full p-button-text text-lg text-red-600 hover:bg-red-100 hover:text-red-700 transition-all"
				/>
			</div>
		</>
	);
}
