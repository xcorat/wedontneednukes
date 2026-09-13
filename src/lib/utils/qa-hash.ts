/**
 * Content-Addressed Question & Answer Hashing Engine
 * Spec: /data/web/wedontneednukes/docs/tmp/qna_data_design.md
 */

export const QA_HASH_VERSION = 1 as const;
export const QA_HASH_PREFIX = `wdnn-qa-v${QA_HASH_VERSION}` as const;

/**
 * v1 canonicalization rules:
 * 1. Unicode NFC
 * 2. Trim leading/trailing whitespace
 * 3. Collapse whitespace runs to a single space
 * 4. Lowercase
 *
 * NOTE: Punctuation is intentionally NOT stripped in v1.
 */
export function canonicalizeText(input: string): string {
	return input.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Validates question choices before hashing.
 * Rejects empty labels, duplicates post-canonicalization, and insufficient choices.
 */
export function assertLabels(labels: string[], type: 'single_choice' | 'multi_choice'): void {
	if (type === 'single_choice' && labels.length < 2) {
		throw new Error('single_choice requires at least 2 labels');
	}
	if (type === 'multi_choice' && labels.length < 1) {
		throw new Error('multi_choice requires at least 1 label');
	}

	const canonical = labels.map(canonicalizeText);
	if (new Set(canonical).size !== canonical.length) {
		throw new Error(
			'Duplicate labels after canonicalization (e.g. "Agree" and "agree" are the same)'
		);
	}
	if (canonical.some((l) => l.length === 0)) {
		throw new Error('Empty labels are not allowed');
	}
}

/**
 * Encodes a variable-length string as a tagged, length-prefixed field: `tag:length:value`.
 * Eliminates concatenation collisions.
 */
export function field(tag: string, value: string): string {
	return `${tag}:${value.length}:${value}`;
}

/**
 * Joins parts with domain prefix: `wdnn-qa-v1|part1|part2|...`.
 */
export function digestInput(parts: string[]): string {
	return [QA_HASH_PREFIX, ...parts].join('|');
}

/**
 * Isomorphic SHA-256 producing lowercase hex.
 * Operates uniformly across Node.js and Browser runtimes via standard crypto.subtle.
 */
export async function sha256Hex(input: string): Promise<string> {
	const bytes = new TextEncoder().encode(input);
	const buf = await crypto.subtle.digest('SHA-256', bytes);
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Truncates SHA-256 hex digest to specified length (default 24 hex chars / 96 bits).
 */
export async function shortHash(input: string, length = 24): Promise<string> {
	const hex = await sha256Hex(input);
	return hex.slice(0, length);
}

/**
 * Hashes question prompt text into `qt_<24>`.
 */
export async function hashQuestionText(text: string): Promise<string> {
	const c = canonicalizeText(text);
	return `qt_${await shortHash(digestInput([field('qt', c)]))}`;
}

/**
 * Hashes an individual answer label into `al_<24>`.
 */
export async function hashAnswerLabel(label: string): Promise<string> {
	const c = canonicalizeText(label);
	return `al_${await shortHash(digestInput([field('al', c)]))}`;
}

/**
 * Hashes an answer set into `as_<24>` using sorted, unique label hashes.
 * Ensures button ordering does not alter question identity.
 */
export async function hashAnswerSet(labels: string[]): Promise<string> {
	const hashes = await Promise.all(labels.map(hashAnswerLabel));
	const sortedUnique = [...new Set(hashes)].sort();
	const joined = sortedUnique.join(',');
	return `as_${await shortHash(digestInput([field('as', joined)]))}`;
}

/**
 * Sentinel answer set hash for question types without discrete choices (e.g. scale, text).
 */
export async function hashAnswerSetSentinel(type: 'scale' | 'text'): Promise<string> {
	const key = `${type}:∅`;
	return `as_${await shortHash(digestInput([field('as', key)]))}`;
}

/**
 * Computes composite question identity from type, prompt, and answer labels.
 */
export async function hashQuestionId(
	type: 'single_choice' | 'multi_choice' | 'scale' | 'text',
	text: string,
	labels: string[] = []
): Promise<{
	id: string;
	contentSha256: string;
	textHash: string;
	answerSetHash: string;
	hashVersion: 1;
}> {
	if (type === 'single_choice' || type === 'multi_choice') {
		assertLabels(labels, type);
	}

	const textHash = await hashQuestionText(text);
	const answerSetHash =
		type === 'scale' || type === 'text'
			? await hashAnswerSetSentinel(type)
			: await hashAnswerSet(labels);

	const payload = digestInput(['qa', type, textHash, answerSetHash]);
	const fullSha = await sha256Hex(payload);

	return {
		id: `q_${fullSha.slice(0, 24)}`,
		contentSha256: fullSha,
		textHash,
		answerSetHash,
		hashVersion: 1
	};
}

/**
 * Hashes an internal choice ID scoped to the parent question ID into `opt_<16>`.
 */
export async function hashChoiceId(questionId: string, label: string): Promise<string> {
	const labelHash = await hashAnswerLabel(label);
	return `opt_${await shortHash(digestInput(['opt', questionId, labelHash]), 16)}`;
}
