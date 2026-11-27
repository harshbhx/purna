# Security

Purna Family stores practice results that families choose to share. If you find a way to read or change someone else's sessions, notes or doctor links, please email **harsh@dualmindlab.tech** instead of opening a public issue. I'll reply within 3 days.

What's in place: family keys and doctor tokens are 32 random bytes and only their SHA-256 hashes are stored; doctor links expire (7 days by default) and can be revoked; the web app's Content Security Policy allows scripts only from its own origin, with no inline scripts and no third-party scripts, and React renders all user text as text; sessions are validated field by field and capped at 64 KB.

Known limit: pairing codes are 4 characters from a 31-letter alphabet and live for 72 hours. Add the Workers rate-limiting binding on `POST /api/v1/pair` before real patient use.

Purna is a practice tool, not a medical device.
