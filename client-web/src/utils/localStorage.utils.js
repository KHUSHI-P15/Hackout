/**
 * Safely get and parse JSON data from localStorage
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - Default value to return if parsing fails or key doesn't exist
 * @returns {any} Parsed data or default value
 */
export const getStoredData = (key, defaultValue = null) => {
	try {
		const item = localStorage.getItem(key);
		if (!item || item === 'null' || item === 'undefined') {
			return defaultValue;
		}
		return JSON.parse(item);
	} catch (error) {
		console.warn(`Failed to parse localStorage data for key "${key}":`, error);
		return defaultValue;
	}
};

/**
 * Safely set JSON data to localStorage
 * @param {string} key - The localStorage key
 * @param {any} value - The value to store
 */
export const setStoredData = (key, value) => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error(`Failed to store data in localStorage for key "${key}":`, error);
	}
};

/**
 * Safely remove item from localStorage
 * @param {string} key - The localStorage key to remove
 */
export const removeStoredData = (key) => {
	try {
		localStorage.removeItem(key);
	} catch (error) {
		console.error(`Failed to remove localStorage item for key "${key}":`, error);
	}
};

/**
 * Clear all localStorage data safely
 */
export const clearStoredData = () => {
	try {
		localStorage.clear();
	} catch (error) {
		console.error('Failed to clear localStorage:', error);
	}
};
