import { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

// Create Toast context
const ToastContext = createContext();

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within ToastProvider');
	}
	return context;
};

export function ToastProvider({ children }) {
	const toast = useRef(null);

	const showToast = (severity, summary, detail) => {
		toast.current?.show({ severity, summary, detail, life: 4000 });
	};

	const showSuccess = (summary, detail) => showToast('success', summary, detail);
	const showInfo = (summary, detail) => showToast('info', summary, detail);
	const showWarn = (summary, detail) => showToast('warn', summary, detail);
	const showError = (summary, detail) => showToast('error', summary, detail);

	return (
		<ToastContext.Provider value={{ showSuccess, showInfo, showWarn, showError }}>
			{children}
			<Toast ref={toast} position="top-right" />
		</ToastContext.Provider>
	);
}
