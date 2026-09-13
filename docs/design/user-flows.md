# [ESTABLISHED] User Flows

For full data schemas, anonymous identity strategy, and gated question trees, see [User Flows, Form Modularization & Gated Questions Architecture](user-flows-and-data-architecture.md).

---

## Flow 1: First-Time Visitor Journey

```mermaid
sequenceDiagram
    autonumber
    actor Visitor
    participant Landing as / (QuestionHeroWidget)
    participant Auth as /auth (JoinFormWidget)
    participant Pledge as /pledge (PledgeFormWidget)
    participant Results as /results (ResultsWidget)

    Visitor->>Landing: Visits site
    Landing->>Visitor: Displays Hero ("Agree" vs "We do | Not sure")
    Visitor->>Landing: Clicks stance ("Agree" / "Other")
    Landing->>Auth: Navigates with ?answer=no|yes

    alt Authenticated / Social / Magic Link
        Visitor->>Auth: Enters email or clicks Google/GitHub/FB/X
        Auth->>Visitor: Verifies Turnstile + delivers session
    else Anonymous Guest
        Visitor->>Auth: Clicks "Continue anonymously →"
        Auth->>Auth: Issues HTTP-only anon_id cookie
    end

    Auth->>Pledge: Navigates to /pledge?answer=...
    Visitor->>Pledge: Selects commitment levels (passive, active, direct)
    Visitor->>Pledge: Clicks "Confirm Pledge"
    Pledge->>Results: Submits form action and redirects

    Results->>Visitor: Shows consensus percentage bars with "You" marker
```

---

## Flow 2: Returning Anonymous Visitor (Vote Claiming)

```mermaid
sequenceDiagram
    autonumber
    actor Anon as Returning Anon
    participant Server as +page.server.ts
    participant Results as /results
    participant DB as Cloudflare D1

    Anon->>Results: Revisits / or /results (with anon_id cookie)
    Server->>DB: Detects existing pledge by anon_id
    Server->>Results: Renders ResultsWidget + ClaimVoteBanner

    Anon->>Results: Clicks "Claim vote & sign in"
    Results->>Anon: Expands inline JoinFormWidget
    Anon->>Results: Signs in via email or OAuth
    Server->>DB: Atomic migration: UPDATE pledge SET user_id = user.id, anon_id = NULL
    Results->>Anon: Permanent pledge saved under user profile!
```

---

## Flow 3: Returning Authenticated User

```mermaid
graph LR
    A[Direct URL or Returning] --> B[Server Loader +page.server.ts]
    B -->|Active Session| C[/pledge or /results]
    C --> D[View Stance & Edit Pledge]
    D --> E[Settings & Profile Management]
    E --> F[Share Campaign]
```

---

## Flow 4: Content Contributor & Community Media (Phase 2)

```mermaid
graph LR
    A[Pledger Login] --> B[Campaign Landing]
    B --> C[Contribute CTA]
    C --> D[Upload Meme/Video via R2]
    D --> E[Moderation Queue]
    E --> F[Community Gallery]
    F --> G[Community Upvoting & Ranking]
    G --> H[Top Voted Promoted to Share Badges]
```

---

## Flow 5: Contextual Guidance & FAQ

Each commitment level and stance choice contains integrated `InfoTooltip` controls operating in responsive mode:
- On mobile devices: compact tap/hover popup tooltip.
- On desktop devices: permanent inline helper text for rapid visual scanning.
