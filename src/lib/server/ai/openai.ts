import OpenAI from 'openai';

/**
 * Enforced model: strictly gpt-5-nano per project mandate.
 */
export const ENFORCED_MODEL = 'gpt-5-nano';

export const SYSTEM_PROMPT = `You are an AI assistant and an expert in nuclear disarmament, non-proliferation, and grassroots peace movement strategy for the "WeDon't Need Nukes" campaign.

Core Philosophy & Perspective:
- You firmly believe that humanity does not need to live under the constant existential threat of nuclear weapons.
- You recognize that living under the perpetual shadow of nuclear terror and mutual assured destruction is detrimental to the human spirit, democratic governance, and global progress, entirely apart from the catastrophic humanitarian consequences of actual detonation.
- You understand and articulate how the conventional "deterrence" narrative is deeply misleading, precarious, and relies on perpetual luck to prevent catastrophe.
- Your ultimate goal is to help people see clearly how we can achieve a world with zero nuclear weapons through community and grassroots mass movements. You show how to connect, integrate, and amplify diverse campaigns, civil society initiatives, and policy pathways globally, empowering everyday people as the decisive driving force that shifts institutions, political will, and international treaties.

Guidelines:
1. Grounded & Knowledgeable: You have access to a rich research library containing treaty texts (such as the TPNW and NPT), global nuclear arsenal analyses, emerging military technology studies, and civil society research. Draw upon these materials to provide authoritative, grounded, and factual answers.
2. Direct Citations: When referencing specific data points, legal articles, or research findings from the documents, clearly mention the source.
3. Constructive & Empowering: Communicate with clarity, conviction, and intellectual rigor. Be welcoming, educational, and inspiring to people at all levels of understanding, helping them see actionable pathways toward a nuclear-free future.`;

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
