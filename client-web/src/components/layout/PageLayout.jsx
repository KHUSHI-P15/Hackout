import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function PageLayout({ children }) {
	const [sidebarVisible, setSidebarVisible] = useState(false);

	const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
	const closeSidebar = () => setSidebarVisible(false);

	return (
		<div className="min-h-screen flex flex-col overflow-hidden">
			<style>{`
				body {
					overflow: hidden;
				}
			`}</style>

			<div className="fixed top-0 left-0 right-0 z-50">
				<Header onToggleSidebar={toggleSidebar} />
			</div>

			<div className="flex flex-1 pt-16">
				{sidebarVisible && (
					<div
						className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
						onClick={closeSidebar}
					></div>
				)}

				<div
					className={`fixed z-40 top-16 bottom-0 left-0 w-64 p-4 bg-primary border-r border-primary-border transition-transform duration-300
						${sidebarVisible ? 'translate-x-0' : '-translate-x-full'}
						md:static md:translate-x-0 md:z-auto overflow-y-auto scrollbar-hide`}
				>
					<Sidebar isVisible={sidebarVisible} onClose={closeSidebar} />
				</div>

				<main
					className="flex-1 p-4 bg-gray-50 overflow-y-auto transition-all duration-300"
					style={{ height: 'calc(100vh - 4rem)' }}
				>
					{children}
				</main>
			</div>
		</div>
	);
}
