import { createBrowserRouter } from 'react-router-dom';
// import { loginLoader, verifyLoader } from './loaders/verify.loader';
import ErrorElement from './components/ErrorElement';
// import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Registration';
import ForgotPassword from './pages/auth/ForgetPassword';
import CitizenDashboard from './pages/citizens/Dashboard';
import CreateReport from './pages/citizens/createReport';
import NGOReportsPage from './pages/ngo/VerifyReports';
import NGODashboard from './pages/ngo/Dashboard';
import CommunityPage from './pages/ngo/Community';
import History from './pages/citizens/History';
import HomePage from './pages/HomePage';
import ResolveReport from './pages/government/ResolveReport';
import Dashboard from './pages/government/Dashboard';
import DataInsights from './pages/government/DataInsights';
import Leaderboard from './pages/Leaderboard';


const routes = createBrowserRouter([
	{
		path: '/',
		// loader: loginLoader,
		element: <Login />,
	},
	{
		path: '/login',
		// loader: loginLoader,
		element: <Login />,
	},
	{
		path: '/register',
		// loader: loginLoader,
		element: <Register />,
	},
	{
		path: '/forgot-password',
		// loader: loginLoader,
		element: <ForgotPassword />,
	},
	{
		path: '/home',
		element: <HomePage />,
	},
	{
		path: '/leaderboard',
		element: <Leaderboard />,
	},
		{
		path: '/community',
		element: <CommunityPage />,
	},
	// Admin routes
	// {
	// 	path: '/admin',
	// 	loader: verifyLoader('admin'),
	// 	errorElement: <ErrorElement />,
	// 	children: [
	// 		// { path: 'dashboard', element: <AdminDashboard /> },
	// 		// { path: 'institute', element: <InstituteList /> },
	// 		// { path: 'institute/:id/departments', element: <AdminDepartment /> },
	// 		// {
	// 		// 	path: 'institute/:instituteId/department/:departmentId',
	// 		// 	element: <FacultyAndStudentList />,
	// 		// },
	// 	],
	// },
	{
		path: '/citizen',
		// loader: verifyLoader('citizen'),
		errorElement: <ErrorElement />,
		children: [
			{ path: 'dashboard', element: <CitizenDashboard /> },
			{ path: 'add-report', element: <CreateReport /> },
			{ path: 'history', element: <History /> },
			// { path: 'institute/:id/departments', element: <AdminDepartment /> },
			// {
			// 	path: 'institute/:instituteId/department/:departmentId',
			// 	element: <FacultyAndStudentList />,
			// },
		],
	},
	{
		path: '/ngo',
		// loader: verifyLoader('citizen'),
		errorElement: <ErrorElement />,
		children: [
			{ path: 'dashboard', element: <NGODashboard /> },
			{ path: 'verify-reports', element: <NGOReportsPage /> },
			// { path: 'community', element: <CommunityPage /> },
			// { path: 'institute/:id/departments', element: <AdminDepartment /> },
			// {
			// 	path: 'institute/:instituteId/department/:departmentId',
			// 	element: <FacultyAndStudentList />,
			// },
		],
	},
	{
		path: '/government',
		// loader: verifyLoader('citizen'),
		errorElement: <ErrorElement />,
		children: [
			{ path: 'dashboard', element: <Dashboard /> },
			{ path: 'resolve-reports', element: <ResolveReport /> },
			{ path: 'data-insights', element: <DataInsights /> },
		],
	},
	// Catch all
	{
		path: '*',
		element: <ErrorElement />,
	},
]);

export default routes;
