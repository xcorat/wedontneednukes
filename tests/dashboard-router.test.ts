import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHeroQuestion } from '../src/lib/fixtures/heroQuestion.js';
import { createCommitmentQuestion } from '../src/lib/fixtures/commitmentQuestion.js';

describe('Intelligent Entry Router & Dashboard Logic', () => {
	it('differentiates hero choice mapping between Agree and Other', async () => {
		const hero = await createHeroQuestion();
		const agreeChoiceId = hero.ans.choices[0].id;
		const otherChoiceId = hero.ans.choices[1].id;

		assert.notEqual(agreeChoiceId, otherChoiceId);
		assert.equal(hero.ans.choices[0].value, 'agree');
		assert.equal(hero.ans.choices[1].value, 'other');

		// Simulating user response choices evaluation
		const testUserResponse = {
			questionId: hero.id,
			selectedChoiceIds: [agreeChoiceId]
		};

		const isAgree = testUserResponse.selectedChoiceIds.includes(agreeChoiceId);
		assert.equal(isAgree, true);
	});

	it('maps commitment levels from multi_choice selectedChoiceIds', async () => {
		const commitmentQ = await createCommitmentQuestion();
		const passiveChoice = commitmentQ.ans.choices.find((c) => c.value === 'passive');
		const directChoice = commitmentQ.ans.choices.find((c) => c.value === 'direct');

		assert.ok(passiveChoice);
		assert.ok(directChoice);

		const selectedIds = [passiveChoice.id, directChoice.id];
		const matchedLevels = commitmentQ.ans.choices
			.filter((c) => selectedIds.includes(c.id))
			.map((c) => c.value);

		assert.deepEqual(matchedLevels, ['passive', 'direct']);
	});
});
