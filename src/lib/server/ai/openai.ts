import OpenAI from 'openai';
import { getAIConfig, SYSTEM_PROMPT } from '$lib/server/config/ai.js';

export { SYSTEM_PROMPT };

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
 * Performs non-streaming RAG query using the configured AI model and file_search tool.
 */
export async function queryRAG(params: {
	apiKey: string;
	vectorStoreId: string;
	message: string;
	model?: string;
	instructions?: string;
}): Promise<RAGResponse> {
	const openai = getOpenAIClient(params.apiKey);
	const resolvedModel = params.model || getAIConfig().model;
	const resolvedInstructions = params.instructions || getAIConfig().systemPrompt;

	const response = await openai.responses.create({
		model: resolvedModel,
		instructions: resolvedInstructions,
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
		model: response.model || resolvedModel,
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
 * Returns a streaming response for RAG using the configured AI model.
 */
export async function streamRAG(params: {
	apiKey: string;
	vectorStoreId: string;
	message: string;
	model?: string;
	instructions?: string;
}) {
	const openai = getOpenAIClient(params.apiKey);
	const resolvedModel = params.model || getAIConfig().model;
	const resolvedInstructions = params.instructions || getAIConfig().systemPrompt;

	return openai.responses.stream({
		model: resolvedModel,
		instructions: resolvedInstructions,
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

