export interface SendMagicLinkOptions {
	to: string;
	url: string;
	env: App.Platform['env'];
}

/**
 * Send a magic link email to the user.
 * In production, uses Resend via fetch() when RESEND_API_KEY is configured.
 * In local development, logs the link directly to the console.
 */
export async function sendMagicLinkEmail({ to, url, env }: SendMagicLinkOptions): Promise<void> {
	if (env.RESEND_API_KEY) {
		const from = env.EMAIL_FROM ?? 'WeDoNotNeedNukes <noreply@wedontneednukes.com>';

		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from,
				to: [to],
				subject: 'Your one-time sign-in link · WeDoNotNeedNukes',
				html: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Sign in to WeDoNotNeedNukes</title>
					</head>
					<body style="background-color: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; margin: 0;">
						<table align="center" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
							<tr>
								<td align="center">
									<div style="font-size: 32px; margin-bottom: 12px;">🕊️</div>
									<h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.02em;">
										Your One-Time Sign-In Link
									</h1>
									<p style="color: #a1a1aa; font-size: 14px; line-height: 22px; margin: 0 0 28px 0;">
										Click the button below to sign in and record your stance on nuclear disarmament.
									</p>
									<a href="${url}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #09090b; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; margin-bottom: 24px;">
										Sign in to WeDoNotNeedNukes →
									</a>
									<p style="color: #71717a; font-size: 12px; line-height: 18px; margin: 0;">
										If you didn't request this email, you can safely ignore it. This link will expire shortly.
									</p>
								</td>
							</tr>
						</table>
					</body>
					</html>
				`
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[AUTH] Failed to send magic link email via Resend:', errorText);
			throw new Error(`Failed to send magic link email: ${response.statusText}`);
		}
	} else {
		// Development fallback: print directly to console for instant testing
		console.log('\n======================================================');
		console.log('  [AUTH] ONE-TIME SIGN-IN LINK (DEVELOPMENT)');
		console.log(`  Recipient: ${to}`);
		console.log(`  Link:      ${url}`);
		console.log('======================================================\n');
	}
}
