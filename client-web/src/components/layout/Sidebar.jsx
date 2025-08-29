import React from 'react';
import { Button } from 'primereact/button';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
	CalendarCheck2,
	LayoutDashboard,
	Table2,
	Group,
	MonitorDot,
	Tag,
	MessageSquareHeart,
} from 'lucide-react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FaChalkboardTeacher, FaFileAlt } from 'react-icons/fa';

export default function Sidebar({ isVisible, onClose }) {
	const navigate = useNavigate();
	const { logout, role } = useAuth();
	// const role = 'faculty';

	const data = localStorage.getItem('data');
	const instituteId = data ? JSON.parse(data)?.instituteId : null;

	const roleBasedButtons = {
		ADMIN: [
			{
				label: 'Dashboard',
				icon: <LayoutDashboard size={23} />,
				route: '/admin/dashboard',
			},
			{ label: 'Institutes', icon: 'pi pi-building', route: '/admin/institute' },
			{ label: 'Tags', icon: <Tag />, route: '/admin/tags' },
			{ label: 'Feedbacks', icon: <MessageSquareHeart />, route: '/admin/feedback' },
		],
		'INSTITUTE-HEAD': [
			{
				label: 'Dashboard',
				icon: <LayoutDashboard size={23} />,
				route: '/hoi/dashboard',
			},
			{
				label: 'Departments',
				icon: 'pi pi-building',
				route: `/hoi/department/${instituteId}`,
			},
		],
		'DEPARTMENT-HEAD': [
			{
				label: 'Dashboard',
				icon: <LayoutDashboard size={23} />,
				route: '/hod/dashboard',
			},
			{ label: 'Faculties', icon: <FaChalkboardTeacher size={23} />, route: '/hod/faculty' },
			{ label: 'Students', icon: 'pi pi-users', route: '/hod/students' },
			{ label: 'Groups', icon: <Group />, route: '/hod/groups' },
			{ label: 'Subjects', icon: 'pi pi-book', route: '/hod/subjects' },
			{ label: 'Tasks', icon: 'pi pi-list-check', route: '/hod/tasks' },
			{ label: 'Questions', icon: 'pi pi-question-circle', route: '/hod/questions' },
			{ label: 'Rubrics', icon: <Table2 />, route: '/hod/rubrics' },
			{ label: 'Sessions', icon: <MonitorDot />, route: '/hod/sessions' },
		],
		FACULTY: [
			{
				label: 'Dashboard',
				icon: <LayoutDashboard size={23} />,
				route: '/faculty/dashboard',
			},
			{ label: 'Tasks', icon: 'pi pi-list-check', route: '/faculty/tasks' },
			{ label: 'Questions', icon: 'pi pi-question-circle', route: '/faculty/questions' },
			{ label: 'Rubrics', icon: <Table2 />, route: '/faculty/rubrics' },
			{ label: 'Groups', icon: <Group />, route: '/faculty/groups' },
			{ label: 'Sessions', icon: <MonitorDot />, route: '/faculty/sessions' },
			{ label: 'Report', icon: <FaFileAlt size={23} />, route: '/faculty/report' },
		],
		STUDENT: [
			{
				label: 'Dashboard',
				icon: <LayoutDashboard size={23} />,
				route: '/student/dashboard',
			},
			{ label: 'Upcoming', icon: 'pi pi-calendar-clock', route: '/student/upcoming-task' },
			{
				label: 'Available',
				icon: <CalendarCheck2 size={23} />,
				route: '/student/available-task',
			},
			{ label: 'History', icon: 'pi pi-history', route: '/student/history' },
			{ label: 'Guidelines', icon: 'pi pi-book', route: '/student/guidelines' },
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
	const buttons = roleBasedButtons[role] || [];

	return (
		<>
			<ConfirmDialog />
			<div className="h-full space-y-3.5 mt-4">
				{buttons.map(({ label, icon, route }) =>
					route === '#' ? (
						<Button
							key={label}
							label={label}
							icon={icon}
							className="w-full text-xl font-semibold flex items-center gap-2 px-3 py-2 rounded p-button-text text-left text-disabled cursor-not-allowed opacity-60"
							disabled
						/>
					) : (
						<NavLink
							key={label}
							to={route}
							className={({ isActive }) =>
								`w-full text-xl font-semibold my-auto flex items-center gap-2 px-3 py-2 rounded transition-all duration-300 ${
									isActive
										? 'bg-card text-primary shadow-md'
										: 'text-white hover:bg-card hover:text-primary hover:shadow-md'
								}`
							}
							onClick={onClose}
						>
							<div className="flex gap-2.5 my-auto">
								<span className="text-xl my-auto">
									{typeof icon === 'string' ? (
										<i className={icon} style={{ fontSize: '1.5rem' }}></i>
									) : (
										icon
									)}
								</span>
								<span className="text-xl mb-0.5">{label}</span>
							</div>
						</NavLink>
					)
				)}

				<Button
					label={<div className="text-xl font-semibold mb-1">Logout</div>}
					icon={
						<i className="pi pi-sign-out mr-1 my-auto" style={{ fontSize: '1.5rem' }} />
					}
					className="w-full my-auto p-button-text text-left text-white hover:bg-card hover:text-primary hover:shadow-md transition-all duration-300 [&_.pi]:text-xl gap-1"
					onClick={handleLogoutConfirm}
				/>
			</div>
		</>
	);
}
