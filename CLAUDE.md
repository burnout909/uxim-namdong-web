# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Website and admin CMS for a Namdong-gu senior-employment organization (Korean-language public site). Next.js 16 App Router + React 19, Tailwind v4, Supabase (Postgres + Auth), AWS S3 for files. Package manager is **pnpm** (`pnpm-lock.yaml`). UI text, code comments and commit messages are written in Korean — keep that convention.

## Commands

```bash
pnpm dev      # next dev --webpack
pnpm build    # next build --webpack  (also the only type check — there is no lint or test setup)
pnpm start
```

`--webpack` is intentional: SVGs are imported as React components via `@svgr/webpack` (configured in `next.config.mjs`; typings in `svg.d.ts`).

Data-maintenance scripts (read `.env.local` directly, run from repo root):

```bash
node scripts/backup-posts.mjs               # dump POST table to backups/ (gitignored) — run before any migration
node scripts/migrate-base64-to-s3.mjs --dry # plan only
node scripts/migrate-base64-to-s3.mjs       # needs SUPABASE_SERVICE_ROLE_KEY (POST has RLS)
```

## Architecture

**Route groups** (`src/app`):
- `(content)/` — public pages: `about/`, `notice/` (boards), `resources/` (photos/videos/press), `projects/` (business programs). Paths are centralized in `src/constants/route.ts`.
- `(admin)/admin/` — CMS (posts, freeboard, banner, popup, business menu, organization, safety). Protected by `src/middleware.ts`, which redirects unauthenticated Supabase users to `/admin/sign-in`. Client-side auth state comes from `src/hooks/useAuth.ts`.
- `api/` — S3 presign routes (`s3/upload`, `s3/download`, `s3/image`), `photo-thumb/[id]`, `reply`, `post/verify-password`.

**Supabase clients**: `src/lib/supabase.ts` (server, cookie-based, use in Server Components/route handlers) vs `src/lib/supabase-browser.ts` (singleton for client components). Data access lives in `src/services/*Service.ts`.

**Posts / boards**: every board (공지, 일자리, 상품, 자유, 사진, 영상, 보도, 직원) is one `POST` table discriminated by `type` (`PostType` enum in `postService.ts`). Related tables: `POST_FILE` → `FILE` (attachments, S3 keys), `REPLY`. Board list pages are server components with `export const dynamic = "force-dynamic"` composed from `components/post/*` + `Pagination`. Free-board posts can be private with a bcrypt-hashed password (checked via `api/post/verify-password`). Editor is `react-quill-new` (`components/posting/`).

**Performance constraint on post bodies**: older `contents` contain inline base64 images (MBs per post). List queries deliberately exclude `contents`; the main-page photo gallery uses `/api/photo-thumb/[id]` (sharp-resized, CDN-cached) instead of reading bodies. Don't add `contents` to list/selects that render many posts.

**S3 images**: the bucket is private. New editor images are uploaded under `editor/` and embedded in HTML as `/api/s3/image?key=editor/...`, which presigns and 307-redirects on each request (presigned URLs expire in 1h, so never store them in content). Upload/image routes enforce key-prefix allowlists (`uploads/`, `editor/`, `banners/`, `popups/`, `organization/`) — add a prefix there when introducing a new upload location. Presign helpers: `src/app/service/s3.ts`; S3 client: `src/lib/s3.ts`.

**Business programs (`projects/`)**: each category (`public-detail`, `capacity-detail`, `community-detail`) has hard-coded static pages *plus* a `[slug]` dynamic page for items admins add via the `BUSINESS_MENU` table (`businessService.ts`). Slugs can be Korean — `useParams` returns them URL-encoded, so decode with `decodeURIComponent` before querying.

**Env vars** (in `.env.local`, gitignored): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_S3_REGION`, `NEXT_PUBLIC_S3_BUCKET_NAME`, `NEXT_PUBLIC_AWS_KEY`, `NEXT_PUBLIC_AWS_SECRET`; scripts additionally use `SUPABASE_SERVICE_ROLE_KEY`. Note the AWS credentials use the `NEXT_PUBLIC_` prefix and some client components import the S3 presign helpers directly, so they end up in the browser bundle.
