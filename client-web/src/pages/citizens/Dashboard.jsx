import DashboardCard from '../../components/dashboard/CountCards';
import PageLayout from '../../components/layout/PageLayout';

const instructorStats = [
	{
		label: 'Total Courses',
		value: 8,
		icon: 'pi pi-book',
		color: 'text-blue-500',
		gradientFrom: '#bfdbfe',
		gradientTo: '#60a5fa',
	},
	{
		label: 'Total Enrollments',
		value: 230,
		icon: 'pi pi-users',
		color: 'text-green-500',
		gradientFrom: '#bbf7d0',
		gradientTo: '#4ade80',
	},
	{
		label: 'Average Rating',
		value: 2,
		icon: 'pi pi-star',
		color: 'text-yellow-500',
		gradientFrom: '#fef9c3',
		gradientTo: '#facc15',
	},
	{
		label: 'Total Reviews',
		value: 34,
		icon: 'pi pi-comment',
		color: 'text-pink-500',
		gradientFrom: '#fbcfe8',
		gradientTo: '#f472b6',
	},
];

function App() {
	return (
		<PageLayout>
			<div className="w-full">
				<h1 className="text-4xl font-bold mb-6 text-[#336699]">Dashboard</h1>
				<DashboardCard data={instructorStats} />
			</div>
		</PageLayout>
	);
}

export default App;
