# Project: Little Mumbai Choice

A full-stack modern B2B React/Next.js e-commerce application designed for an Indian wholesale kids' wear business. Features a robust admin dashboard, realtime database interactions, modern image streaming, responsive design (Tailwind CSS, mobile-first), user authentication, cart management, optimistic UI caching, and SSR + ISR implementation.

---

## Stack
- **Frontend Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix primitives) & [Lucide Icons](https://lucide.dev/)
- **Data Fetching / State**: Next.js Server Components, Context API. form resolution with `zod` and `react-hook-form`.
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Media Storage**: [Cloudinary](https://cloudinary.com/)
- **Hosting**: [Vercel](https://vercel.com/)

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and populate all the keys. Referece the Environment Variables section below.
```bash
cp .env.example .env.local
```

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Your `.env.local` should look like this (refer to `.env.example` internally):

```ini
# --- SUPABASE CONFIG ---
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# --- CLOUDINARY CONFIG ---
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# --- APPLICATION ---
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Production: https://yourdomain.com
```
> **IMPORTANT SECURITY NOTE:** Never prefix private keys (like `CLOUDINARY_API_SECRET` or Supabase ServiceRole keys) with `NEXT_PUBLIC_`.

---

## Database Setup

1. Create a new [Supabase](https://supabase.com/) project.
2. Go to the SQL Editor in the Supabase Dashboard.
3. Open `supabase/migrations/001_initial_schema.sql` from this repository.
4. Copy the entire content and paste it into the SQL Editor.
5. Hit **RUN** to execute the migration. This will create all `profiles`, `categories`, `products`, `orders` tables, configure Row Level Security (RLS) policies, and seed initial demo data.

---

## Cloudinary Setup

1. Create a free account on [Cloudinary](https://cloudinary.com/).
2. Grab your **Cloud Name**, **API Key**, and **API Secret** from the dashboard.
3. Update your `.env.local` file with these values.
4. (Optional) If you plan on using unsigned uploads, create an "Upload Preset" through Settings -> Uploads -> Add upload preset (Set signing mode to `Unsigned`). The current app configuration uses *Server Signed Uploads* for security, so an unsigned preset is not strictly necessary but handy for local test environments.

---

## Creating Admin User

To access the `/admin` dashboard, your Supabase profile needs an `admin` role. 

1. Create a standard account via the website's `/register` page using an email (e.g. `admin@example.com`).
2. Go to your Supabase Dashboard -> SQL Editor and run the following command to elevate that user to admin:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

3. Sign out and sign back in on the front end. You will now have access to the Admin Panel.

---

## Vercel Deployment

Deployment to Vercel is seamless since the root `vercel.json` is already configured.

### Checklist before deploying:
- [ ] Connect your repository to Vercel.
- [ ] In the Vercel project settings, go to **Environment Variables**.
- [ ] Add ALL variables from your `.env.local` into Vercel securely (Ensure `NEXT_PUBLIC_SITE_URL` points to your exact `.vercel.app` or custom domain url).
- [ ] Trigger a deployment. Vercel will automatically detect `next build` and `.next` output directory based on `vercel.json`.
