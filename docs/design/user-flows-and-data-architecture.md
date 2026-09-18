# User Flows, Form Modularization & Gated Questions Architecture

## Overview

This document outlines the user flow architecture, component modularization, anonymous state strategy, and the extensible gated-questions data layer for **We Don't Need Nukes**.

---

## 1. User Flows & State Detection

The application dynamically routes visitors based on their identity and prior engagement:

```mermaid
stateDiagram-v2
    [*] --> DetectUserState

    state DetectUserState <<choice>>
    DetectUserState --> LoggedInUser : Active Session (Better Auth)
    DetectUserState --> ReturningAnon : anon_id Cookie + Recorded Vote
    DetectUserState --> FirstTimeVisitor : New / Unrecognized

    state FirstTimeVisitor {
        [*] --> Step1_Hero : / (or /onboarding/wedontneednukes)
        Step1_Hero --> Step2_Pledge : Agree ("No") routes to Pledge
        Step1_Hero --> Step3_Join : Other ("Yes") routes to Join
        Step2_Pledge --> Step3_Join : Selects Commitment Tiers
        Step3_Join --> Step4_Results : Signs In or Continues Anonymously
    }

    state ReturningAnon {
        [*] --> AnonLandingView : Visits / or /onboarding/results
        note right of AnonLandingView: 1. Results Widget (highlights their vote)<br/>2. Claim Vote Banner (Join/Login CTA)<br/>3. What's Next & Share Hub
        AnonLandingView --> ClaimFlow : Clicks Join / Sign In
        ClaimFlow --> LoggedInUser : Migrates anon_id responses to user_id
    }

    state LoggedInUser {
        [*] --> DashboardView : Visits / or /dashboard
        note right of DashboardView: 1. Live Campaign Results<br/>2. User's Stance & Commitment Badges<br/>3. Next Unlocked Gated Questions<br/>4. Action / Share Tools / AI Assistant
    }
```

### Flow Matrix

| Visitor State | Entry Point | Primary View | CTAs / Capabilities |
| :--- | :--- | :--- | :--- |
| **New Visitor** | `/` or `/onboarding/wedontneednukes` | **Step 1 · Hero Question**: *"We don't need Nukes !"*, "Why?", Agree / Other | Agree → moves to `/onboarding/pledge?answer=no`<br/>Other → moves to `/onboarding/join?answer=yes` |
| | `/onboarding/pledge` | **Step 2 · Pledge Form**: Multi-select commitment tiers (Ally, Advocate, Contributor) | Selects tiers → moves to `/onboarding/join` |
| | `/onboarding/join` | **Step 3 · Join / Record**: Magic link, OAuth (4 providers), or "Continue as guest" | Signs in or skips → moves to `/onboarding/results` |
| | `/onboarding/results` | **Step 4 · Results Hub**: Community results, vote claim banner, social share, What's Next hub | Claim vote, share campaign, open AI Assistant |
| **Returning Anon** | `/` or `/onboarding/results` | **Results + Claim Card**: Live stats with "You" badge + inline Join card | "Claim your vote", explore campaigns |
| **Public Visitor** | `/results` & `/results/votes` | **Public Transparency Stream**: Aggregated distribution + paginated verified votes | View public voting stream, filter by stance |
| **Returning Member** | `/` or `/dashboard` | **Dashboard**: Live stats, active commitments, next unlocked question | Answer follow-up questions, access AI Assistant, edit profile |

---

## 2. Component Modularization

Form and engagement logic is decoupled into independent widgets under `src/lib/components/widgets/`:

- **`<QuestionHeroWidget />`**: Primary premise ("We don't need Nukes !"), "Why?" link, and big choice buttons.
- **`<PledgeFormWidget />`**: Multi-select commitment tiers (`passive`, `active`, `direct`) with descriptions, progressive enhancement submit (`use:enhance`), and feedback notes.
- **`<JoinFormWidget />`**: Magic link + OAuth (Google, GitHub, Facebook, Twitter) + Turnstile + anonymous skip option.
- **`<ResultsWidget />`**: Animated Agree vs Other distribution bars, total counts, percentages, and personalized "You" stance marker.
- **`<ClaimVoteBanner />`**: Prompts anonymous voters to claim and link their pledge with quick sign-in.
- **`<SocialShareWidget />`**: One-click sharing for X, Bluesky, Threads, Facebook, WhatsApp, LinkedIn, and copy link.
- **`<ResearchChatWidget />`**: Grounded AI chat widget with streaming text, document citations drawer, and starter inquiries.
- **`<ChatDrawer />`**: Floating wiki trigger (`🤖 Ask Questions`) and slide-over panel with unauthenticated login guidance.
- **`<StepHeaderWidget />`**: Standardized onboarding navigation bar with back button and stance badge.
- **`<GatedQuestionWidget />`**: Dynamic renderer for whichever follow-up question is currently unlocked for the user.

---

## 3. Anonymous Session & Persistence Strategy

### What is Stored for Anonymous Users?
1. **HTTP-only Cookie (`anon_id`)**:
   - Random UUID (v4) set with `HttpOnly`, `SameSite=Lax`, `Secure`, and `Max-Age=1 year`.
   - **Why?** Enables instant server-side SSR routing in SvelteKit `+page.server.ts` before any HTML is sent to the client, preventing flash-of-unauthenticated-content (FOUC).
2. **Server DB Record (`user_response` / `pledge`)**:
   - Stores `anon_id`, `question_id`, selected choice/options, and timestamp.
3. **Client LocalStorage Cache (`wdnn_anon_state`)**:
   - Caches the choice and timestamp for instant client-side hydration and optimistic UI rendering.

### Vote Claiming & Account Linking
When an anonymous visitor later registers or logs in:
1. The auth callback or sign-in handler checks for an active `anon_id` cookie.
2. An atomic SQL transaction updates all responses linked to that `anon_id`:
   ```sql
   UPDATE user_response
   SET user_id = :userId, anon_id = NULL
   WHERE anon_id = :anonId;
   ```
3. The user is redirected to `/dashboard`, retaining their full voting and pledge history.

---

## 4. Gated Questions Data Layer

Rather than hardcoded columns on the `pledge` table, a question-tree model allows chaining arbitrary follow-up questions gated by previous answers.

```mermaid
erDiagram
    CAMPAIGN ||--o{ QUESTION : contains
    QUESTION ||--o{ QUESTION_OPTION : offers
    QUESTION ||--o{ QUESTION_GATE : gated_by
    QUESTION ||--o{ USER_RESPONSE : receives
    USER ||--o{ USER_RESPONSE : submits

    QUESTION {
        string id PK
        string campaign_id FK
        string key "core_stance, commitment_tier, etc."
        string prompt
        string question_type "single_choice, multi_choice, scale"
        int order_index
        boolean is_active
    }

    QUESTION_OPTION {
        string id PK
        string question_id FK
        string value "no, yes, passive, active, direct"
        string label
        string badge
        int order_index
    }

    QUESTION_GATE {
        string id PK
        string target_question_id FK "Question being unlocked"
        string parent_question_id FK "Prerequisite question"
        string operator "eq, in, not_in"
        json required_values "['no'], ['active', 'direct']"
    }

    USER_RESPONSE {
        string id PK
        string campaign_id FK
        string question_id FK
        string user_id FK "Nullable for anon"
        string anon_id "Nullable for logged-in"
        json selected_option_ids
        string raw_value
        datetime created_at
    }
```

### Concrete Question Hierarchy Example
1. **`q_core_stance`** (Root Question — unlocked for everyone):
   - *"We don't need nukes"*
   - Options: `agree` (no nukes), `other` (we do | not sure)
2. **`q_commitment_tier`** (Gated: `q_core_stance == 'agree'`):
   - *"Choose your commitment level"*
   - Options: `passive` (Baseline), `active` (Civic), `direct` (Action)
3. **`q_political_action`** (Gated: `q_commitment_tier IN ['active', 'direct']`):
   - *"Which civic/political actions do you support?"*
   - Options: `lobbying`, `divestment`, `peace_coalitions`, `public_education`
4. **`q_dissent_perspective`** (Gated: `q_core_stance == 'other'`):
   - *"What is your main perspective regarding nuclear weapons?"*
   - Options: `deterrence_necessary`, `geopolitical_balance`, `verification_concerns`, `undecided`
