-- Migration: 0004_optional_email.sql
-- Allow user.email to be nullable for Twitter/X and social sign-in providers that do not provide email.

PRAGMA foreign_keys=OFF;

CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`two_factor_enabled` integer DEFAULT 0 NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

INSERT INTO `__new_user` ("id", "name", "email", "email_verified", "two_factor_enabled", "image", "created_at", "updated_at")
SELECT "id", "name", "email", "email_verified", "two_factor_enabled", "image", "created_at", "updated_at" FROM `user`;

DROP TABLE `user`;

ALTER TABLE `__new_user` RENAME TO `user`;

PRAGMA foreign_keys=ON;

CREATE UNIQUE INDEX IF NOT EXISTS `user_email_unique` ON `user` (`email`);
