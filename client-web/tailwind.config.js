/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: '#336699',
				'primary-hover': '#2a5a87',
				'primary-active': '#264f78',
				'primary-focus': '#4a90e2',
				'primary-border': '#2a4d6f',
				accent: '#3DB8D1',
				'accent-hover': '#34A3BA',
				'accent-active': '#2F8FA5',
				'accent-focus': '#5EC9DC',
				success: '#16A34A',
				'success-hover': '#15803D',
				warning: '#F59E0B',
				error: '#EF4444',
				background: '#F9FAFB',
				card: '#FFFFFF',
				'hover-bg': '#f0f4f8',
				text: '#111827',
				'text-muted': '#6B7280',
				link: '#0EA5E9',
				'count-bg': '#c9daeb',
				disabled: '#D1D5DB',
				'dark-primary': '#10125a',
			},
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
			},
			animation: {
				'typing': 'typing 2.5s steps(11, end) forwards',
			},
			keyframes: {
				typing: {
					'from': { width: '0' },
					'to': { width: '9ch' },
					'100%': { 'border-color': 'transparent' },
				},
			},
			screens: {
				'lg': '1145px',
			},
		},
	},

	plugins: [require('tailwind-scrollbar-hide')],
};
