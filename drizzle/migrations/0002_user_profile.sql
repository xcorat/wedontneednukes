-- Migration: 0002_user_profile.sql
CREATE TABLE IF NOT EXISTS `user_profile` (
	`user_id` text PRIMARY KEY NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
	`display_name` text,
	`is_display_name_public` integer NOT NULL DEFAULT 0,
	`bio` text,
	`is_bio_public` integer NOT NULL DEFAULT 0,
	`location` text,
	`is_location_public` integer NOT NULL DEFAULT 0,
	`website` text,
	`is_website_public` integer NOT NULL DEFAULT 0,
	`is_pledge_public` integer NOT NULL DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE INDEX IF NOT EXISTS `user_profile_user_id_idx` ON `user_profile` (`user_id`);
