import {
	hashQuestionId,
	hashAnswerLabel,
	hashChoiceId,
	assertLabels
} from '$lib/utils/qa-hash';
import type { Question, SingleChoiceQuestion } from '$lib/types/qa';
import type { QuestionCardViewModel } from '$lib/types/qa-ui';

const CIVIC_TEXT = 'What is your primary focus for nuclear disarmament action?';
const CIVIC_LABELS = ['Divestment & Finance', 'Policy & Legislation', 'Community Education'];

/**
 * Factory for the follow-up gated question on strategic action.
 * Single-choice question presented to users on the dashboard once
 * their core stance and commitment tiers are established.
 */
export async function createCivicActionQuestion(): Promise<SingleChoiceQuestion> {
	assertLabels(CIVIC_LABELS, 'single_choice');

	const identity = await hashQuestionId('single_choice', CIVIC_TEXT, CIVIC_LABELS);

	return {
		...identity,
		type: 'single_choice',
		text: CIVIC_TEXT,
		context: 'Help prioritize where our grassroots resources and working groups focus next.',
		faq: [
			{
				id: 'c2e95873-d122-4a2b-c721-e2395932b002',
				text: 'Action Areas',
				link: '/wiki/faq/why',
				description: 'Explore the three strategic pillars of our campaign.'
			}
		],
		isActive: true,
		ans: {
			type: 'single_choice',
			choices: [
				{
					id: await hashChoiceId(identity.id, 'Divestment & Finance'),
					labelHash: await hashAnswerLabel('Divestment & Finance'),
					value: 'divestment',
					label: 'Divestment & Finance',
					description: 'Press banks, pensions, and universities to divest from nuclear weapon contractors.',
					orderIndex: 0
				},
				{
					id: await hashChoiceId(identity.id, 'Policy & Legislation'),
					labelHash: await hashAnswerLabel('Policy & Legislation'),
					value: 'policy',
					label: 'Policy & Legislation',
					description: 'Support nuclear non-proliferation treaties, ICAN policies, and parliamentary bills.',
					orderIndex: 1
				},
				{
					id: await hashChoiceId(identity.id, 'Community Education'),
					labelHash: await hashAnswerLabel('Community Education'),
					value: 'education',
					label: 'Community Education',
					description: 'Organize workshops, film screenings, and university campus teach-ins.',
					orderIndex: 2
				}
			]
		}
	};
}

/**
 * UI presentation config for the civic action question.
 */
export const civicActionViewModel = (q: Question): QuestionCardViewModel => ({
	question: q,
	ui: {
		layout: 'card',
		submitBehavior: 'manual',
		choiceStyles: {
			divestment: {
				variant: 'primary',
				badge: 'Finance'
			},
			policy: {
				variant: 'secondary',
				badge: 'Advocacy'
			},
			education: {
				variant: 'outline',
				badge: 'Community'
			}
		}
	}
});
