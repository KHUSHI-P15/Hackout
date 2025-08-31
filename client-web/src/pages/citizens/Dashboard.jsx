import { useEffect } from 'react';
import {
	Chart,
	ArcElement,
	BarElement,
	CategoryScale,
	LinearScale,
	Title,
	Tooltip,
	Legend,
	LineElement,
	PointElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import DashboardCard from '../../components/dashboard/CountCards';
import PageLayout from '../../components/layout/PageLayout';

Chart.register(
	ArcElement,
	BarElement,
	CategoryScale,
	LinearScale,
	Title,
	Tooltip,
	Legend,
	LineElement,
	PointElement
);

const instructorStats = [
	{
		label: 'Total Reports',
		value: 152,
		icon: 'pi pi-file',
		color: 'text-red-500',
		gradientFrom: '#fecaca',
		gradientTo: '#ef4444',
	},
	{
		label: 'Total Points',
		value: 1280,
		icon: 'pi pi-star',
		color: 'text-yellow-500',
		gradientFrom: '#fef9c3',
		gradientTo: '#facc15',
	},
	{
		label: 'Resolved Issues',
		value: 89,
		icon: 'pi pi-check-circle',
		color: 'text-blue-500',
		gradientFrom: '#bfdbfe',
		gradientTo: '#60a5fa',
	},
];

// Chart Data
const pieData = {
	labels: ['High Severity', 'Medium Severity', 'Low Severity'],
	datasets: [
		{
			label: 'Severity',
			data: [50, 70, 32],
			backgroundColor: ['#ef4444', '#facc15', '#60a5fa'],
		},
	],
};

const barData = {
	labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
	datasets: [
		{
			label: 'Reports per Month',
			data: [20, 35, 40, 50, 60],
			backgroundColor: '#36a2eb',
		},
	],
};

const lineData = {
	labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
	datasets: [
		{
			label: 'Resolved Issues',
			data: [5, 15, 25, 44],
			borderColor: '#4ade80',
			backgroundColor: '#4ade80',
			fill: false,
			tension: 0.3,
		},
	],
};

function Dashboard() {
	useEffect(() => {
		Chart.defaults.plugins.legend.position = 'bottom';
	}, []);

	return (
		<PageLayout>
			<div className="grid w-full h-full px-6 py-4">
				{/* Page Title */}
				<h1 className="text-4xl ml-4 font-bold text-[#336699] pt-4">Dashboard</h1>

				{/* Metric Cards */}
				<DashboardCard data={instructorStats} />

				{/* Charts Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Pie Chart */}
					<div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-center">
						<h2 className="text-lg font-semibold mb-4 text-center">
							Severity Wise Reports
						</h2>
						<div className="h-64">
							<Pie data={pieData} />
						</div>
					</div>

					{/* Bar Chart */}
					<div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-center">
						<h2 className="text-lg font-semibold mb-4 text-center">
							Reports Per Month
						</h2>
						<div className="h-64">
							<Bar data={barData} />
						</div>
					</div>

					{/* Line Chart */}
					<div className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-center">
						<h2 className="text-lg font-semibold mb-4 text-center">
							Resolved Issues Trend
						</h2>
						<div className="h-64">
							<Line data={lineData} />
						</div>
					</div>
				</div>
			</div>
		</PageLayout>
	);
}

export default Dashboard;
