-- Migration: 0005_content_addressed_qa.sql
-- Create Content-Addressed Q/A Engine tables, SQLite partial unique indexes, and drop legacy pledge table.

-- 1. Create content-addressed Question table
CREATE TABLE IF NOT EXISTS `question` (
	`id` text PRIMARY KEY NOT NULL,
	`content_sha256` text NOT NULL,
	`text_hash` text NOT NULL,
	`answer_set_hash` text NOT NULL,
	`hash_version` integer DEFAULT 1 NOT NULL,
	`type` text NOT NULL,
	`text` text NOT NULL,
	`context` text,
	`faq_json` text,
	`extra_config_json` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `question_content_sha256_unique` ON `question` (`content_sha256`);
CREATE INDEX IF NOT EXISTS `idx_question_text_hash` ON `question` (`text_hash`);
CREATE INDEX IF NOT EXISTS `idx_question_answer_set_hash` ON `question` (`answer_set_hash`);

-- 2. Create Question Choice table
CREATE TABLE IF NOT EXISTS `question_choice` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`label_hash` text NOT NULL,
	`value` text NOT NULL,
	`label` text NOT NULL,
	`description` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX IF NOT EXISTS `unq_choice_question_label` ON `question_choice` (`question_id`, `label_hash`);
CREATE UNIQUE INDEX IF NOT EXISTS `unq_choice_question_value` ON `question_choice` (`question_id`, `value`);

-- 3. Create Campaign Question join table
CREATE TABLE IF NOT EXISTS `campaign_question` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`question_id` text NOT NULL,
	`slug` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`is_gated` integer DEFAULT 0 NOT NULL,
	`gate_condition_json` text,
	`is_published` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON UPDATE no action ON DELETE restrict
);

CREATE UNIQUE INDEX IF NOT EXISTS `unq_campaign_question` ON `campaign_question` (`campaign_id`, `question_id`);
CREATE UNIQUE INDEX IF NOT EXISTS `unq_campaign_slug` ON `campaign_question` (`campaign_id`, `slug`);
CREATE INDEX IF NOT EXISTS `idx_campaign_question_order` ON `campaign_question` (`campaign_id`, `order_index`);

-- 4. Create User Response table
CREATE TABLE IF NOT EXISTS `user_response` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`content_sha256` text NOT NULL,
	`user_id` text,
	`anon_id` text,
	`selected_choice_ids` text,
	`payload_json` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Partial unique indexes on user_response for SQLite
CREATE UNIQUE INDEX IF NOT EXISTS `unq_resp_user_question`
	ON `user_response` (`user_id`, `question_id`)
	WHERE `user_id` IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS `unq_resp_anon_question`
	ON `user_response` (`anon_id`, `question_id`)
	WHERE `anon_id` IS NOT NULL;

-- 5. Drop legacy pledge table
DROP TABLE IF EXISTS `pledge`;
