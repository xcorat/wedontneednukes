import type { Question } from './qa';

export type QuestionCardLayout = 'hero' | 'card' | 'compact' | 'stacked';

export interface ChoiceUIProps {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
	badge?: string;
	icon?: string;
}

export interface QuestionUIProps {
	layout: QuestionCardLayout;
	headlineSplit?: {
		prefix: string; // "We don't need"
		highlight: string; // "Nukes !"
	};
	submitBehavior?: 'instant' | 'manual';
	choiceStyles?: Record<string, ChoiceUIProps>; // Keyed by choice value: "agree", "other"
}

export interface QuestionCardViewModel {
	question: Question;
	ui: QuestionUIProps;
}
