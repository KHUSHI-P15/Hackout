import React, { useEffect, useState, useRef } from 'react';
import { Globe } from 'lucide-react';

function GoogleTranslate() {
	const [loaded, setLoaded] = useState(false);
	const buttonRef = useRef(null);

	useEffect(() => {
		// Load Google Translate script only once
		if (!document.querySelector('#google-translate-script')) {
			const addScript = document.createElement('script');
			addScript.id = 'google-translate-script';
			addScript.src =
				'//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
			addScript.async = true;
			document.body.appendChild(addScript);
		}

		// Init function for Google Translate
		window.googleTranslateElementInit = () => {
			new window.google.translate.TranslateElement(
				{
					pageLanguage: 'en',
					includedLanguages: 'en,hi,gu,fr,de,es',
					layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
				},
				'google_translate_element'
			);
			setLoaded(true);
		};
	}, []);

	// Force iframe under button
	const positionIframe = () => {
		const iframe = document.querySelector('iframe.goog-te-menu-frame');
		const button = buttonRef.current;

		if (iframe && button) {
			const rect = button.getBoundingClientRect();

			iframe.style.position = 'absolute';
			iframe.style.top = `${rect.bottom + window.scrollY + 8}px`;
			iframe.style.left = `${rect.left + window.scrollX}px`;
			iframe.style.zIndex = '9999';
			iframe.style.display = 'block';
			iframe.style.opacity = '1';
			iframe.style.visibility = 'visible';

			// also set width if needed
			iframe.style.width = '200px';
		}
	};

	const handleOpenTranslate = () => {
		const dropdown = document.querySelector('.goog-te-gadget-simple');
		if (dropdown) {
			dropdown.click();
		}

		// Wait for iframe to render, then move it
		setTimeout(positionIframe, 200);
	};

	// Reposition iframe on scroll/resize
	useEffect(() => {
		const onScrollOrResize = () => positionIframe();
		window.addEventListener('scroll', onScrollOrResize);
		window.addEventListener('resize', onScrollOrResize);
		return () => {
			window.removeEventListener('scroll', onScrollOrResize);
			window.removeEventListener('resize', onScrollOrResize);
		};
	}, []);

	return (
		<div className="flex items-center relative">
			{/* Hidden Google Translate widget */}
			<div
				id="google_translate_element"
				className="absolute left-[-9999px] top-[-9999px]"
			></div>

			{/* Custom Button */}
			{loaded && (
				<button
					ref={buttonRef}
					onClick={handleOpenTranslate}
					className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-gray-300 shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 text-[#336699] text-sm font-medium"
				>
					<Globe size={18} />
					<span className="hidden sm:inline">Translate</span>
				</button>
			)}
		</div>
	);
}

export default GoogleTranslate;
