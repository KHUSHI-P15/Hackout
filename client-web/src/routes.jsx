import { createBrowserRouter } from 'react-router-dom';
import { loginLoader, verifyLoader } from './loaders/verify.loader';
import ErrorElement from './components/ErrorElement';
// import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Registration';
import ForgotPassword from './pages/auth/ForgetPassword';
import CitizenDashboard from './pages/citizens/Dashboard';
import NGOReportsPage from './pages/ngo/VerifyReports';
import NGODashboard from './pages/ngo/Dashboard';
import CommunityPage from './pages/ngo/Community';
import History from './pages/citizens/History';
const routes = createBrowserRouter([
	{
		path: '/',
		loader: loginLoader,
		element: <Login />,
	},
	{
		path: '/login',
		loader: loginLoader,
		element: <Login />,
	},
	{
		path: '/register',
		loader: loginLoader,
		element: <Register />,
	},
	{
		path: '/forgot-password',
		loader: loginLoader,
		element: <ForgotPassword />,
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
			{ path: 'community', element: <CommunityPage /> },
			// { path: 'institute/:id/departments', element: <AdminDepartment /> },
			// {
			// 	path: 'institute/:instituteId/department/:departmentId',
			// 	element: <FacultyAndStudentList />,
			// },
		],
	},
	// Catch all
	{
		path: '*',
		element: <ErrorElement />,
	},
]);

export default routes;
