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

## How it fits together

```
app/
  (auth)/            login, signup, forgot-password, update-password
  (dashboard)/       dashboard (file list + upload), files/[id], settings, admin
  actions/           server actions: auth, files (register/version/share/delete), admin
  api/auth/callback  email verification and password reset links
  api/files/[id]/download   short-lived signed download URLs
lib/                 auth helpers, validation schemas, file helpers, DB types
proxy.ts             session refresh, auth redirects, /admin role check
supabase/migrations  schema, RLS policies, storage policies, file functions
```

**Uploads** go straight from the browser to the private `documents` bucket, into the uploader's own folder (`<user id>/<uuid>.<ext>`). A server action then checks the object and calls the `create_file` / `add_file_version` database functions. These check permissions and write the file, version and activity rows in one transaction. Clients have no direct INSERT or UPDATE access on `files` or `file_versions`.

**Access control** is enforced in the database. RLS policies use the helper functions in the `private` schema (`is_admin`, `can_view_file`, `can_edit_file`, `can_manage_file`). Storage objects can be read only by their uploader, by an admin, or by someone who can see a version that points to them.
