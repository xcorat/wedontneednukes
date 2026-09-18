import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getAIConfig, DEFAULT_OPENAI_MODEL, SYSTEM_PROMPT } from '../src/lib/server/config/ai.js';
import { STARTER_PROMPTS } from '../src/lib/config/chat.js';
import { DOCUMENT_METADATA_MAP, getFriendlyDocumentInfo } from '../src/lib/config/documents.js';
import { OFFICIAL_CHANNELS, DEFAULT_SHARE_HASHTAGS, buildShareUrl } from '../src/lib/config/social.js';
import { getEmailConfig, DEFAULT_EMAIL_FROM, MAGIC_LINK_EMAIL_SUBJECT } from '../src/lib/server/config/email.js';

describe('AI Server Configuration', () => {
	it('defaults to DEFAULT_OPENAI_MODEL when no env override is provided', () => {
		const originalEnv = process.env.OPENAI_MODEL;
		delete process.env.OPENAI_MODEL;
		try {
			const config = getAIConfig();
			assert.equal(config.model, DEFAULT_OPENAI_MODEL);
			assert.equal(config.model, 'gpt-5-nano');
			assert.equal(config.systemPrompt, SYSTEM_PROMPT);
			assert.ok(config.systemPrompt.includes('WeDon\'t Need Nukes'));
		} finally {
			if (originalEnv) process.env.OPENAI_MODEL = originalEnv;
		}
	});

	it('respects platform.env.OPENAI_MODEL override when provided', () => {
		const config = getAIConfig({ OPENAI_MODEL: 'gpt-5-mini-custom' } as any);
		assert.equal(config.model, 'gpt-5-mini-custom');
	});

	it('respects process.env.OPENAI_MODEL override when provided', () => {
		const originalEnv = process.env.OPENAI_MODEL;
		process.env.OPENAI_MODEL = 'gpt-5-pro-override';
		try {
			const config = getAIConfig();
			assert.equal(config.model, 'gpt-5-pro-override');
		} finally {
			if (originalEnv !== undefined) {
				process.env.OPENAI_MODEL = originalEnv;
			} else {
				delete process.env.OPENAI_MODEL;
			}
		}
	});
});

describe('Starter Prompts Configuration', () => {
	it('provides a non-empty array of starter prompts', () => {
		assert.ok(Array.isArray(STARTER_PROMPTS));
		assert.ok(STARTER_PROMPTS.length >= 4);
		for (const prompt of STARTER_PROMPTS) {
			assert.equal(typeof prompt, 'string');
			assert.ok(prompt.length > 10);
		}
	});
});

describe('Document Metadata & URL Configuration', () => {
	it('contains 12 research documents with valid metadata and URLs', () => {
		const entries = Object.entries(DOCUMENT_METADATA_MAP);
		assert.equal(entries.length, 12);

		for (const [filename, info] of entries) {
			assert.ok(filename.endsWith('.pdf'), `${filename} should end with .pdf`);
			assert.ok(info.title, `Missing title for ${filename}`);
			assert.ok(info.organization, `Missing organization for ${filename}`);
			assert.ok(info.category, `Missing category for ${filename}`);
			assert.ok(info.year, `Missing year for ${filename}`);
			assert.ok(info.description, `Missing description for ${filename}`);
			assert.ok(info.url, `Missing url for ${filename}`);
			assert.ok(info.url.startsWith('https://'), `URL should start with https:// for ${filename}`);
		}
	});

	it('resolves friendly document info with fallback for unknown files', () => {
		const known = getFriendlyDocumentInfo('YB26 08 World Nuclear Forces.pdf');
		assert.equal(known.title, 'SIPRI Yearbook 2026: World Nuclear Forces');
		assert.ok(known.url);

		const unknown = getFriendlyDocumentInfo('custom-unrecorded-paper.pdf');
		assert.equal(unknown.title, 'custom unrecorded paper');
		assert.equal(unknown.organization, 'Research Document');
	});
});

describe('Social Configuration', () => {
	it('provides official channels and default hashtags', () => {
		assert.ok(OFFICIAL_CHANNELS.x);
		assert.ok(OFFICIAL_CHANNELS.bluesky);
		assert.deepEqual(DEFAULT_SHARE_HASHTAGS, ['WeDontNeedNukes']);
	});

	it('builds share URLs correctly from config', () => {
		const url = buildShareUrl('x', { url: 'https://wedontneednukes.org' });
		assert.ok(url.startsWith('https://twitter.com/intent/tweet?'));
		assert.ok(url.includes('WeDontNeedNukes'));
	});
});

describe('Email Server Configuration', () => {
	it('provides default sender, subject, and text/html generators', () => {
		const config = getEmailConfig();
		assert.equal(config.from, DEFAULT_EMAIL_FROM);
		assert.equal(config.subject, MAGIC_LINK_EMAIL_SUBJECT);

		const testUrl = 'https://wedontneednukes.org/auth/verify?token=123';
		const text = config.getText(testUrl);
		assert.ok(text.includes(testUrl));
		assert.ok(text.includes('Sign in to WeDoNotNeedNukes'));

		const html = config.getHtml(testUrl);
		assert.ok(html.includes(testUrl));
		assert.ok(html.includes('Your One-Time Sign-In Link'));
	});

	it('allows overriding sender from platform.env.EMAIL_FROM', () => {
		const config = getEmailConfig({ EMAIL_FROM: 'custom-sender@wedontneednukes.org' } as any);
		assert.equal(config.from, 'custom-sender@wedontneednukes.org');
	});
});
