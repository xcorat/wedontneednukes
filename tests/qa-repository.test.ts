import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHeroQuestion, heroViewModel } from '../src/lib/fixtures/heroQuestion.js';
import { rehydrateQuestion } from '../src/lib/server/qa/repository.js';
import type { QuestionRecord, QuestionChoiceRecord } from '../src/lib/server/db/schema.js';

describe('Hero Question Fixture & UI View Model', () => {
	it('generates valid heroQuestion with content-addressed IDs', async () => {
		const hero = await createHeroQuestion();

		assert.equal(hero.type, 'single_choice');
		assert.equal('slug' in hero, false); // slug is on campaign_question, not question
		assert.equal(hero.text, "We don't need nukes !");
		assert.ok(hero.id.startsWith('q_'));
		assert.equal(hero.id.length, 2 + 24); // 'q_' + 24 hex
		assert.ok(hero.textHash.startsWith('qt_'));
		assert.ok(hero.answerSetHash.startsWith('as_'));
		assert.equal(hero.contentSha256.length, 64);
		assert.equal(hero.hashVersion, 1);
		assert.equal(hero.isActive, true);

		// Verify choices
		assert.equal(hero.ans.choices.length, 2);
		const [c1, c2] = hero.ans.choices;

		assert.equal(c1.value, 'agree');
		assert.equal(c1.label, 'Agree');
		assert.ok(c1.id.startsWith('opt_'));
		assert.ok(c1.labelHash.startsWith('al_'));

		assert.equal(c2.value, 'other');
		assert.equal(c2.label, 'We do | Not sure');
		assert.ok(c2.id.startsWith('opt_'));
		assert.ok(c2.labelHash.startsWith('al_'));

		// Verify FAQ
		assert.ok(Array.isArray(hero.faq));
		assert.equal(hero.faq?.length, 1);
		assert.equal(hero.faq?.[0].link, '/why');
	});

	it('maps heroViewModel with UI styling keyed by value', async () => {
		const hero = await createHeroQuestion();
		const vm = heroViewModel(hero);

		assert.equal(vm.ui.layout, 'hero');
		assert.deepEqual(vm.ui.headlineSplit, { prefix: "We don't need", highlight: 'Nukes !' });
		assert.equal(vm.ui.submitBehavior, 'instant');

		// choiceStyles keyed by value ('agree', 'other'), never by opt_ hashes
		assert.equal(vm.ui.choiceStyles?.agree?.variant, 'primary');
		assert.equal(vm.ui.choiceStyles?.other?.variant, 'secondary');
		if (hero.type === 'single_choice') {
			assert.equal(vm.ui.choiceStyles?.[hero.ans.choices[0].id], undefined);
		}
	});
});

describe('Question Rehydration from DB Rows', () => {
	it('rehydrates single_choice question with ordered choices', () => {
		const now = new Date();
		const qRow: QuestionRecord = {
			id: 'q_test12345678901234567890',
			contentSha256: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
			textHash: 'qt_123456789012345678901234',
			answerSetHash: 'as_123456789012345678901234',
			hashVersion: 1,
			type: 'single_choice',
			text: 'Test Question?',
			context: 'Test context',
			faqJson: [{ id: 'uuid-1', text: 'FAQ 1', link: '/faq1' }],
			extraConfigJson: null,
			isActive: true,
			createdAt: now,
			updatedAt: now
		};

		const choiceRows: QuestionChoiceRecord[] = [
			{
				id: 'opt_choice2',
				questionId: qRow.id,
				labelHash: 'al_222222222222222222222222',
				value: 'no',
				label: 'No',
				description: null,
				orderIndex: 1
			},
			{
				id: 'opt_choice1',
				questionId: qRow.id,
				labelHash: 'al_111111111111111111111111',
				value: 'yes',
				label: 'Yes',
				description: 'Affirmative',
				orderIndex: 0
			}
		];

		const q = rehydrateQuestion(qRow, choiceRows);
		assert.equal(q.type, 'single_choice');
		assert.equal(q.ans.choices.length, 2);
		// Verified orderIndex sorting: opt_choice1 is first
		assert.equal(q.ans.choices[0].id, 'opt_choice1');
		assert.equal(q.ans.choices[0].label, 'Yes');
		assert.equal(q.ans.choices[1].id, 'opt_choice2');
		assert.equal(q.ans.choices[1].label, 'No');
	});

	it('rehydrates multi_choice question with min/max selections', () => {
		const now = new Date();
		const qRow: QuestionRecord = {
			id: 'q_multi1234567890123456789',
			contentSha256: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
			textHash: 'qt_123456789012345678901234',
			answerSetHash: 'as_123456789012345678901234',
			hashVersion: 1,
			type: 'multi_choice',
			text: 'Select tiers',
			context: null,
			faqJson: null,
			extraConfigJson: { minSelections: 1, maxSelections: 3 },
			isActive: true,
			createdAt: now,
			updatedAt: now
		};

		const q = rehydrateQuestion(qRow, []);
		assert.equal(q.type, 'multi_choice');
		if (q.type === 'multi_choice') {
			assert.equal(q.ans.minSelections, 1);
			assert.equal(q.ans.maxSelections, 3);
		}
	});

	it('rehydrates scale question with boundaries', () => {
		const now = new Date();
		const qRow: QuestionRecord = {
			id: 'q_scale1234567890123456789',
			contentSha256: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
			textHash: 'qt_123456789012345678901234',
			answerSetHash: 'as_scale_sentinel',
			hashVersion: 1,
			type: 'scale',
			text: 'Rate your concern',
			context: null,
			faqJson: null,
			extraConfigJson: { min: 1, max: 5, step: 1 },
			isActive: true,
			createdAt: now,
			updatedAt: now
		};

		const q = rehydrateQuestion(qRow, []);
		assert.equal(q.type, 'scale');
		if (q.type === 'scale') {
			assert.equal(q.ans.min, 1);
			assert.equal(q.ans.max, 5);
			assert.equal(q.ans.step, 1);
		}
	});
});
