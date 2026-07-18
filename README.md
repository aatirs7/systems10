# Systems 10 - Brand Outbound Engine

The developer-owned core of the Systems 10 outbound acquisition pipeline: a Next.js app on Neon
Postgres that is the **source of truth** for every brand from first sourced through to claimable in
the LMS. It provides the pipeline database, a Kalodata CSV ingestion step, an admin UI, and the API
surface that Make.com calls to move brands through the funnel.

External tools (Kalodata, Clay, Instantly, the LinkedIn tool, Make.com, Calendly) are configured in
their own dashboards. This app exposes the endpoints they call and owns the data.

## Stack

- Next.js (App Router, TypeScript) - admin UI + API routes
- Neon (serverless Postgres) via `@neondatabase/serverless`
- Drizzle ORM + drizzle-kit migrations
- Zod validation, jose-signed session cookies

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` - Neon connection string
   - `ADMIN_USERS` - `email:password` pairs for the admin UI (comma-separated)
   - `AUTH_SECRET` - random string for signing session cookies
   - `API_KEY` - shared secret for machine endpoints (the `X-API-Key` header)
3. `npm run db:generate` then `npm run db:migrate` to create the tables on Neon
4. `npm run seed` (optional) to load demo brands
5. `npm run dev` and open http://localhost:3000

## Data model (spec 3.4)

- **brands** - one row per sourced brand. `tiktok_handle` is the unique dedup key. `status` runs
  `sourced -> enriching -> ready_to_contact -> sequencing -> interested -> closed -> assigned`, with
  `archived` reachable from any non-terminal state.
- **contacts** - the resolved person (or generic inbox) for a brand.
- **outreach_log** - every email/LinkedIn touch and reply.

## Admin UI

- `/pipeline` - filterable/sortable brand table
- `/brands/[id]` - brand detail, contact, outreach timeline, guarded status transitions
- `/replies` - brands that replied positive, awaiting the qualification call
- `/upload` - Kalodata CSV import (dedup by handle, refreshes GMV on re-import)

## Machine API (Make.com orchestration)

All machine endpoints require the header `X-API-Key: <API_KEY>`. Brands are addressed by either
`brandId` (number) or `tiktokHandle` (string).

### POST `/api/webhooks/enrichment`
Clay/Make pushes a resolved contact. Creates the contact row, sets `contact_type` + `domain`, and
advances the brand to `ready_to_contact`.
```json
{
  "tiktokHandle": "glowritual",
  "domain": "glowritual.com",
  "contactType": "owner",
  "contact": {
    "contactName": "Dana Ruiz",
    "title": "Founder",
    "email": "dana@glowritual.com",
    "emailVerified": true,
    "linkedinUrl": "https://www.linkedin.com/in/dana"
  }
}
```

### GET `/api/brands?status=ready_to_contact&claim=true`
Pull contactable brands (with their contact) to push into Instantly / the LinkedIn tool. With
`claim=true`, returned `ready_to_contact` brands are advanced to `sequencing` so they are not pulled
twice. Optional `limit` (default 200, max 500).

### POST `/api/webhooks/outreach-event`
Log a sent/opened touch.
```json
{ "tiktokHandle": "nimbushome", "channel": "email", "sequenceStep": 1, "opened": true }
```

### POST `/api/webhooks/reply`
Log a reply. A `positive` reply advances the brand to `interested` (idempotent).
```json
{ "tiktokHandle": "nimbushome", "channel": "email", "replySentiment": "positive" }
```

### POST `/api/brands/:id/status`
Guarded status transition (illegal jumps return 409). `assigned` requires `assignedStudentId`.
```json
{ "status": "closed" }
```

### GET `/api/marketplace/claimable`
LMS handoff stub (spec 3.8): brands with status `closed`, ready to be claimed by students. Claim
rules and the student view live in the separate LMS spec.

## Out of scope

Clay waterfall config (3.3), Instantly domains/warm-up (4), the LinkedIn tool choice (3.6), Make.com
scenario wiring, and Calendly - all configured in their dashboards. This app is the database and the
endpoints they call.
