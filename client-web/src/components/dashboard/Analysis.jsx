import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Analysis = ({ reports }) => {
	if (!reports || reports.length === 0)
		return <p className="text-center py-4">No reports available for analysis.</p>;

	// Count reports by severity
	const severityCounts = { High: 0, Medium: 0, Low: 0 };
	const statusCounts = { pending: 0, 'in-progress': 0, resolved: 0 };
	const ngoCounts = {}; // NGO vs reports

	reports.forEach((r) => {
		if (severityCounts[r.severity] !== undefined) severityCounts[r.severity]++;
		if (statusCounts[r.status] !== undefined) statusCounts[r.status]++;
		const ngo = r.ngo || 'Unassigned';
		ngoCounts[ngo] = (ngoCounts[ngo] || 0) + 1;
	});

	// Pie Chart: Severity Distribution
	const pieData = {
		labels: ['High', 'Medium', 'Low'],
		datasets: [
			{
				label: 'Reports by Severity',
				data: [severityCounts.High, severityCounts.Medium, severityCounts.Low],
				backgroundColor: ['#f87171', '#fb923c', '#4ade80'],
			},
		],
	};

	// Bar Chart: Status Distribution
	const statusBarData = {
		labels: ['Pending', 'In Progress', 'Resolved'],
		datasets: [
			{
				label: 'Reports by Status',
				data: [statusCounts.pending, statusCounts['in-progress'], statusCounts.resolved],
				backgroundColor: ['#facc15', '#60a5fa', '#4ade80'],
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { position: 'bottom', labels: { color: '#555', boxWidth: 20 } },
		},
		scales: {
			x: { ticks: { color: '#555' }, grid: { color: '#eee' } },
			y: { beginAtZero: true, ticks: { color: '#555' }, grid: { color: '#eee' } },
		},
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
			{/* Pie Chart */}
			<div className="bg-white p-4 rounded-xl shadow h-[400px]">
				<h3 className="text-lg font-bold mb-2 text-center">Reports by Severity (Pie)</h3>
				<div className="h-[330px]">
					<Pie data={pieData} options={{ ...chartOptions, scales: undefined }} />
				</div>
			</div>

			{/* Status Bar Chart */}
			<div className="bg-white p-4 rounded-xl shadow h-[400px]">
				<h3 className="text-lg font-bold mb-2 text-center">Reports by Status (Bar)</h3>
				<div className="h-[330px]">
					<Bar data={statusBarData} options={chartOptions} />
				</div>
			</div>
		</div>
	);
};

export default Analysis;
