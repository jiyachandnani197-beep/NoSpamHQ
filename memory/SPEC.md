# NoSpamHQ MVP Spec

## Product
NoSpamHQ is a cybersecurity-oriented analysis workspace for suspicious emails, messages, URLs, and attachments. The public demo works without authentication; authenticated users can create heuristic analyses and review their private scan history.

## Data model
- `User`: id, full name, email, optional company, created timestamp
- `Scan`: id, scan type, target, risk score, risk level, threat indicators, summary, recommendation, status, created timestamp
- Auth sessions are server-owned, in-memory, and represented in the browser by an httpOnly `nsh_session` cookie

## Key flows
1. Home → Demo → choose a threat type → submit example → structured result → Create a Free Account
2. Register or Login → Dashboard → select a scanner → submit content → result report → Scan History
3. History supports type, risk, and text filtering. Settings shows account identity and a local preference control.

## Analysis behavior
The first MVP uses lightweight server-side heuristics. It detects urgency, credential requests, link patterns, sender context, reward scams, URL anomalies, and active attachment extensions. It is decision support, not a guarantee or a replacement for organizational security policy.

## Auth and storage
Email/password registration and login use httpOnly, SameSite=Lax server sessions. Users, passwords, sessions, and scans are intentionally in memory for this demo and reset when the backend restarts. No accounts are seeded.

## Visual system
Light public site, dark navy workspace shell, restrained navy/blue/teal palette, Manrope typography, thin borders, compact radii, and no invented certifications or statistics.

## Recent UI update
Risk statuses are plain text indicators with icons rather than pill badges. Authenticated Dashboard and scanner routes include a floating Google & Gmail connection tab with a clearly labeled Coming soon state; it is visual-only and has no OAuth or Gmail integration.

Settings now also includes a dedicated Gmail integration placeholder showing disconnected status, future capability context, privacy guidance, and a disabled Connect Gmail action marked Coming soon. This flow is visual-only.