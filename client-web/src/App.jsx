import { RouterProvider } from 'react-router-dom';
import StandardErrorBoundary from './components/StandardErrorBoundary';
import routes from './routes';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
	const { userId } = useAuth();

	return <RouterProvider router={routes} />;
}

function App() {
	return (
		<StandardErrorBoundary>
			<AuthProvider>
				<AppContent />
			</AuthProvider>
		</StandardErrorBoundary>
	);
}

export default App;
