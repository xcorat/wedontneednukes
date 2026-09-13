import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadWikiManifest } from '../src/lib/wiki/manifest.js';

describe('Wiki manifest loader', () => {
	it('loads the precompiled static manifest without network fetch', async () => {
		const manifest = await loadWikiManifest();
		assert.ok(manifest);
		assert.ok(Array.isArray(manifest.entries));
		assert.ok(manifest.entries.length > 0);
		assert.ok(typeof manifest.generatedAt === 'string');

		const whyEntry = manifest.entries.find((e) => e.slug === 'why');
		assert.ok(whyEntry, 'Expected "why" entry in manifest');
		assert.equal(whyEntry.category, 'Premise');
	});

	it('returns manifest even when fetch parameter is provided', async () => {
		const dummyFetch: typeof globalThis.fetch = async () => {
			throw new Error('Network should not be called when bundled manifest is available');
		};

		const manifest = await loadWikiManifest(dummyFetch);
		assert.ok(manifest);
		assert.ok(manifest.entries.length > 0);
	});
});
