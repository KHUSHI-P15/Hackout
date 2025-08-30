import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import DashboardCard from '../../components/dashboard/CountCards';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dummy report data
const dummyReports = [
	{
		id: 1,
		title: 'Illegal Cutting',
		severity: 'High',
		lat: 21.1702,
		lng: 72.8311,
		status: 'pending',
	},
	{
		id: 2,
		title: 'Dumping Waste',
		severity: 'Medium',
		lat: 21.1825,
		lng: 72.833,
		status: 'pending',
	},
	{ id: 3, title: 'Encroachment', severity: 'Low', lat: 21.165, lng: 72.84, status: 'resolved' },
];

// Custom marker icons
const getSeverityIcon = (severity) => {
	const color = severity === 'High' ? 'red' : severity === 'Medium' ? 'orange' : 'green';
	return new L.Icon({
		iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
		shadowSize: [41, 41],
	});
};

const Dashboard = () => {
	const [reports, setReports] = useState([]);
	const [stats, setStats] = useState({
		total: 0,
		pending: 0,
		resolved: 0,
	});

	useEffect(() => {
		setReports(dummyReports);

		const total = dummyReports.length;
		const pending = dummyReports.filter((r) => r.status === 'pending').length;
		const resolved = dummyReports.filter((r) => r.status === 'resolved').length;

		setStats({ total, pending, resolved });
	}, []);

	const govtStats = [
		{
			label: 'Total Reports',
			value: stats.total,
			icon: 'pi pi-list',
			color: 'text-blue-500',
			gradientFrom: '#bfdbfe',
			gradientTo: '#60a5fa',
		},
		{
			label: 'Pending Reports',
			value: stats.pending,
			icon: 'pi pi-clock',
			color: 'text-orange-500',
			gradientFrom: '#fed7aa',
			gradientTo: '#fb923c',
		},
		{
			label: 'Resolved Reports',
			value: stats.resolved,
			icon: 'pi pi-check',
			color: 'text-green-500',
			gradientFrom: '#bbf7d0',
			gradientTo: '#4ade80',
		},
	];

	return (
		<PageLayout>
			<div className="w-full space-y-8">
				<h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>

				{/* Count Cards */}
				<DashboardCard data={govtStats} />

				<div className="flex gap-6">
					{/* Map */}
					<div className="h-[300px] w-3/4 rounded-lg overflow-hidden shadow-md">
						<MapContainer
							center={[21.1702, 72.8311]}
							zoom={13}
							scrollWheelZoom={true}
							style={{ height: '100%', width: '100%' }}
						>
							<TileLayer
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								attribution="&copy; OpenStreetMap contributors"
							/>
							{reports.map((report) => (
								<Marker
									key={report.id}
									position={[report.lat, report.lng]}
									icon={getSeverityIcon(report.severity)}
								>
									<Popup>
										<div>
											<h3 className="font-bold">{report.title}</h3>
											<p>Severity: {report.severity}</p>
											<p>Status: {report.status}</p>
										</div>
									</Popup>
								</Marker>
							))}
						</MapContainer>
					</div>

					{/* Legend */}
					<div className="flex flex-col justify-center gap-3 w-1/4">
						<h3 className="text-lg font-semibold mb-2">Severity Legend</h3>
						<div className="flex items-center gap-2">
							<div className="w-5 h-5 bg-red-500 rounded-full"></div>
							<span>High Severity</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-5 h-5 bg-orange-500 rounded-full"></div>
							<span>Medium Severity</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-5 h-5 bg-green-500 rounded-full"></div>
							<span>Low Severity</span>
						</div>
					</div>
				</div>
			</div>
		</PageLayout>
	);
};

export default Dashboard;
