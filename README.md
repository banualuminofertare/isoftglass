# Glass Management App

A full-stack application for managing glass/building materials manufacturing, built with React, TypeScript, Vite, Supabase, and Tailwind CSS.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Deploy:** Netlify (frontend) + Supabase (backend)

## Local Development

Requirements: Node.js 18+ and npm

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Install dependencies
npm install

# 3. Copy and fill in environment variables
cp .env.example .env

# 4. Start the development server
npm run dev
```

## Environment Variables

See `.env.example` for the required variables. Set them in Netlify dashboard for production.

## Deploy

- **Frontend:** Connected to GitHub via Netlify — auto-deploys on push to `main`
- **Backend migrations:** `supabase db push`
- **Edge Functions:** `supabase functions deploy`
