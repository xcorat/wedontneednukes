Your constraints make the model coherent. The earlier review was arguing against a different product (secret salt, SHA-claimed FNV, hash-as-CMS-id). With “IPFS-style uniqueness of `(type, question text, answer labels)`, Q and A separable, public prefix, MVP canonicalization,” the design snaps into place.

Public prefix is correct. It is not a secret and should not live in private env.

---

## Decisions, locked

| Decision | Choice |
|---|---|
| What is unique | `type` + question text + answer **labels** |
| Out of identity | slug, context, FAQ, order, campaign, UI, choice `value` / internal ids |
| Hash shape | SHA-256, public domain prefix, 24 hex (96 bits) in ids |
| Q vs A | separate content hashes, plus one composite question id |
| Salt | public app prefix, not a secret |
| Canonicalization v1 | small, versioned, replaceable |
| Types | base record + discriminated variants |
| Choice `id` | internal, scoped to the question |
| Choice `label` | public, in the answer-set hash |

24 hex is the right default for a “maybe 1B someday” id. 64-bit (16 hex) is too tight at that scale; 128-bit (32 hex) is fine if you prefer not to think about it. Similarity search is **not** what these hashes do — they only give exact-duplicate and exact-reuse. Plan embeddings/trigrams later; store the original text for that.

---

## 1. Identity model (IPFS-style, split Q and A)

Three hashes, not one concatenated string.

```
textHash      = H( prefix | "qt" | canon(text) )
labelHash     = H( prefix | "al" | canon(label) )      // per answer
answerSetHash = H( prefix | "as" | sort(unique labelHashes) )
id            = H( prefix | "qa" | type | textHash | answerSetHash )
```

What that buys you:

- Same prompt, new options → same `textHash`, new `answerSetHash`, new `id`
- New prompt, same options (`Agree` / `We do | Not sure`) → new `textHash`, same `answerSetHash`, new `id`
- Same prompt + options, different `type` → same text/set hashes, new `id`
- Duplicate detection is an index lookup, not a string compare
- Later “similar questions” can start from shared `textHash` / shared `answerSetHash` as exact buckets, then fuzzy-search the leftovers

Choice internal id stays off this surface:

```
choiceId = H( prefix | "opt" | questionId | labelHash )
```

or simply the composite primary key `(questionId, labelHash)` and keep `choiceId` as a short prefix of that hash. `value` (`agree`, `true`, …) is an alias for application code. Changing `value` must not change identity. Changing `label` must.

That matches your rule: **label is public and part of uniqueness; choice id is internal.**

---

## 2. Public prefix is the right “salt”

A public prefix is domain separation, not authentication.

- Same bytes hashed under `wdnn-qa-v1` vs some other app should not collide in a shared index
- Anyone may recompute and verify; that is the point of content addressing
- Rotating a *secret* salt would rewrite every id. A public prefix is bumped only with a schema version (`v1` → `v2`) when canonicalization rules change

Do not put this in `$env/dynamic/private`. Put a constant in the shared module:

```ts
export const QA_HASH_VERSION = 1;
export const QA_HASH_PREFIX = `wdnn-qa-v${QA_HASH_VERSION}`;
```

“First generated on the server” should mean: **fixtures and DB rows are written by server/build code** so you never persist two slightly different client computations. The function itself must be pure and isomorphic (`crypto.subtle` in the browser, `node:crypto` on the server — same UTF-8 bytes in, same hex out). The browser may verify; it should not be the source of truth for what gets inserted.

---

## 3. Do not concat. Use length-prefixed tagged fields.

`text + ":" + labels.join("|")` is how `foo|bar` + `baz` collides with `foo` + `bar|baz`.

MVP encoding:

```ts
function field(tag: string, value: string): string {
  return `${tag}:${value.length}:${value}`;
}

function digestInput(parts: string[]): string {
  return [QA_HASH_PREFIX, ...parts].join('|');
}
```

Examples:

```
wdnn-qa-v1|qt:22:we don't need nukes !
wdnn-qa-v1|al:5:agree
wdnn-qa-v1|as:al_aaa,al_bbb
wdnn-qa-v1|qa:single_choice|qt_…|as_…
```

That is enough structure. You do not need CBOR/CIDs for MVP. If you ever emit real CIDs, this same byte string becomes the CID payload.

Hash function:

```ts
async function sha256Hex(s: string): Promise<string> {
  const bytes = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function shortHash(s: string, n = 24): Promise<string> {
  return (await sha256Hex(s)).slice(0, n);
}
```

Use **24** in ids (`qt_`, `as_`, `q_`, `al_`, `opt_`). Store the full 64-hex SHA-256 in a `contentSha256` column if you want collision insurance without fat URLs. At 1B items, 96-bit birthday risk is negligible; 64-bit is not.

Synchronous FNV can stay as a debug fingerprint. It is not an id.

---

## 4. Canonicalization v1 — small on purpose

Hashes need a defined byte string. Similarity search needs the **original** string. Split them.

```ts
/** Identity folding only. Display text is stored raw. */
export function canonicalizeText(input: string): string {
  return input
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}
```

v1 rules, and only these:

1. Unicode NFC
2. Trim
3. Collapse any whitespace run to one space
4. Lowercase (`toLowerCase` is enough while the product is English)

Explicitly **not** in v1: punctuation stripping, apostrophe folding (`'` vs `’`), stemming, stop-word removal, markdown peeling. Those belong in the future similar-text pipeline, not in the identity hash.

Why this split matters:

- `"We don't need nukes !"` and `"we don't need nukes !"` → same `textHash`
- `"We don't need nukes!"` (no space before `!`) → **different** `textHash` in v1
- That second pair is what “similar Q” search is for. Do not pretend the hash is fuzzy.

When you tighten folding in v2, bump `QA_HASH_VERSION`. Old rows keep v1 ids. Optionally backfill a `textHashV2` column. Never mutate a stored id.

Store `text` / `label` exactly as authored. Recompute canonical form at hash time. Do not persist canonical text unless you want it for search indexing — then it is a search field, not an identity field.

---

## 5. Answer-set rules

- Identity of a set = sorted unique `labelHash`es. Order of buttons is display, not identity.
- Duplicate labels in one question are a validation error, not two hashes.
- Empty labels are a validation error.
- For `text` / `scale` questions there is no answer set: use a sentinel `answerSetHash = H(prefix | "as" | type | "∅")` so the composite id formula stays one function.
- Do not put `value`, `description`, `orderIndex`, or UI variant into `answerSetHash`.

---

## 6. Domain types: base + variants

One blob with `choices` on every kind was the mistake. Keep a shared identity/header, then narrow `ans`.

```ts
export type QuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'scale'
  | 'text';

export interface FaqItem {
  id: string;
  text: string;
  link: string;
  description?: string;
}

export interface AnswerChoice {
  id: string;       // internal, derived
  labelHash: string;
  value: string;    // internal alias, e.g. "agree"
  label: string;    // public, identity-bearing
  description?: string;
  orderIndex: number;
}

interface QuestionIdentity {
  id: string;             // q_<24>
  contentSha256: string;  // full digest of the qa payload
  textHash: string;       // qt_<24>
  answerSetHash: string;  // as_<24>
  hashVersion: 1;
}

interface QuestionHeader extends QuestionIdentity {
  slug: string;
  text: string;           // raw display
  context?: string;
  faq?: FaqItem[];
  orderIndex: number;
  isActive: boolean;
}

export interface SingleChoiceConfig {
  type: 'single_choice';
  choices: AnswerChoice[];
}

export interface MultiChoiceConfig {
  type: 'multi_choice';
  choices: AnswerChoice[];
  minSelections: number;
  maxSelections?: number;
}

export interface ScaleConfig {
  type: 'scale';
  min: number;
  max: number;
  step?: number;
  labels?: Record<number, string>; // tick labels; decide later if these enter identity
}

export interface TextConfig {
  type: 'text';
  maxLength?: number;
}

export type AnswerConfig =
  | SingleChoiceConfig
  | MultiChoiceConfig
  | ScaleConfig
  | TextConfig;

export type Question =
  | (QuestionHeader & { type: 'single_choice'; ans: SingleChoiceConfig })
  | (QuestionHeader & { type: 'multi_choice'; ans: MultiChoiceConfig })
  | (QuestionHeader & { type: 'scale'; ans: ScaleConfig })
  | (QuestionHeader & { type: 'text'; ans: TextConfig });
```

Drop `bool`. The hero is `single_choice` with values `agree` / `other` and labels `Agree` / `We do | Not sure`. A two-option boolean with asymmetric copy is a loaded single choice; keep it in that variant so analytics stay in label space.

`scale` tick labels: leave them **out** of v1 identity unless you decide ticks are the answers. If they are, that variant should hash as an answer set of those labels.

UI types stay in `qa-ui.ts`. Key `choiceStyles` by `value` (`agree`), never by `opt_…`.

---

## 7. Suggested hash module shape

```ts
export async function hashQuestionText(text: string): Promise<string> {
  const c = canonicalizeText(text);
  return `qt_${await shortHash(digestInput([field('qt', c)]))}`;
}

export async function hashAnswerLabel(label: string): Promise<string> {
  const c = canonicalizeText(label);
  return `al_${await shortHash(digestInput([field('al', c)]))}`;
}

export async function hashAnswerSet(labels: string[]): Promise<string> {
  const hashes = [...new Set(await Promise.all(labels.map(hashAnswerLabel)))].sort();
  return `as_${await shortHash(digestInput([field('as', hashes.join(','))]))}`;
}

export async function hashQuestionId(
  type: QuestionType,
  text: string,
  labels: string[]
): Promise<{
  id: string;
  contentSha256: string;
  textHash: string;
  answerSetHash: string;
  hashVersion: 1;
}> {
  const textHash = await hashQuestionText(text);
  const answerSetHash =
    type === 'text' || type === 'scale'
      ? await hashAnswerSet([]) // or the sentinel path
      : await hashAnswerSet(labels);

  const payload = digestInput(['qa', type, textHash, answerSetHash]);
  const full = await sha256Hex(payload);
  return {
    id: `q_${full.slice(0, 24)}`,
    contentSha256: full,
    textHash,
    answerSetHash,
    hashVersion: 1
  };
}

export async function hashChoiceId(questionId: string, label: string): Promise<string> {
  const labelHash = await hashAnswerLabel(label);
  return `opt_${await shortHash(digestInput(['opt', questionId, labelHash]), 16)}`;
}
```

Hero fixture (server/build):

```ts
const HERO_TEXT = "We don't need nukes !";
const HERO_LABELS = ['Agree', 'We do | Not sure'];

const identity = await hashQuestionId('single_choice', HERO_TEXT, HERO_LABELS);

export const heroQuestion: Question = {
  ...identity,
  slug: 'hero',
  type: 'single_choice',
  text: HERO_TEXT,
  context: 'One fundamental premise. Share your perspective.',
  faq: [/* stable UUID fixtures, not hashed */],
  ans: {
    type: 'single_choice',
    choices: [
      {
        id: await hashChoiceId(identity.id, 'Agree'),
        labelHash: await hashAnswerLabel('Agree'),
        value: 'agree',
        label: 'Agree',
        orderIndex: 0
      },
      {
        id: await hashChoiceId(identity.id, 'We do | Not sure'),
        labelHash: await hashAnswerLabel('We do | Not sure'),
        value: 'other',
        label: 'We do | Not sure',
        orderIndex: 1
      }
    ]
  },
  orderIndex: 0,
  isActive: true
};
```

Generate this once in a seed/build script, commit the resulting ids if you want deterministic snapshots in git, or generate on server start and persist. Do not recompute from two different canonicalize implementations.

---

## 8. Persistence changes that follow

`id` is the composite `q_…`. Keep `text_hash`, `answer_set_hash`, and full `content_sha256` as columns. Drop the duplicate `hash` field that mirrored `id`.

Useful uniques:

- `question.id` PK
- unique `content_sha256`
- unique `(campaign_id, slug)` — slug is the product handle, not the content id
- unique `(question_id, label_hash)` on choices
- unique response `(user_id, question_id)` and `(anon_id, question_id)` (partial indexes)

You can now query:

- all questions with this prompt: `where text_hash = ?`
- all questions with this option set: `where answer_set_hash = ?`
- exact reuse: `where id = ?` or `content_sha256 = ?`

`campaign_id` still does not belong on the identity record. Prefer `campaign_question(campaign_id, question_id, order_index)` so the same content object can appear in more than one flow.

Responses should store `question_id` + `content_sha256` (or `text_hash` + `answer_set_hash`). If you ever edit copy, you insert a new question row and leave old answers attached to the old id. That is the whole point of content addressing. Slug `hero` can point at the current row via the join table or a `published_question_id` pointer.

---

## 9. What this still is not

- Not fuzzy similarity. `qt_abc` equality means “same folded bytes,” not “same meaning.” Your later similar-Q index should run on raw (or lightly folded) text; use these hashes only to short-circuit exact dupes and to group shared answer sets.
- Not tamper evidence against a hostile client. Public prefix + SHA-256 means *anyone* can mint a valid id for any text. Integrity of **who answered** is auth/anon cookies + server write path, not the hash.
- Not IPFS interop until you wrap the digest in a real CID. The *style* is enough for MVP.

---

## 10. MVP test list (short)

1. Same text/labels/type → identical `id`, `textHash`, `answerSetHash` on node and browser.
2. Change only text → `textHash` and `id` change; `answerSetHash` does not.
3. Change only one label → `answerSetHash` and `id` change; `textHash` does not.
4. Swap choice order → same `answerSetHash` and `id`.
5. Same text and labels, `single_choice` vs `multi_choice` → same text/set hashes, different `id`.
6. `"  We   don't need nukes ! "` → same `textHash` as the hero text.
7. `"We don't need nukes!"` → different `textHash` (v1 does not strip punctuation/spacing inside tokens).
8. Concat trap: labels `["a|b","c"]` vs `["a","b|c"]` → different `answerSetHash`.
9. Prefix/version bump → nothing matches v1 ids.
10. Choice `value` rename `agree` → `yes` → same all content hashes; only internal alias changes.

---

**Bottom line:** treat `textHash` and `answerSetHash` as first-class content addresses, `id` as their typed product, slug as the mutable product handle, and choice `value` as an internal binding key for UI and stats. Public prefix + SHA-256-24 + NFC/trim/space/lower is enough for MVP and does not paint you into the old FNV/`id === hash`/bool-blob corner. Fuzzy matching stays a search problem on the raw strings; the hashes only tell you “this is the same object.”
