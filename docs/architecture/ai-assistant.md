# [ESTABLISHED] AI Assistant & Research Grounding Engine

The **AI Assistant** ("We dont need nukes!") is a retrieval-augmented generation (RAG) engine that answers questions about nuclear disarmament, deterrence myths, international treaties, and movement strategy using authoritative research documents.

---

## 1. System Architecture

```mermaid
graph TD
    subgraph Client ["Client Layer (Svelte 5 + Runes)"]
        Drawer["ChatDrawer.svelte\n(Wiki Floating Action Trigger)"]
        FullPage["/assistant (+page.svelte)\n(Reference Document Browser & Chat)"]
        AskUs["AskUsButton.svelte\n(Contextual CTA in Results Hub)"]
        Widget["ResearchChatWidget.svelte\n(Streaming Chat, Citations, Markdown)"]

        Drawer --> Widget
        FullPage --> Widget
        AskUs --> FullPage
    end

    subgraph Edge ["Cloudflare Workers Edge (SvelteKit)"]
        ChatAPI["/api/chat (+server.ts)\n(Session Gate & SSE Streamer)"]
        AuthContext["SvelteKit locals.user\n(Session Enforcement)"]
        OpenAIClient["OpenAI Responses SDK\n(streamRAG / queryRAG)"]

        Widget -->|POST /api/chat (SSE)| ChatAPI
        ChatAPI --> AuthContext
        ChatAPI --> OpenAIClient
    end

    subgraph OpenAI ["OpenAI Platform"]
        Model["Configured Model\n(DEFAULT_OPENAI_MODEL / OPENAI_MODEL)"]
        VectorStore[("OpenAI Vector Store\n(OPENAI_VECTOR_STORE_ID)")]
        FileSearch["file_search Tool\n(Document Retrieval & Grounded Snippets)"]

        OpenAIClient --> Model
        Model --> FileSearch
        FileSearch --> VectorStore
    end
```

---

## 2. Core Architectural Invariants

1. **Grounded Only**: The assistant is strictly instructed via system prompt to base its responses exclusively on the ingested research library. It explicitly cites source documents and avoids ungrounded speculative assertions.
2. **Authenticated Access**: Access to `/api/chat` and `/assistant` requires an active session (`event.locals.user`). Anonymous visitors are prompted to sign in via a non-intrusive tooltip or inline prompt before querying.
3. **Edge Streaming (SSE)**: Responses stream incrementally over Server-Sent Events (SSE) through the Cloudflare Worker to the client, delivering immediate token rendering without edge buffering timeouts.
4. **SvelteKit Store Reactivity**: Client components subscribe to user session state through SvelteKit's `$app/stores` (`$page.data.user`), ensuring reactive propagation across layout, floating drawer, and page views.
5. **Decoupled Document Ingestion**: Document indexing is an offline CLI process (`scripts/ingest-vector-store.ts`) that uploads research PDFs and attaches them to an immutable OpenAI vector store referenced via `OPENAI_VECTOR_STORE_ID`.

---

## 3. Document Ingestion Pipeline

Authoritative research papers and treaties are placed in `downloads/` and indexed into the OpenAI Vector Store:

```
downloads/
├── 26_17_BASIC_Preparing-for-the-First-Review-Conference-of-the-TPNW...pdf
├── 26_18_BASIC_Envisioning-Future-Pathways-for-the-NPT...pdf
├── Addressing-Future-Nuclear-Crisis-Scenarios-in-South-Asia.pdf
├── atomic-responsiveness-how-public-opinion-shapes-elite-beliefs...pdf
├── civil-society-and-the-conference-on-disarmament-360.pdf
├── factshet_2017_treaty_prohibition_of_nuclear_weapons_web.pdf
├── mayors_for_peace_file-02_document_pack2_en.pdf
├── MSAS_BRIEF_FINAL.pdf
├── YB26 08 World Nuclear Forces.pdf
├── YB26 14 AI Governance.pdf
├── YB26 16 Space Governance.pdf
└── yb26_summary_en_0.pdf
```

### Ingestion CLI
```bash
# Uploads PDFs in downloads/ to OpenAI Files and attaches them to the Vector Store
pnpm run ingest:docs
```

Document metadata (titles, publishing organizations, publication years, categories, descriptions, and source URLs) is defined in `src/lib/config/documents.ts` (`DOCUMENT_METADATA_MAP`), allowing the UI to display rich citations and category filtering without querying external APIs.

---

## 4. Edge Endpoint Contract (`/api/chat`)

- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: text/event-stream` (for streaming)
- **Body**:
  ```json
  {
    "message": "Why is nuclear deterrence a dangerous narrative?",
    "stream": true
  }
  ```

### Streaming Responses (SSE)
- **Delta chunks**: `data: {"delta":"text chunk"}\n\n`
- **Completion event**:
  ```json
  data: {
    "done": true,
    "citations": [{"filename": "YB26 08 World Nuclear Forces.pdf", "fileId": "file_xyz"}],
    "model": "gpt-5-nano",
    "usage": { "prompt_tokens": 120, "completion_tokens": 340 }
  }
  ```
- **Error event**: `data: {"error":"Error description"}\n\n`

### Non-Streaming Fallback
When `stream: false` or `Accept: application/json`, returns `200 OK` with JSON payload `{ success: true, answer: string, citations: CitationItem[], model: string, usage: object }`.

---

## 5. Component Layer & Contracts

| Component | Path | Responsibility |
|---|---|---|
| `ResearchChatWidget` | `src/lib/components/widgets/ResearchChatWidget.svelte` | Core chat feed, markdown rendering (`renderMarkdown`), citation detail modal, starter inquiries, copy button, active send button. |
| `ChatDrawer` | `src/lib/components/widgets/ChatDrawer.svelte` | Floating trigger (`🤖 Ask Questions`) and slide-over panel scoped strictly to `/wiki` routes. Contains auth tooltip for unauthenticated visitors. |
| `AskUsButton` | `src/lib/components/AskUsButton.svelte` | Contextual button used in What's Next / Results hubs to route users directly to the assistant. |
| `BotButton` | `src/lib/components/BotButton.svelte` | Header/menu launcher icon with auth-awareness tooltip. |
| Assistant Page | `src/routes/assistant/+page.svelte` | Full 2-column view with reference document browser, category filter chips, and full-height chat widget. |

### UI Standards
- **Title**: `"We dont need nukes!"`
- **Subtext**: `"Ask why, how and what we can do as part of the larger global community of nuclear disarmamant community."`
- **Input Placeholder**: `"Ask away..."`
- **Send Button Activation**: The Send button is enabled as soon as the user is authenticated. Clicking Send with an empty input focuses the textarea. The button is disabled only while actively generating (`isGenerating`).

---

## 6. Configuration Architecture

The AI assistant subsystem is configured via decoupled, dedicated configuration modules:

- **Server-side AI Config** (`src/lib/server/config/ai.ts`):
  - Defines `DEFAULT_OPENAI_MODEL` (`gpt-5-nano`) and `SYSTEM_PROMPT`.
  - `getAIConfig(env)` resolves the effective model dynamically by checking `platform.env.OPENAI_MODEL`, `process.env.OPENAI_MODEL`, and falling back to `DEFAULT_OPENAI_MODEL`.
- **Client Starter Prompts** (`src/lib/config/chat.ts`):
  - Defines `STARTER_PROMPTS` array with suggested campaign and treaty inquiries.
- **Document Metadata & Publication URLs** (`src/lib/config/documents.ts`):
  - Maps filename to `title`, `organization`, `category`, `year`, `description`, and external `url` for direct public access to authoritative sources.

