-- Migration: 0001_pledge_votes.sql
DROP TABLE IF EXISTS `pledge`;

CREATE TABLE `pledge` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text REFERENCES `user`(`id`) ON DELETE CASCADE,
	`anon_id` text,
	`choice` text NOT NULL,
	`campaign_id` text NOT NULL REFERENCES `campaign`(`id`) ON DELETE CASCADE,
	`responses` text,
	`commitment_level` text,
	`completed` integer NOT NULL DEFAULT 0,
	`created_at` integer NOT NULL
);

CREATE INDEX IF NOT EXISTS `pledge_campaign_choice_idx` ON `pledge` (`campaign_id`, `choice`);
CREATE INDEX IF NOT EXISTS `pledge_anon_id_idx` ON `pledge` (`anon_id`);
CREATE INDEX IF NOT EXISTS `pledge_user_id_idx` ON `pledge` (`user_id`);
