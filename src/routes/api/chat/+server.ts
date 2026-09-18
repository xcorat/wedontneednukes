import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { queryRAG, streamRAG, ENFORCED_MODEL } from '$lib/server/ai/openai.js';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!locals.user) {
		return json(
			{
				error: 'Unauthorized. You must be logged in to use the AI assistant.'
			},
			{ status: 401 }
		);
	}

	const apiKey = platform?.env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
	const vectorStoreId = platform?.env?.OPENAI_VECTOR_STORE_ID || process.env.OPENAI_VECTOR_STORE_ID;

	if (!apiKey) {
		return json(
			{
				error: 'OPENAI_API_KEY is not configured in platform.env or .dev.vars'
			},
			{ status: 500 }
		);
	}

	if (!vectorStoreId) {
		return json(
			{
				error: 'OPENAI_VECTOR_STORE_ID is not configured. Please run `pnpm run ingest:docs` first.'
			},
			{ status: 500 }
		);
	}

	let body: { message?: unknown; stream?: boolean };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON request body' }, { status: 400 });
	}

	const message = typeof body.message === 'string' ? body.message.trim() : '';
	if (!message) {
		return json({ error: 'Property "message" must be a non-empty string' }, { status: 400 });
	}

	const wantsStream =
		body.stream === true || request.headers.get('accept')?.includes('text/event-stream');

	try {
		if (wantsStream) {
			const runner = await streamRAG({
				apiKey,
				vectorStoreId,
				message
			});

			const stream = new ReadableStream({
				async start(controller) {
					const encoder = new TextEncoder();
					try {
						for await (const event of runner) {
							if (event.type === 'response.output_text.delta') {
								const chunk = JSON.stringify({ delta: event.delta });
								controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
							}
						}

						const finalResponse = await runner.finalResponse();
						const citations: Array<{ filename: string; fileId?: string }> = [];
						const seenFiles = new Set<string>();

						for (const item of finalResponse.output) {
							if (item.type === 'file_search_call' && item.results) {
								for (const r of item.results) {
									const fname = r.filename || 'Unknown Document';
									if (!seenFiles.has(fname)) {
										seenFiles.add(fname);
										citations.push({ filename: fname, fileId: r.file_id });
									}
								}
							}
						}

						const donePayload = JSON.stringify({
							done: true,
							citations,
							model: finalResponse.model || ENFORCED_MODEL,
							usage: finalResponse.usage
						});
						controller.enqueue(encoder.encode(`data: ${donePayload}\n\n`));
						controller.close();
					} catch (err: any) {
						const errPayload = JSON.stringify({ error: err?.message || 'Streaming failed' });
						controller.enqueue(encoder.encode(`data: ${errPayload}\n\n`));
						controller.close();
					}
				}
			});

			return new Response(stream, {
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache, no-transform',
					Connection: 'keep-alive'
				}
			});
		}

		// Non-streaming JSON mode (ideal for curl testing)
		const result = await queryRAG({
			apiKey,
			vectorStoreId,
			message
		});

		return json({
			success: true,
			model: result.model,
			responseId: result.responseId,
			answer: result.text,
			citations: result.citations,
			usage: result.usage
		});
	} catch (err: any) {
		console.error('Error handling /api/chat RAG request:', err);
		return json(
			{
				error: err?.message || 'Internal RAG pipeline error',
				details: err?.status ? `Status: ${err.status}` : undefined
			},
			{ status: 500 }
		);
	}
};
