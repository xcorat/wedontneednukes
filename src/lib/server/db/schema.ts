import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// ─── Better Auth managed tables ───────────────────────────────────────────────

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	twoFactorEnabled: integer('two_factor_enabled', { mode: 'boolean' }).notNull().default(false),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
});

// ─── App tables ───────────────────────────────────────────────────────────────

export const campaign = sqliteTable('campaign', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const userProfile = sqliteTable('user_profile', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	displayName: text('display_name'),
	isDisplayNamePublic: integer('is_display_name_public', { mode: 'boolean' }).notNull().default(false),
	bio: text('bio'),
	isBioPublic: integer('is_bio_public', { mode: 'boolean' }).notNull().default(false),
	location: text('location'),
	isLocationPublic: integer('is_location_public', { mode: 'boolean' }).notNull().default(false),
	website: text('website'),
	isWebsitePublic: integer('is_website_public', { mode: 'boolean' }).notNull().default(false),
	isPledgePublic: integer('is_pledge_public', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;

export const twoFactor = sqliteTable('two_factor', {
	id: text('id').primaryKey(),
	secret: text('secret').notNull(),
	backupCodes: text('backup_codes').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	verified: integer('verified', { mode: 'boolean' }).notNull().default(true),
	failedVerificationCount: integer('failed_verification_count').notNull().default(0),
	lockedUntil: integer('locked_until', { mode: 'timestamp' })
});

export type TwoFactor = typeof twoFactor.$inferSelect;
export type NewTwoFactor = typeof twoFactor.$inferInsert;

// ─── Content-Addressed Q/A Tables ─────────────────────────────────────────────

// 1. Content-addressed Question entity
export const question = sqliteTable(
	'question',
	{
		id: text('id').primaryKey(), // q_<24>
		contentSha256: text('content_sha256').notNull().unique(), // full 64-hex digest
		textHash: text('text_hash').notNull(), // qt_<24>
		answerSetHash: text('answer_set_hash').notNull(), // as_<24>
		hashVersion: integer('hash_version').notNull().default(1),
		type: text('type', { enum: ['single_choice', 'multi_choice', 'scale', 'text'] }).notNull(),
		text: text('text').notNull(), // raw authored display prompt
		context: text('context'), // clarifying premise
		faqJson: text('faq_json', { mode: 'json' }), // FaqItem[] (UUID + text + link)
		// Only non-row variant extras: minSelections, maxSelections, min/max/step, maxLength, ticks
		extraConfigJson: text('extra_config_json', { mode: 'json' }),
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
	},
	(table) => ({
		idxTextHash: index('idx_question_text_hash').on(table.textHash),
		idxAnswerSetHash: index('idx_question_answer_set_hash').on(table.answerSetHash)
	})
);

export type QuestionRecord = typeof question.$inferSelect;
export type NewQuestionRecord = typeof question.$inferInsert;

// 2. Discrete Choices (stored as rows, not duplicated JSON blobs)
export const questionChoice = sqliteTable(
	'question_choice',
	{
		id: text('id').primaryKey(), // opt_<16>
		questionId: text('question_id')
			.notNull()
			.references(() => question.id, { onDelete: 'cascade' }),
		labelHash: text('label_hash').notNull(), // al_<24>
		value: text('value').notNull(), // internal alias, e.g. "agree", "other"
		label: text('label').notNull(), // public identity-bearing label
		description: text('description'),
		orderIndex: integer('order_index').notNull().default(0)
	},
	(table) => ({
		unqLabel: uniqueIndex('unq_choice_question_label').on(table.questionId, table.labelHash),
		unqValue: uniqueIndex('unq_choice_question_value').on(table.questionId, table.value)
	})
);

export type QuestionChoiceRecord = typeof questionChoice.$inferSelect;
export type NewQuestionChoiceRecord = typeof questionChoice.$inferInsert;

// 3. Campaign Question Placement (slug and order are campaign slots, not content attributes)
export const campaignQuestion = sqliteTable(
	'campaign_question',
	{
		id: text('id').primaryKey(),
		campaignId: text('campaign_id')
			.notNull()
			.references(() => campaign.id, { onDelete: 'cascade' }),
		questionId: text('question_id')
			.notNull()
			.references(() => question.id, { onDelete: 'restrict' }),
		slug: text('slug').notNull(), // e.g. "hero" - unique per campaign
		orderIndex: integer('order_index').notNull().default(0),
		isGated: integer('is_gated', { mode: 'boolean' }).notNull().default(false),
		gateConditionJson: text('gate_condition_json', { mode: 'json' }),
		isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false)
	},
	(table) => ({
		unqCampaignQuestion: uniqueIndex('unq_campaign_question').on(table.campaignId, table.questionId),
		unqCampaignSlug: uniqueIndex('unq_campaign_slug').on(table.campaignId, table.slug),
		idxCampaignOrder: index('idx_campaign_question_order').on(table.campaignId, table.orderIndex)
	})
);

export type CampaignQuestionRecord = typeof campaignQuestion.$inferSelect;
export type NewCampaignQuestionRecord = typeof campaignQuestion.$inferInsert;

// 4. Content-bound User Responses
// onDelete: 'restrict' so retired questions retain historical provenance
export const userResponse = sqliteTable(
	'user_response',
	{
		id: text('id').primaryKey(),
		questionId: text('question_id')
			.notNull()
			.references(() => question.id, { onDelete: 'restrict' }),
		contentSha256: text('content_sha256').notNull(), // snapshot
		userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
		anonId: text('anon_id'),
		selectedChoiceIds: text('selected_choice_ids', { mode: 'json' }),
		payloadJson: text('payload_json', { mode: 'json' }), // for text/scale answers
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
	}
);

export type UserResponseRecord = typeof userResponse.$inferSelect;
export type NewUserResponseRecord = typeof userResponse.$inferInsert;

export const schema = {
	user,
	session,
	account,
	verification,
	twoFactor,
	campaign,
	userProfile,
	question,
	questionChoice,
	campaignQuestion,
	userResponse
};

