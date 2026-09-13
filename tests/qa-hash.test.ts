import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	canonicalizeText,
	assertLabels,
	hashQuestionText,
	hashAnswerLabel,
	hashAnswerSet,
	hashAnswerSetSentinel,
	hashQuestionId,
	hashChoiceId,
	digestInput,
	shortHash
} from '../src/lib/utils/qa-hash.js';

describe('Q/A Content-Addressed Hashing Invariants', () => {
	const prompt = "We don't need nukes !";
	const choices = ['Agree', 'We do | Not sure'];

	it('1. Same input produces identical id, textHash, answerSetHash', async () => {
		const res1 = await hashQuestionId('single_choice', prompt, choices);
		const res2 = await hashQuestionId('single_choice', prompt, choices);
		assert.equal(res1.id, res2.id);
		assert.equal(res1.textHash, res2.textHash);
		assert.equal(res1.answerSetHash, res2.answerSetHash);
		assert.equal(res1.contentSha256, res2.contentSha256);
		assert.equal(res1.hashVersion, 1);
	});

	it('2. Prompt change updates textHash and id; answerSetHash is unchanged', async () => {
		const base = await hashQuestionId('single_choice', prompt, choices);
		const updated = await hashQuestionId('single_choice', 'Should we phase out nukes?', choices);
		assert.notEqual(updated.textHash, base.textHash);
		assert.notEqual(updated.id, base.id);
		assert.equal(updated.answerSetHash, base.answerSetHash);
	});

	it('3. One label change updates answerSetHash and id; textHash is unchanged', async () => {
		const base = await hashQuestionId('single_choice', prompt, choices);
		const updated = await hashQuestionId('single_choice', prompt, ['Strongly Agree', 'We do | Not sure']);
		assert.notEqual(updated.answerSetHash, base.answerSetHash);
		assert.notEqual(updated.id, base.id);
		assert.equal(updated.textHash, base.textHash);
	});

	it('4. Swapping choice order does not alter answerSetHash or id', async () => {
		const res1 = await hashQuestionId('single_choice', prompt, ['Agree', 'We do | Not sure']);
		const res2 = await hashQuestionId('single_choice', prompt, ['We do | Not sure', 'Agree']);
		assert.equal(res1.answerSetHash, res2.answerSetHash);
		assert.equal(res1.id, res2.id);
	});

	it('5. Same text and labels with different type produces different id only', async () => {
		const single = await hashQuestionId('single_choice', prompt, choices);
		const multi = await hashQuestionId('multi_choice', prompt, choices);
		assert.equal(single.textHash, multi.textHash);
		assert.equal(single.answerSetHash, multi.answerSetHash);
		assert.notEqual(single.id, multi.id);
	});

	it('6. Whitespace canonicalization collapses runs and trims', async () => {
		const h1 = await hashQuestionText("  We   don't need nukes ! ");
		const h2 = await hashQuestionText(prompt);
		assert.equal(h1, h2);
		assert.equal(canonicalizeText("  Foo   Bar \n Baz "), "foo bar baz");
	});

	it('7. Punctuation is preserved in v1 canonicalization', async () => {
		const h1 = await hashQuestionText("We don't need nukes !");
		const h2 = await hashQuestionText("We don't need nukes!");
		assert.notEqual(h1, h2);
	});

	it('8. Tagged length prefixing prevents label boundary concatenation collisions', async () => {
		const setA = await hashAnswerSet(['a|b', 'c']);
		const setB = await hashAnswerSet(['a', 'b|c']);
		assert.notEqual(setA, setB);
	});

	it('9. choiceId is scoped to questionId and labelHash', async () => {
		const q1 = 'q_111111111111111111111111';
		const q2 = 'q_222222222222222222222222';
		const c1 = await hashChoiceId(q1, 'Agree');
		const c2 = await hashChoiceId(q2, 'Agree');
		assert.notEqual(c1, c2);
		assert.ok(c1.startsWith('opt_'));
		assert.equal(c1.length, 4 + 16); // 'opt_' + 16 hex chars = 20
	});

	it('10. Digest input prefix ensures domain separation', async () => {
		const originalInput = digestInput(['test']);
		assert.ok(originalInput.startsWith('wdnn-qa-v1|'));
		const customInput = ['other-prefix-v1', 'test'].join('|');
		const h1 = await shortHash(originalInput);
		const h2 = await shortHash(customInput);
		assert.notEqual(h1, h2);
	});

	it('11. Scale and text answerSetHash sentinels differ from each other and choice sets', async () => {
		const scale = await hashAnswerSetSentinel('scale');
		const text = await hashAnswerSetSentinel('text');
		const choiceSet = await hashAnswerSet(['Agree', 'We do | Not sure']);
		assert.notEqual(scale, text);
		assert.notEqual(scale, choiceSet);
		assert.notEqual(text, choiceSet);
	});

	it('12. Validation rejects invalid choice label configurations', () => {
		// single_choice with fewer than 2 choices
		assert.throws(() => assertLabels(['Only one'], 'single_choice'), /at least 2 labels/);

		// multi_choice with 0 choices
		assert.throws(() => assertLabels([], 'multi_choice'), /at least 1 label/);

		// duplicate post-canonicalization labels
		assert.throws(() => assertLabels(['Agree', 'agree'], 'single_choice'), /Duplicate labels/);
		assert.throws(() => assertLabels(['  Yes  ', 'yes'], 'single_choice'), /Duplicate labels/);

		// empty label
		assert.throws(() => assertLabels(['Agree', '   '], 'single_choice'), /Empty labels/);
	});
});
