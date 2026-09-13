export type Theme = 'classic' | 'game' | 'compact' | 'minimal' | 'dark';

export interface ThemeOption {
	id: Theme;
	name: string;
	description: string;
	badge: string;
	preview: {
		font: string;
		radius: string;
		shadow: string;
	};
}

export const THEMES: ThemeOption[] = [
	{
		id: 'classic',
		name: 'Classic Neo-Brutal',
		description: 'Default high-contrast style with 4px offset shadow and Poppins font.',
		badge: 'Default',
		preview: {
			font: 'Poppins',
			radius: '0px',
			shadow: '4px 4px'
		}
	},
	{
		id: 'game',
		name: 'Rounded 2D Game',
		description: 'Fredoka font, friendly 16px curves, and flat vertical platformer drop shadow.',
		badge: 'Playful',
		preview: {
			font: 'Fredoka',
			radius: '16px',
			shadow: '0 4px flat'
		}
	},
	{
		id: 'compact',
		name: 'Compact Neo-Brutal',
		description: 'Ultra-tight 1.5px/2px shadows with maximum density and zero waste.',
		badge: 'Dense',
		preview: {
			font: 'Poppins',
			radius: '0px',
			shadow: '2px 2px'
		}
	},
	{
		id: 'minimal',
		name: 'Clean Flat Minimal',
		description: 'Crisp borders, subtle 8px corners, zero heavy drop shadows.',
		badge: 'Clean',
		preview: {
			font: 'Poppins',
			radius: '8px',
			shadow: 'none'
		}
	},
	{
		id: 'dark',
		name: 'Midnight Dark',
		description: 'Dark canvas with crisp contrast borders and saturated pop accents.',
		badge: 'Dark',
		preview: {
			font: 'Poppins',
			radius: '4px',
			shadow: '4px 4px'
		}
	}
];

class ThemeManager {
	current = $state<Theme>('classic');

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('app-theme') as Theme;
			if (saved && THEMES.some((t) => t.id === saved)) {
				this.current = saved;
				if (saved !== 'classic') {
					document.documentElement.setAttribute('data-theme', saved);
				}
			}
		}
	}

	setTheme(theme: Theme) {
		this.current = theme;
		if (typeof window !== 'undefined') {
			localStorage.setItem('app-theme', theme);
			if (theme === 'classic') {
				document.documentElement.removeAttribute('data-theme');
			} else {
				document.documentElement.setAttribute('data-theme', theme);
			}
		}
	}
}

export const themeState = new ThemeManager();
