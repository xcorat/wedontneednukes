import { eq, and, asc } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import {
	question as questionTable,
	questionChoice as questionChoiceTable,
	campaignQuestion as campaignQuestionTable,
	campaign as campaignTable,
	userResponse as userResponseTable,
	type QuestionRecord,
	type QuestionChoiceRecord,
	type CampaignQuestionRecord,
	type UserResponseRecord
} from '$lib/server/db/schema';
import type { Question, AnswerChoice, QuestionType } from '$lib/types/qa';

/**
 * Persists a content-addressed Question and its discrete choices.
 * Idempotent: if question already exists by ID, skips insert.
 */
export async function insertQuestion(
	db: DrizzleD1Database<any>,
	q: Question
): Promise<Question> {
	const existing = await db
		.select()
		.from(questionTable)
		.where(eq(questionTable.id, q.id))
		.get();

	const now = new Date();

	if (!existing) {
		// Extract extra variant config (excluding choices)
		let extraConfigJson: any = null;
		if (q.type === 'multi_choice') {
			extraConfigJson = {
				minSelections: q.ans.minSelections,
				maxSelections: q.ans.maxSelections
			};
		} else if (q.type === 'scale') {
			extraConfigJson = {
				min: q.ans.min,
				max: q.ans.max,
				step: q.ans.step,
				labels: q.ans.labels
			};
		} else if (q.type === 'text') {
			extraConfigJson = {
				maxLength: q.ans.maxLength
			};
		}

		await db.insert(questionTable).values({
			id: q.id,
			contentSha256: q.contentSha256,
			textHash: q.textHash,
			answerSetHash: q.answerSetHash,
			hashVersion: q.hashVersion,
			type: q.type,
			text: q.text,
			context: q.context ?? null,
			faqJson: q.faq ?? null,
			extraConfigJson,
			isActive: q.isActive,
			createdAt: now,
			updatedAt: now
		});

		// Insert discrete choices as individual rows
		if (q.type === 'single_choice' || q.type === 'multi_choice') {
			for (const choice of q.ans.choices) {
				await db.insert(questionChoiceTable).values({
					id: choice.id,
					questionId: q.id,
					labelHash: choice.labelHash,
					value: choice.value,
					label: choice.label,
					description: choice.description ?? null,
					orderIndex: choice.orderIndex
				});
			}
		}
	}

	return q;
}

/**
 * Rehydrates a strongly-typed discriminated Question union from SQL rows.
 */
export function rehydrateQuestion(
	qRow: QuestionRecord,
	choiceRows: QuestionChoiceRecord[]
): Question {
	const baseHeader = {
		id: qRow.id,
		contentSha256: qRow.contentSha256,
		textHash: qRow.textHash,
		answerSetHash: qRow.answerSetHash,
		hashVersion: qRow.hashVersion as 1,
		text: qRow.text,
		context: qRow.context ?? undefined,
		faq: (qRow.faqJson as any) ?? undefined,
		isActive: qRow.isActive
	};

	const choices: AnswerChoice[] = choiceRows
		.sort((a, b) => a.orderIndex - b.orderIndex)
		.map((c) => ({
			id: c.id,
			labelHash: c.labelHash,
			value: c.value,
			label: c.label,
			description: c.description ?? undefined,
			orderIndex: c.orderIndex
		}));

	const extra = (qRow.extraConfigJson as any) ?? {};

	switch (qRow.type as QuestionType) {
		case 'single_choice':
			return {
				...baseHeader,
				type: 'single_choice',
				ans: {
					type: 'single_choice',
					choices
				}
			};
		case 'multi_choice':
			return {
				...baseHeader,
				type: 'multi_choice',
				ans: {
					type: 'multi_choice',
					choices,
					minSelections: extra.minSelections ?? 1,
					maxSelections: extra.maxSelections ?? undefined
				}
			};
		case 'scale':
			return {
				...baseHeader,
				type: 'scale',
				ans: {
					type: 'scale',
					min: extra.min ?? 0,
					max: extra.max ?? 10,
					step: extra.step ?? 1,
					labels: extra.labels ?? undefined
				}
			};
		case 'text':
			return {
				...baseHeader,
				type: 'text',
				ans: {
					type: 'text',
					maxLength: extra.maxLength ?? undefined
				}
			};
		default:
			throw new Error(`Unsupported question type: ${qRow.type}`);
	}
}

/**
 * Retrieves a content-addressed Question by ID with its choices rehydrated.
 */
export async function getQuestion(
	db: DrizzleD1Database<any>,
	id: string
): Promise<Question | null> {
	const qRow = await db
		.select()
		.from(questionTable)
		.where(eq(questionTable.id, id))
		.get();

	if (!qRow) return null;

	const choiceRows = await db
		.select()
		.from(questionChoiceTable)
		.where(eq(questionChoiceTable.questionId, id))
		.orderBy(asc(questionChoiceTable.orderIndex))
		.all();

	return rehydrateQuestion(qRow, choiceRows);
}

/**
 * Associates a Question with a Campaign slot (slug, order, gating, publish state).
 */
export async function attachQuestionToCampaign(
	db: DrizzleD1Database<any>,
	params: {
		id?: string;
		campaignId: string;
		questionId: string;
		slug: string;
		orderIndex?: number;
		isGated?: boolean;
		gateConditionJson?: any;
		isPublished?: boolean;
	}
): Promise<void> {
	const id = params.id ?? `cq_${crypto.randomUUID()}`;
	await db.insert(campaignQuestionTable).values({
		id,
		campaignId: params.campaignId,
		questionId: params.questionId,
		slug: params.slug,
		orderIndex: params.orderIndex ?? 0,
		isGated: params.isGated ?? false,
		gateConditionJson: params.gateConditionJson ?? null,
		isPublished: params.isPublished ?? true
	});
}

/**
 * Lists published questions for a given campaign slug in display order.
 */
export async function listQuestionsByCampaign(
	db: DrizzleD1Database<any>,
	campaignSlug: string
): Promise<Array<{ campaignQuestion: CampaignQuestionRecord; question: Question }>> {
	const camp = await db
		.select()
		.from(campaignTable)
		.where(eq(campaignTable.slug, campaignSlug))
		.get();

	if (!camp) return [];

	const cqRows = await db
		.select()
		.from(campaignQuestionTable)
		.where(eq(campaignQuestionTable.campaignId, camp.id))
		.orderBy(asc(campaignQuestionTable.orderIndex))
		.all();

	const results: Array<{ campaignQuestion: CampaignQuestionRecord; question: Question }> = [];

	for (const cq of cqRows) {
		const q = await getQuestion(db, cq.questionId);
		if (q) {
			results.push({ campaignQuestion: cq, question: q });
		}
	}

	return results;
}

/**
 * Records or updates a user/anon response for a question.
 * Idempotent upsert matching on (userId, questionId) or (anonId, questionId).
 */
export async function recordUserResponse(
	db: DrizzleD1Database<any>,
	params: {
		questionId: string;
		contentSha256: string;
		userId?: string | null;
		anonId?: string | null;
		selectedChoiceIds: string[];
		payload?: any;
	}
): Promise<UserResponseRecord> {
	const { questionId, contentSha256, userId, anonId, selectedChoiceIds, payload } = params;
	if (!userId && !anonId) {
		throw new Error('Either userId or anonId must be provided to record a response');
	}

	const now = new Date();

	// Check if already responded
	let existing: UserResponseRecord | undefined = undefined;
	if (userId) {
		existing = await db
			.select()
			.from(userResponseTable)
			.where(
				and(
					eq(userResponseTable.userId, userId),
					eq(userResponseTable.questionId, questionId)
				)
			)
			.get();
	} else if (anonId) {
		existing = await db
			.select()
			.from(userResponseTable)
			.where(
				and(
					eq(userResponseTable.anonId, anonId),
					eq(userResponseTable.questionId, questionId)
				)
			)
			.get();
	}

	if (existing) {
		await db
			.update(userResponseTable)
			.set({
				contentSha256,
				selectedChoiceIds,
				payloadJson: payload ?? null,
				updatedAt: now
			})
			.where(eq(userResponseTable.id, existing.id));

		return {
			...existing,
			contentSha256,
			selectedChoiceIds,
			payloadJson: payload ?? null,
			updatedAt: now
		};
	}

	const id = `resp_${crypto.randomUUID().replace(/-/g, '')}`;
	const newRecord: UserResponseRecord = {
		id,
		questionId,
		contentSha256,
		userId: userId ?? null,
		anonId: anonId ?? null,
		selectedChoiceIds,
		payloadJson: payload ?? null,
		createdAt: now,
		updatedAt: now
	};

	await db.insert(userResponseTable).values(newRecord);
	return newRecord;
}

/**
 * Retrieves an existing response for a user or anonymous visitor.
 */
export async function getUserResponse(
	db: DrizzleD1Database<any>,
	params: {
		questionId: string;
		userId?: string | null;
		anonId?: string | null;
	}
): Promise<UserResponseRecord | null> {
	const { questionId, userId, anonId } = params;

	if (userId) {
		const res = await db
			.select()
			.from(userResponseTable)
			.where(
				and(
					eq(userResponseTable.userId, userId),
					eq(userResponseTable.questionId, questionId)
				)
			)
			.get();
		if (res) return res;
	}

	if (anonId) {
		const res = await db
			.select()
			.from(userResponseTable)
			.where(
				and(
					eq(userResponseTable.anonId, anonId),
					eq(userResponseTable.questionId, questionId)
				)
			)
			.get();
		if (res) return res;
	}

	return null;
}

/**
 * Computes statistics for a question from all recorded responses.
 */
export async function getQuestionStats(
	db: DrizzleD1Database<any>,
	questionId: string,
	options?: { validatedOnly?: boolean }
): Promise<{
	totalResponses: number;
	countsByChoiceId: Record<string, number>;
	percentagesByChoiceId: Record<string, number>;
}> {
	let responses = await db
		.select()
		.from(userResponseTable)
		.where(eq(userResponseTable.questionId, questionId))
		.all();

	if (options?.validatedOnly) {
		responses = responses.filter((r) => r.userId !== null && r.userId !== undefined);
	}

	const totalResponses = responses.length;
	const countsByChoiceId: Record<string, number> = {};

	for (const resp of responses) {
		const choiceIds = (resp.selectedChoiceIds as string[]) ?? [];
		for (const cid of choiceIds) {
			countsByChoiceId[cid] = (countsByChoiceId[cid] ?? 0) + 1;
		}
	}

	const percentagesByChoiceId: Record<string, number> = {};
	if (totalResponses > 0) {
		for (const [cid, count] of Object.entries(countsByChoiceId)) {
			percentagesByChoiceId[cid] = Math.round((count / totalResponses) * 100);
		}
	}

	return {
		totalResponses,
		countsByChoiceId,
		percentagesByChoiceId
	};
}

