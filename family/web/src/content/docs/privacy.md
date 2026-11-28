# Privacy

Purna handles results from a health-related practice, so we collect as little as we can, keep it only as long as it's useful, and give you control. This page applies wherever you live.

**Who runs Purna:** Harsh Bhanushali (DualMind Labs). Contact: [harsh@dualmindlab.tech](mailto:harsh@dualmindlab.tech).

## The short version

- The glasses send **no name, face, camera image, sound or location**.
- Nothing is shared unless the carer turns **Share with family** on and pairs the glasses.
- We **don't sell** data, show ads, use analytics trackers, or use your data to train AI models.
- You can **delete everything** yourself, at any time, from the dashboard.

## What we store

| Data | Where it comes from | Why |
|---|---|---|
| Session results: positions of the diyas, which were lit and when, hints, head turn angles, the summary sentence, the settings used | The glasses, when sharing is on | To show the family and the therapist how practice is going |
| A random device ID (32 characters) | The glasses | To link sessions from the same glasses |
| A display name, such as "Papa" | Typed by the family when pairing | To label the dashboard. It doesn't need to be a real name |
| Notes from the therapist | Written on the doctor link | To pass advice to the family |
| Family keys and doctor-link tokens | Created by the server | To let you in. Stored only as one-way SHA-256 hashes, so even a copy of the database can't open a dashboard |

We **don't** collect email addresses, phone numbers, dates of birth, medical records, photos, or anything from the glasses' cameras or microphones.

## On your device

The site uses no cookies. Your browser keeps the family link and your language choice in local storage, and a therapist's link token in session storage (cleared when the tab closes). **Sign out here** removes the family link from that device.

## Where it's kept

Purna Family runs on Cloudflare (Workers and the D1 database), which acts as our hosting provider. Requests are handled on Cloudflare's global network, so data may be processed in countries other than yours. Cloudflare keeps short-lived request logs for troubleshooting, and the caller's IP address is used briefly to rate-limit pairing attempts; we don't store IP addresses with your data.

## How long we keep it

| Data | Kept for |
|---|---|
| Sessions from glasses that are never paired | 30 days, then deleted automatically |
| A paired family's sessions and notes | Until the family presses **Delete everything** |
| Doctor links | They stop working after 7 days or when stopped; their records are deleted 30 days after that |
| Pairing codes | 72 hours |

## Your choices and rights

- **See** your data: it's all on your dashboard. The therapist view can download it as CSV.
- **Correct** it: ask us, or delete and start again.
- **Delete** it: **Delete everything** removes every session, note, doctor link and the paired glasses at once. It can't be undone.
- **Withdraw** consent: turn **Share with family** off on the glasses, stop any doctor link, or delete everything.
- **Ask us** anything, or ask for a copy of your data: write to [harsh@dualmindlab.tech](mailto:harsh@dualmindlab.tech). We'll reply within 30 days. We may need to confirm you hold the family link.
- **Complain** to the data-protection authority where you live (for example, a supervisory authority under the EU or UK GDPR, or India's Data Protection Board).

## Children

Purna is for adults. Spectacles are for people 18 and over, and Purna Family isn't meant for anyone under 18.

## Security

Sessions are checked field by field and limited in size; pairing, uploads and notes are rate-limited; the site allows scripts only from itself. If something does go wrong and your data is affected, we'll tell you as soon as we can, in plain words: what happened, what it might mean, and what we're doing. To report a security problem, see [Report a problem](#report).

## Changes

If this page changes in a way that matters, we'll say so on the site. Last reviewed: 28 November 2026.
