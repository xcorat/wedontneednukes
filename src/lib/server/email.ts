import { getEmailConfig } from '$lib/server/config/email.js';

export interface SendMagicLinkOptions {
	to: string;
	url: string;
	env: App.Platform['env'];
}

/**
 * Send a magic link email to the user.
 * 1. If Cloudflare Workers Send Email binding (`env.EMAIL`) is present, uses `env.EMAIL.send()`.
 * 2. If `RESEND_API_KEY` is configured, sends via Resend API.
 * 3. In local development or fallback, logs the link directly to the console.
 */
export async function sendMagicLinkEmail({ to, url, env }: SendMagicLinkOptions): Promise<void> {
	const emailConfig = getEmailConfig(env);
	const from = emailConfig.from;
	const subject = emailConfig.subject;
	const text = emailConfig.getText(url);
	const html = emailConfig.getHtml(url);


	// 1. Cloudflare Workers native Send Email binding (env.EMAIL)
	if (env.EMAIL) {
		try {
			await env.EMAIL.send({
				to,
				from,
				subject,
				text,
				html
			});
			console.log(`[AUTH] Sent magic link email to ${to} via Cloudflare env.EMAIL`);
			return;
		} catch (err) {
			console.error('[AUTH] Failed to send email via Cloudflare env.EMAIL:', err);
			throw err;
		}
	}

	// 2. Resend API
	if (env.RESEND_API_KEY) {
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from,
				to: [to],
				subject,
				text,
				html
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[AUTH] Failed to send magic link email via Resend:', errorText);
			throw new Error(`Failed to send magic link email: ${response.statusText}`);
		}
		console.log(`[AUTH] Sent magic link email to ${to} via Resend`);
		return;
	}

	// 3. Development fallback: print directly to console for instant testing
	console.log('\n======================================================');
	console.log('  [AUTH] ONE-TIME SIGN-IN LINK (DEVELOPMENT)');
	console.log(`  Recipient: ${to}`);
	console.log(`  Link:      ${url}`);
	console.log('======================================================\n');
}
