/**
 * Server-side email configuration and template builders.
 */

export const DEFAULT_EMAIL_FROM = 'welcome@wedontneednukes.org';
export const MAGIC_LINK_EMAIL_SUBJECT = 'Your one-time sign-in link · WeDoNotNeedNukes';

/**
 * Builds the plain text body for magic link authentication emails.
 */
export function getMagicLinkText(url: string): string {
	return `Sign in to WeDoNotNeedNukes:\n\n${url}\n\nClick the link above to sign in. This link will expire shortly.\nIf you didn't request this email, you can safely ignore it.`;
}

/**
 * Builds the HTML body for magic link authentication emails.
 */
export function getMagicLinkHtml(url: string): string {
	return `<!DOCTYPE html>
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
</html>`;
}

export interface EmailConfig {
	from: string;
	subject: string;
	getText: (url: string) => string;
	getHtml: (url: string) => string;
}

/**
 * Returns the effective email configuration, with environment overrides.
 */
export function getEmailConfig(env?: App.Platform['env'] | Record<string, any>): EmailConfig {
	const from =
		env?.EMAIL_FROM ||
		(typeof process !== 'undefined' && process.env?.EMAIL_FROM) ||
		DEFAULT_EMAIL_FROM;

	return {
		from,
		subject: MAGIC_LINK_EMAIL_SUBJECT,
		getText: getMagicLinkText,
		getHtml: getMagicLinkHtml
	};
}
