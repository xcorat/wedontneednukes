import {
	hashQuestionId,
	hashAnswerLabel,
	hashChoiceId,
	assertLabels
} from '$lib/utils/qa-hash';
import type { Question, SingleChoiceQuestion } from '$lib/types/qa';
import type { QuestionCardViewModel } from '$lib/types/qa-ui';

const HERO_TEXT = "We don't need nukes !";
const HERO_LABELS = ['Agree', 'We do | Not sure'];

/**
 * Computes and returns the hero question with stable content-addressed IDs.
 * Call from server seed scripts or initialization.
 * No top-level await.
 */
export async function createHeroQuestion(): Promise<SingleChoiceQuestion> {
	assertLabels(HERO_LABELS, 'single_choice');

	const identity = await hashQuestionId('single_choice', HERO_TEXT, HERO_LABELS);

	return {
		...identity,
		type: 'single_choice',
		text: HERO_TEXT,
		context: 'One fundamental premise. Share your perspective.',
		faq: [
			{
				id: 'a7c39054-e77a-4ec6-89fa-b27e8529e0ef', // Stable UUID, not hashed
				text: 'Why?',
				link: '/why',
				description: 'Read the core premises and scientific background.'
			}
		],
		isActive: true,
		ans: {
			type: 'single_choice',
			choices: [
				{
					id: await hashChoiceId(identity.id, 'Agree'),
					labelHash: await hashAnswerLabel('Agree'),
					value: 'agree',
					label: 'Agree',
					orderIndex: 0
				},
				{
					id: await hashChoiceId(identity.id, 'We do | Not sure'),
					labelHash: await hashAnswerLabel('We do | Not sure'),
					value: 'other',
					label: 'We do | Not sure',
					orderIndex: 1
				}
			]
		}
	};
}

/**
 * Maps the hero question domain entity to UI presentation configuration.
 * Styled by internal value ("agree", "other"), never by opt_ hashes.
 */
export const heroViewModel = (q: Question): QuestionCardViewModel => ({
	question: q,
	ui: {
		layout: 'hero',
		headlineSplit: {
			prefix: "We don't need",
			highlight: 'Nukes !'
		},
		submitBehavior: 'instant',
		choiceStyles: {
			agree: { variant: 'primary' },
			other: { variant: 'secondary' }
		}
	}
});
