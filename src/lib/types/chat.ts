import type { CitationItem } from '$lib/server/ai/openai.js';

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	createdAt: Date;
	citations?: CitationItem[];
	isStreaming?: boolean;
	error?: string;
}

export {
	type DocumentInfo,
	DOCUMENT_METADATA_MAP,
	getFriendlyDocumentInfo
} from '$lib/config/documents.js';

