/**
 * Domain types for Content-Addressed Q/A Engine
 * Spec: /data/web/wedontneednukes/docs/tmp/qna_data_design.md
 */

export type QuestionType = 'single_choice' | 'multi_choice' | 'scale' | 'text';

/**
 * FAQ item with stable RFC 4122 UUID v4.
 * Not part of the content hash identity.
 */
export interface FaqItem {
	id: string; // UUID v4
	text: string; // Display label (e.g., "Why?")
	link: string; // Target URL (e.g., "/wiki/faq/why")
	description?: string;
}

/**
 * Discrete choice within a question.
 * label is public and contributes to answerSetHash.
 * value is an internal alias for application/UI logic.
 * id is an opt_<16> hash scoped to this question.
 */
export interface AnswerChoice {
	id: string; // opt_<16>
	labelHash: string; // al_<24>
	value: string; // internal alias, e.g. "agree", "passive"
	label: string; // public label (contributes to hash)
	description?: string;
	orderIndex: number;
}

export interface QuestionIdentity {
	id: string; // q_<24>
	contentSha256: string; // Full 64-hex SHA-256 digest
	textHash: string; // qt_<24>
	answerSetHash: string; // as_<24>
	hashVersion: 1;
}

/**
 * Header and metadata on an immutable content record.
 * Notice: slug and orderIndex belong to campaign placement (campaign_question), not here.
 */
export interface QuestionHeader extends QuestionIdentity {
	type: QuestionType;
	text: string; // Raw authored display prompt
	context?: string; // Clarifying premise
	faq?: FaqItem[]; // Attached FAQs (UUID-keyed)
	isActive: boolean; // Content lifecycle (retired vs active)
}

export interface SingleChoiceConfig {
	type: 'single_choice';
	choices: AnswerChoice[];
}

export interface MultiChoiceConfig {
	type: 'multi_choice';
	choices: AnswerChoice[];
	minSelections: number;
	maxSelections?: number;
}

export interface ScaleConfig {
	type: 'scale';
	min: number;
	max: number;
	step?: number;
	labels?: Record<number, string>; // Tick labels (not in v1 identity)
}

export interface TextConfig {
	type: 'text';
	maxLength?: number;
}

export type AnswerConfig = SingleChoiceConfig | MultiChoiceConfig | ScaleConfig | TextConfig;

export type SingleChoiceQuestion = QuestionHeader & { type: 'single_choice'; ans: SingleChoiceConfig };
export type MultiChoiceQuestion = QuestionHeader & { type: 'multi_choice'; ans: MultiChoiceConfig };
export type ScaleQuestion = QuestionHeader & { type: 'scale'; ans: ScaleConfig };
export type TextQuestion = QuestionHeader & { type: 'text'; ans: TextConfig };

/**
 * Discriminated Question entity union.
 * Use factory methods to guarantee header.type === ans.type.
 */
export type Question =
	| SingleChoiceQuestion
	| MultiChoiceQuestion
	| ScaleQuestion
	| TextQuestion;

