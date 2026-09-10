import { drizzle } from 'drizzle-orm/d1';
import { schema } from './schema.js';

/**
 * Create a Drizzle D1 database client per request.
 * D1 bindings are injected per-request via `platform.env`, so we cannot use a
 * static singleton — a factory is required.
 */
export function getDb(env: App.Platform['env']) {
	return drizzle(env.DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
