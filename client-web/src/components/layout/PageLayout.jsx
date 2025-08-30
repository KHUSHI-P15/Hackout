import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function PageLayout({ children }) {
	const [sidebarVisible, setSidebarVisible] = useState(false);

	const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
	const closeSidebar = () => setSidebarVisible(false);

	return (
		<div className="min-h-screen flex flex-col">
			{/* Header fixed at top */}
			<div className="fixed top-0 left-0 right-0 z-50">
				<Header onToggleSidebar={toggleSidebar} />
			</div>

			<div className="flex flex-1 pt-20">
				{/* Mobile backdrop */}
				{sidebarVisible && (
					<div
						className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
						onClick={closeSidebar}
					/>
				)}
				{/* Sidebar */}
				<div
					className={`
            fixed top-20 left-0 h-[calc(100vh-5rem)] 
            z-50 md:block 
            ${sidebarVisible ? 'block' : 'hidden'} 
            md:w-60 w-60 bg-white shadow-lg
          `}
				>
					<Sidebar isVisible={sidebarVisible} onClose={closeSidebar} />
				</div>

				{/* Main content */}
				<div className="flex-1 md:ml-60 pt-4 px-4 md:px-10 pb-6 min-h-screen">
					{children}
				</div>
			</div>
		</div>
	);
}
