import 'primeicons/primeicons.css';

function getLightBgFromTextColor(textColor) {
	if (!textColor?.startsWith('text-')) return 'bg-gray-50';
	const colorParts = textColor.replace('text-', '').split('-');
	if (colorParts.length < 2) return 'bg-gray-50';
	return `bg-${colorParts[0]}-50`;
}

export default function DashboardCard({ data = [] }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50">
			{data.map((card, idx) => {
				const bgColorClass = getLightBgFromTextColor(card.color);

				return (
					<div
						key={idx}
						className={`relative w-full h-32 rounded-xl shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105 ${bgColorClass}`}
					>
						<div className="p-4 pb-6 z-10 relative h-full flex flex-col justify-between">
							<div className={`flex items-center gap-3 ${card.color}`}>
								<i className={`pi ${card.icon} text-xl`}></i>
								<span className="uppercase text-sm font-semibold pt-1 pb-2">
									{card.label}
								</span>
							</div>
							<div className="text-3xl font-bold text-gray-800 pb-4">{card.value}</div>
						</div>

						<svg
							className="absolute bottom-0 left-0 w-full h-12"
							viewBox="0 0 1440 320"
							preserveAspectRatio="none"
						>
							<defs>
								<linearGradient id={`grad-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
									<stop offset="0%" stopColor={card.gradientFrom || '#93c5fd'} />
									<stop offset="100%" stopColor={card.gradientTo || '#60a5fa'} />
								</linearGradient>
							</defs>
							<path
								fill={`url(#grad-${idx})`}
								d="M0,64L80,106.7C160,149,320,235,480,240C640,245,800,171,960,144C1120,117,1280,139,1360,149.3L1440,160L1440,320L0,320Z"
							/>
						</svg>
					</div>
				);
			})}
		</div>
	);
}
