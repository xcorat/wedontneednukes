import {
	hashQuestionId,
	hashAnswerLabel,
	hashChoiceId,
	assertLabels
} from '$lib/utils/qa-hash';
import type { Question, MultiChoiceQuestion } from '$lib/types/qa';
import type { QuestionCardViewModel } from '$lib/types/qa-ui';

const COMMITMENT_TEXT = 'How would you like to participate?';
const COMMITMENT_LABELS = ['Passive Ally', 'Active Advocate', 'Direct Contributor'];

/**
 * Factory for the campaign commitment tiers question.
 * Multi-choice question allowing selection of participation tiers.
 */
export async function createCommitmentQuestion(): Promise<MultiChoiceQuestion> {
	assertLabels(COMMITMENT_LABELS, 'multi_choice');

	const identity = await hashQuestionId('multi_choice', COMMITMENT_TEXT, COMMITMENT_LABELS);

	return {
		...identity,
		type: 'multi_choice',
		text: COMMITMENT_TEXT,
		context: 'Select all pledge tiers that fit your level of involvement.',
		faq: [
			{
				id: 'b1e84762-c011-4f1a-b610-d1294821a001',
				text: 'Pledge Guide',
				link: '/wiki/faq/why',
				description: 'Learn about our commitment levels and expectations.'
			}
		],
		isActive: true,
		ans: {
			type: 'multi_choice',
			minSelections: 1,
			choices: [
				{
					id: await hashChoiceId(identity.id, 'Passive Ally'),
					labelHash: await hashAnswerLabel('Passive Ally'),
					value: 'passive',
					label: 'Passive Ally',
					description: 'Stay informed, share our updates, and sign petitions.',
					orderIndex: 0
				},
				{
					id: await hashChoiceId(identity.id, 'Active Advocate'),
					labelHash: await hashAnswerLabel('Active Advocate'),
					value: 'active',
					label: 'Active Advocate',
					description: 'Engage with local representatives and participate in campaigns.',
					orderIndex: 1
				},
				{
					id: await hashChoiceId(identity.id, 'Direct Contributor'),
					labelHash: await hashAnswerLabel('Direct Contributor'),
					value: 'direct',
					label: 'Direct Contributor',
					description: 'Contribute resources, organize events, or join working groups.',
					orderIndex: 2
				}
			]
		}
	};
}

/**
 * UI presentation config for the commitment question.
 */
export const commitmentViewModel = (q: Question): QuestionCardViewModel => ({
	question: q,
	ui: {
		layout: 'card',
		submitBehavior: 'manual',
		choiceStyles: {
			passive: {
				variant: 'outline',
				badge: 'Inform'
			},
			active: {
				variant: 'outline',
				badge: 'Advocate'
			},
			direct: {
				variant: 'primary',
				badge: 'Organize'
			}
		}
	}
});
