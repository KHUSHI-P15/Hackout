import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
			manifest: {
				name: 'Hackout',
				short_name: 'Hackout',
				start_url: '.',
				display: 'standalone',
				background_color: '#ffffff',
				theme_color: '#000000',
				icons: [
					{
						src: 'pwa.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa.png',
						sizes: '512x512',
						type: 'image/png',
					},
				],
			},
		}),
	],
});
