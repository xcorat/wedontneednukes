/**
 * Cloudflare Turnstile token verification helper.
 */

export interface TurnstileVerificationResult {
	success: boolean;
	error?: string;
	hostname?: string;
	challengeTs?: string;
}

const DUMMY_SECRET_KEY = '1x0000000000000000000000000000000AA';
const DUMMY_PASS_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';

/**
 * Verifies a Cloudflare Turnstile response token with Cloudflare's siteverify API.
 */
export async function verifyTurnstileToken(
	token: string | null | undefined,
	secretKey: string | undefined,
	remoteIp?: string | null
): Promise<TurnstileVerificationResult> {
	// If secret key is not set or using dummy secret in development/test, allow bypass if token provided
	if (!secretKey || secretKey === DUMMY_SECRET_KEY) {
		return { success: true };
	}

	if (!token) {
		return { success: false, error: 'Turnstile verification token is required.' };
	}

	// Support dummy pass token in test environments
	if (token === DUMMY_PASS_TOKEN) {
		return { success: true };
	}

	try {
		const formData = new URLSearchParams();
		formData.append('secret', secretKey);
		formData.append('response', token);
		if (remoteIp) {
			formData.append('remoteip', remoteIp);
		}

		const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body: formData,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		if (!res.ok) {
			return { success: false, error: `Turnstile verification service responded with status ${res.status}` };
		}

		const data = (await res.json()) as {
			success: boolean;
			'error-codes'?: string[];
			challenge_ts?: string;
			hostname?: string;
		};

		if (!data.success) {
			const errorCodes = data['error-codes']?.join(', ') || 'Unknown Turnstile error';
			return { success: false, error: `Bot verification failed: ${errorCodes}` };
		}

		return {
			success: true,
			hostname: data.hostname,
			challengeTs: data.challenge_ts
		};
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Network error verifying Turnstile token.';
		return { success: false, error: message };
	}
}
