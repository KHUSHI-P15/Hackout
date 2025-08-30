import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function PageLayout({ children }) {
	const [sidebarVisible, setSidebarVisible] = useState(false);

	const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
	const closeSidebar = () => setSidebarVisible(false);

	return (
		<div className="min-h-screen flex flex-col">
			{/* Keep scroll inside layout, no need to block body scroll */}
			<div className="fixed top-0 left-0 right-0 z-50">
				<Header onToggleSidebar={toggleSidebar} />
			</div>

			<div className="flex flex-1">
				{/* Mobile backdrop */}
				{sidebarVisible && (
					<div
						className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
						onClick={closeSidebar}
					/>
				)}
			</div>
			{/* Sidebar */}
			<Sidebar isVisible={sidebarVisible} onClose={closeSidebar} />

			{/* Main content */}
			<div className="ml-60 pt-24 px-4 md:px-10 pb-6 min-h-screen">{children}</div>
		</div>
	);
}
