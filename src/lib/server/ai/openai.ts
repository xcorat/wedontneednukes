import OpenAI from 'openai';

/**
 * Enforced model: strictly gpt-5-nano per project mandate.
 */
export const ENFORCED_MODEL = 'gpt-5-nano';

export const SYSTEM_PROMPT = `You are an authoritative nuclear disarmament and policy research analyst for the "WeDon't Need Nukes" campaign and research library.

Your knowledge base contains authoritative research papers, treaties, and policy briefings:
1. SIPRI Yearbook 2026: World Nuclear Forces (warhead counts, operational status, modernization)
2. SIPRI Yearbook 2026: AI Governance (military AI, autonomous weapons, nuclear C2 risk)
3. SIPRI Yearbook 2026: Space Governance (counter-space capabilities, early warning satellites)
4. SIPRI Yearbook 2026: Executive Summary
5. Treaty on the Prohibition of Nuclear Weapons (TPNW) Core Factsheet (prohibitions, obligations)
6. BASIC Report: Preparing for the First TPNW Review Conference
7. BASIC Report: Envisioning Future Pathways for the Nuclear Non-Proliferation Treaty (NPT)
8. BASIC / Strategic Stability: Addressing Future Nuclear Crisis Scenarios in South Asia
9. Missile Systems and Strategic Stability (MSAS) Analysis
10. Academic Research: Atomic Responsiveness (Public opinion and political elite nuclear weapon preferences)
11. Civil Society and the UN Conference on Disarmament
12. Mayors for Peace: Municipal disarmament advocacy and appeals

Core Directives:
1. Grounding: Answer strictly using facts and analysis found in the retrieved documents. When statistical figures are requested, quote the exact numbers and estimates from the documents (e.g. SIPRI 2026 warhead counts).
2. Direct Citations: Clearly cite the document title, report section, or treaty article for every key statement or data point.
3. Honesty & Restraint: If the provided knowledge base does not contain information to answer a question, state plainly: "The current research library does not contain information on this topic." Do not fabricate or extrapolate unsupported data.`;

export function getOpenAIClient(apiKey: string): OpenAI {
	return new OpenAI({ apiKey });
}

export interface CitationItem {
	filename: string;
	fileId?: string;
	score?: number;
	snippet?: string;
}

export interface RAGResponse {
	text: string;
	citations: CitationItem[];
	model: string;
	responseId: string;
	usage?: {
		inputTokens?: number;
		outputTokens?: number;
		totalTokens?: number;
	};
}

/**
 * Performs non-streaming RAG query using gpt-5-nano and file_search tool.
 */
export async function queryRAG(params: {
	apiKey: string;
	vectorStoreId: string;
	message: string;
}): Promise<RAGResponse> {
	const openai = getOpenAIClient(params.apiKey);

	const response = await openai.responses.create({
		model: ENFORCED_MODEL,
		instructions: SYSTEM_PROMPT,
		input: params.message,
		tools: [
			{
				type: 'file_search',
				vector_store_ids: [params.vectorStoreId]
			}
		],
		include: ['file_search_call.results']
	});

	const citations: CitationItem[] = [];
	const seenFiles = new Set<string>();

	// Extract retrieved file results from output items
	for (const item of response.output) {
		if (item.type === 'file_search_call' && item.results) {
			for (const res of item.results) {
				const filename = res.filename || 'Unknown Document';
				if (!seenFiles.has(filename)) {
					seenFiles.add(filename);
					citations.push({
						filename,
						fileId: res.file_id,
						score: res.score,
						snippet: res.text ? res.text.slice(0, 300) : undefined
					});
				}
			}
		}

		// Also collect annotations from message content if present
		if (item.type === 'message' && Array.isArray(item.content)) {
			for (const contentPart of item.content) {
				if (contentPart.type === 'output_text' && Array.isArray(contentPart.annotations)) {
					for (const annot of contentPart.annotations) {
						if (annot.type === 'file_citation' && annot.filename && !seenFiles.has(annot.filename)) {
							seenFiles.add(annot.filename);
							citations.push({
								filename: annot.filename,
								fileId: annot.file_id
							});
						}
					}
				}
			}
		}
	}

	return {
		text: response.output_text,
		citations,
		model: response.model || ENFORCED_MODEL,
		responseId: response.id,
		usage: response.usage
			? {
					inputTokens: response.usage.input_tokens,
					outputTokens: response.usage.output_tokens,
					totalTokens: response.usage.total_tokens
				}
			: undefined
	};
}

/**
 * Returns a streaming response for gpt-5-nano RAG.
 */
export async function streamRAG(params: {
	apiKey: string;
	vectorStoreId: string;
	message: string;
}) {
	const openai = getOpenAIClient(params.apiKey);

	return openai.responses.stream({
		model: ENFORCED_MODEL,
		instructions: SYSTEM_PROMPT,
		input: params.message,
		tools: [
			{
				type: 'file_search',
				vector_store_ids: [params.vectorStoreId]
			}
		],
		include: ['file_search_call.results']
	});
}
