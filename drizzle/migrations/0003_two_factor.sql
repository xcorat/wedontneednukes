-- Migration: 0003_two_factor.sql
ALTER TABLE `user` ADD COLUMN `two_factor_enabled` integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS `two_factor` (
	`id` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`backup_codes` text NOT NULL,
	`user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
	`verified` integer NOT NULL DEFAULT 1,
	`failed_verification_count` integer NOT NULL DEFAULT 0,
	`locked_until` integer
);

CREATE INDEX IF NOT EXISTS `two_factor_user_id_idx` ON `two_factor` (`user_id`);
CREATE INDEX IF NOT EXISTS `two_factor_secret_idx` ON `two_factor` (`secret`);
