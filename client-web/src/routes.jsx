import { createBrowserRouter } from 'react-router-dom';
import { loginLoader, verifyLoader } from './loaders/verify.loader';
import ErrorElement from './components/ErrorElement';
// import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Registration';
import ForgotPassword from './pages/auth/ForgetPassword';
import CitizenDashboard from './pages/citizens/Dashboard';
import CreateReport from './pages/citizens/createReport';
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
			// { path: 'institute', element: <InstituteList /> },
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
