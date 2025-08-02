import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoHomeOutline, IoTimeOutline, IoTrophyOutline } from 'react-icons/io5';
import { SiDiscord } from 'react-icons/si';

const BadgeIcon = (
	<svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
		<path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.91z" />
	</svg>
);

const menuItems = [
	{ title: 'Home', icon: <IoHomeOutline color="white" />, to: '/', gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
	{ title: 'History', icon: <IoTimeOutline color="white" />, to: '/history', gradientFrom: '#56CCF2', gradientTo: '#2F80ED' },
	{ title: 'Leaderboard', icon: <IoTrophyOutline color="white" />, to: '/leaderboard', gradientFrom: '#FF9966', gradientTo: '#FF5E62' },
	{ title: 'Discord', icon: <SiDiscord color="white" />, to: 'https://discord.com/invite/somnia', external: true, gradientFrom: '#80FF72', gradientTo: '#7EE8FA' },
	{ title: 'Badge', icon: BadgeIcon, to: '/badge', gradientFrom: '#ffa9c6', gradientTo: '#f434e2' }
];

export default function GradientMenu() {
	const navigate = useNavigate();

	const handleClick = (item: typeof menuItems[0]) => {
		if (item.external) {
			window.open(item.to, '_blank');
		} else {
			navigate(item.to);
		}
	};

	return (
		<nav className="block md:hidden fixed bottom-0 left-0 w-full z-50 bg-transparent">
			<ul className="flex justify-around items-center py-2 bg-transparent backdrop-blur-md shadow-t rounded-t-xl">
				{menuItems.map(({ title, icon, gradientFrom, gradientTo, ...item }, idx) => (
					<li
						key={idx}
						style={{ '--gradient-from': gradientFrom, '--gradient-to': gradientTo } as React.CSSProperties}
						className="group relative w-[50px] h-[50px] bg-transparent shadow-lg rounded-full flex items-center justify-center transition-all duration-500 hover:w-[120px] hover:shadow-none cursor-pointer overflow-hidden"
						onClick={() => handleClick({ title, icon, gradientFrom, gradientTo, ...item })}
						title={title}
					>
						{/* Animated Gradient background on hover */}
						<span className="absolute inset-0 rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:animate-gradient-move" style={{ background: `linear-gradient(120deg, var(--gradient-from), var(--gradient-to), var(--gradient-from))` }}></span>
						{/* Blur glow with animation */}
						<span className="absolute top-[10px] inset-x-0 h-full rounded-full opacity-0 -z-10 transition-all duration-500 group-hover:opacity-50 group-hover:animate-gradient-move" style={{ background: `linear-gradient(120deg, var(--gradient-from), var(--gradient-to), var(--gradient-from))` }}></span>
						{/* Icon */}
						<span className="relative z-10 transition-all duration-500 group-hover:scale-0 delay-0">
							<span className="text-2xl text-gray-500">{icon}</span>
						</span>
						{/* Title */}
						<span className="absolute text-xs left-1/2 -translate-x-1/2 bottom-2 text-white uppercase tracking-wide transition-all duration-500 scale-0 group-hover:scale-100 delay-150">
							{title}
						</span>
					</li>
				))}
			</ul>
			<style>{`
			@keyframes gradient-move {
				0% {
					background-position: 0% 50%;
				}
				100% {
					background-position: 100% 50%;
				}
			}
			.animate-gradient-move {
				background-size: 200% 200%;
				animation: gradient-move 2s linear infinite;
			}
			`}</style>
		</nav>
	);
}
