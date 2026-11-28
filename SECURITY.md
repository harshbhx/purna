# Security

Purna Family stores practice results that families choose to share. If you find a way to read or change someone else's sessions, notes or doctor links, please email **harsh@dualmindlab.tech** instead of opening a public issue. I'll reply within 3 days.

What's in place: family keys and doctor tokens are 32 random bytes and only their SHA-256 hashes are stored; doctor links expire (7 days by default) and can be revoked; the web app's Content Security Policy allows scripts only from its own origin, with no inline scripts and no third-party scripts, and React renders all user text as text; sessions are validated field by field and capped at 64 KB; pairing, session uploads and doctor notes are rate-limited (`family/src/lib/limits.ts`); data from glasses that are never paired is deleted after 30 days and ended doctor links 30 days after they end (`family/src/cleanup.ts`). The privacy notice for families is at https://purna.dualmindlab.tech/docs#privacy.

Known limit: pairing codes are 4 characters from a 31-letter alphabet and live for 72 hours. Pairing allows 10 tries a minute per IP, but Cloudflare's limiter counts per location and is approximate, so many IPs together could still guess codes. Use longer codes or a global limit before real patient use.

Purna is a practice tool, not a medical device.
