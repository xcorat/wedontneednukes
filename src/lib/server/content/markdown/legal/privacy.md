---
title: Privacy Policy
summary: How We Don't Need Nukes handles authentication, vote data, and OAuth information.
updatedAt: "2026-09-13"
---

*Effective Date: September 13, 2026*

## 1. Our Privacy Commitment

**We Don't Need Nukes** is built on a privacy-first foundation. We do not sell user data, build advertising profiles, or monetize your participation. Our data collection is strictly limited to what is necessary to record public consensus and authenticate supporters.

## 2. Information We Collect

### A. Anonymous Voting
- If you participate anonymously without creating an account, we issue a random, rotating session identifier (`anon_id`) stored in an HTTP-only cookie.
- This identifier is used solely to deduplicate responses on your device and allow you to view your recorded choices. It is not tied to your real-world identity.

### B. Authenticated Accounts & Third-Party OAuth
When you choose to sign in using an email magic link or a third-party OAuth provider (**Google**, **GitHub**, or **X / Twitter**), we receive only basic profile information:
- **Email address** (when provided by you or your OAuth profile).
- **Display name / Username**.
- **Public avatar image URL**.
- **Provider Account ID** (a unique ID from the OAuth provider to verify your login).

> [!NOTE]
> We never request broad OAuth scopes. We do not access your private repositories, Google Drive files, contacts, social timelines, or direct messages.

### C. Campaign Choices & Pledges
- Your answers to the core consensus question and any voluntary commitment tiers you choose to take.

### D. Bot Prevention & Security
- We use **Cloudflare Turnstile** to protect against automated bots and spam. Turnstile assesses risk using non-intrusive browser signals without using tracking cookies or profiling you across other websites.

## 3. How We Use Your Information

We use the information we collect exclusively to:
- Authenticate your identity and maintain your active session.
- Accurately tally and display aggregate community consensus statistics.
- Allow you to review, claim, or update your pledge history.
- Protect the platform against malicious attacks and automated vote stuffing.

## 4. What We Never Do

- **We never sell, rent, or trade your personal data** to third parties or data brokers.
- **We never serve third-party behavioral advertisements.**
- **We never link anonymous votes to personal accounts** without your explicit action (such as clicking "Claim Vote" while logged in).

## 5. Data Retention and Account Deletion

You retain complete ownership over your account data:
- **Edit Profile**: You can update your display name and privacy settings in [Profile Settings](/settings/profile).
- **Unlink Providers**: You can manage or disconnect linked social logins in [Connected Accounts](/settings/account).
- **Account Deletion**: You can delete your account and all associated personal records at any time via [Security Settings](/settings/security).

## 6. Cookies and Local Storage

We use only essential cookies required for:
- Session authentication (Better Auth secure session tokens).
- Anonymous voter deduplication (`anon_id`).
- Interface preferences (such as your chosen visual theme).

We do not deploy third-party analytics or marketing tracking pixels.

## 7. Changes to this Policy

If we make changes to this policy, we will update the "Effective Date" at the top of this page. Substantial changes will be highlighted across the platform.
