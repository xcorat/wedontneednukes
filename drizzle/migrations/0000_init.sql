-- Better Auth tables
CREATE TABLE IF NOT EXISTS `user` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL UNIQUE,
  `email_verified` integer NOT NULL DEFAULT 0,
  `image` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `session` (
  `id` text PRIMARY KEY NOT NULL,
  `expires_at` integer NOT NULL,
  `token` text NOT NULL UNIQUE,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `account` (
  `id` text PRIMARY KEY NOT NULL,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `access_token` text,
  `refresh_token` text,
  `id_token` text,
  `access_token_expires_at` integer,
  `refresh_token_expires_at` integer,
  `scope` text,
  `password` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `verification` (
  `id` text PRIMARY KEY NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer,
  `updated_at` integer
);

-- App tables
CREATE TABLE IF NOT EXISTS `campaign` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL UNIQUE,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `flow_definition` text,
  `is_active` integer NOT NULL DEFAULT 1,
  `created_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `pledge` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `campaign_id` text NOT NULL REFERENCES `campaign`(`id`) ON DELETE CASCADE,
  `responses` text,
  `commitment_level` text,
  `completed` integer NOT NULL DEFAULT 0,
  `created_at` integer NOT NULL
);

-- Seed: nukes campaign
INSERT OR IGNORE INTO `campaign` (`id`, `slug`, `title`, `description`, `is_active`, `created_at`)
VALUES (
  'camp_nukes_001',
  'nukes',
  'Nuclear Disarmament',
  'A global pledge campaign to abolish nuclear weapons.',
  1,
  unixepoch()
);
