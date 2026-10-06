# Sky Miracle

Document management and collaboration app built with **Next.js 16** (App Router, `proxy.ts`), **Supabase** (Auth, Postgres with RLS, Storage) and **Tailwind CSS 4** / shadcn components.

## Features

- **Auth**: sign up with email verification, log in, forgot/reset password, change password, edit profile.
- **Roles**: `admin`, `editor`, `viewer`. The first user to sign up becomes admin; everyone else starts as viewer. Only admins can change roles, and the last admin can't be demoted.
- **Documents**: editors and admins upload PDF, Word (`.docx`) and Excel (`.xlsx`) files up to 25 MB. You can search and filter them (all / my uploads / shared with me).
- **Versions**: upload new versions with a change note, and download any earlier version.
- **Sharing**: file owners and admins share files by email with *view* or *edit* access. A viewer's role is a ceiling, so a viewer can't edit even if given edit access.
- **Activity log**: uploads, new versions, downloads, sharing, deletes and role changes. File owners see their files' activity; admins see everything.
- **Admin panel** (`/admin`): manage user roles and view recent activity.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project, then copy the env template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

3. Apply the database migrations in `supabase/migrations/` **in order** (`001` → `009`), either with the Supabase CLI (`supabase db push`) or by pasting each file into the SQL editor.

4. In Supabase → Authentication → URL Configuration, add `http://localhost:3000/api/auth/callback` (and your production URL) to the redirect URLs.

5. Run the dev server and open [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (`output: 'standalone'`) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm test` | Unit tests (Vitest) |

## Project structure

The code is organised by feature. Route files in `app/` stay thin: they load data through a feature's `queries.ts` and render that feature's components.

```
app/                         Routes only (pages, layouts, route handlers)
  (auth)/                    login, signup, forgot-password, update-password
  (dashboard)/               dashboard, files/[id], settings, admin
  api/auth/callback/         Email verification and password reset links
  api/files/[id]/download/   Short-lived signed download URLs

features/                    One folder per feature
  auth/
    actions.ts               Server Actions (signup, login, reset, profile, sign out)
    schemas.ts               zod validation
    components/              Forms, AuthCard, SessionHydrator
    store/session-slice.ts   Signed-in profile (Redux)
  files/
    actions.ts               register upload/version, share, revoke, delete
    queries.ts               Server-side data loading (server-only)
    access.ts                UI copy of the database access rules
    constants.ts, utils.ts   File types, limits, storage paths, validation
    schemas.ts
    components/              Upload panel and queue, table, filters, detail sections
    store/uploads-slice.ts   Upload queue state (Redux)
    store/upload-thunks.ts   Upload thunk: storage upload, then register
  admin/                     Role management (actions, queries, components)
  activity/                  Activity log writer and list
  notifications/             Toasts (Redux slice, Toaster, useActionToast)

components/
  ui/                        Primitives (button, input, card, submit button, dialog...)
  layout/                    App header, nav links, user menu
  shared/                    Small cross-feature pieces (role badge, page header)

lib/
  supabase/                  Clients for browser, server, proxy and service role
  auth/                      requireUser / requireAdmin, safe redirects
  store/                     Redux store, typed hooks, StoreProvider
  types/                     Database schema types and domain types
  action-state.ts, format.ts, styles.ts, utils.ts

proxy.ts                     Session refresh, auth redirects, /admin role check
supabase/migrations/         Schema, RLS, storage policies, file functions
```

### State management

- **Server data** (files, versions, users, activity) is loaded in Server Components and kept fresh with `revalidatePath`. It is not copied into Redux.
- **Client state** lives in Redux Toolkit (`lib/store`):
  - `session`: the signed-in profile, hydrated from the server by `SessionHydrator`. The header, nav and upload permissions read it, and it updates instantly after a profile change.
  - `uploads`: the upload queue (uploading → saving → done / failed) for new files and new versions.
  - `notifications`: global toasts for uploads, sharing, role changes, profile and password updates.
- Signing out dispatches `sessionCleared`, which resets every slice.
- `StoreProvider` creates one store per browser tab, so no state is shared between server requests.

## How it fits together

**Uploads** go straight from the browser to the private `documents` bucket, into the uploader's own folder (`<user id>/<uuid>.<ext>`). The `uploadFile` thunk then calls a Server Action that checks the object and runs the `create_file` / `add_file_version` database functions. These check permissions and write the file, version and activity rows in one transaction. Clients have no direct INSERT or UPDATE access on `files` or `file_versions`.

**Access control** is enforced in the database. RLS policies use the helper functions in the `private` schema (`is_admin`, `can_view_file`, `can_edit_file`, `can_manage_file`). Storage objects can be read only by their uploader, by an admin, or by someone who can see a version that points to them. `features/files/access.ts` mirrors these rules only to decide what the UI shows.
