# OSINT Tool (MVP)

Modular OSINT lookup tool built with Next.js, Prisma, and PostgreSQL.

## Scope (MVP)
- Email intelligence: syntax, MX, SPF, DMARC, disposable check, domain age, HIBP breach lookup, Gravatar
- Domain intelligence: WHOIS, DNS, SSL, security headers, tech detection, certificate transparency
- Username intelligence: public profile checks on GitHub, GitLab, Reddit, StackOverflow, Medium
- No authentication in MVP (add Better Auth / NextAuth later)

## Explicitly out of scope
This project intentionally does NOT do cross-platform *email* account enumeration
(i.e. probing internal/private platform APIs with spoofed clients to check whether
an email address has an account on dozens of services). That pattern is used for
mass profiling/stalking and violates the ToS of virtually every platform it targets.
The Username module instead checks public profile pages/APIs for a given *username*,
which is the same technique tools like Sherlock use for their legitimate checks.

## Setup
\`\`\`bash
npm install
cp .env.example .env   # fill in DATABASE_URL and HIBP_API_KEY
npx prisma migrate dev --name init
npm run dev
\`\`\`

## Structure
See /app, /services, /components, /prisma, /lib, /types.
