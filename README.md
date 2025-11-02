# Holistay MVP v1.0

A web application for Airbnb property managers built with Next.js, shadcn/ui, and Supabase.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui with Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL, Auth with RLS)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase project created

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Set up the database:

Run the `database_schema.sql` script in your Supabase SQL Editor. This will create all tables, types, functions, triggers, and RLS policies.

4. Generate TypeScript types:

After setting up your database, generate TypeScript types from your Supabase schema:

```bash
# Option 1: Using Supabase CLI (recommended)
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts

# Option 2: Manually from Supabase Dashboard
# Go to Settings > API > Generate TypeScript types
# Copy and paste into types/supabase.ts
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
holistay/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Authenticated app routes (with layout)
│   │   ├── dashboard/     # Dashboard page
│   │   ├── tasks/         # Task management page
│   │   └── settings/      # Property management page
│   ├── auth/              # Auth route handlers
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── portal/            # Owner portal page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── sidebar.tsx       # Sidebar navigation
│   └── header.tsx        # Header component
├── lib/                  # Utility functions
│   ├── supabase/        # Supabase client utilities
│   └── utils.ts         # General utilities
├── types/               # TypeScript type definitions
├── database_schema.sql  # Complete database schema
└── middleware.ts        # Next.js middleware for auth
```

## Authentication

The app uses Supabase Auth with role-based access control:

- **Managers**: Full access to dashboard, tasks, and settings
- **Owners**: Limited access to their own properties via the portal

After login, users are automatically redirected based on their role:
- Managers → `/dashboard`
- Owners → `/portal`

## Development Phases

### Phase 0: Foundation & Authentication ✅
- ✅ Project initialization
- ✅ Auth flow (login, signup, callback)
- ✅ Role-based redirects
- ✅ Core layout with sidebar

### Phase 1: Property Management (Next)
- Property CRUD operations
- CEP lookup integration
- Fixed costs management

### Phase 2: Task Management
- Kanban board
- Task CRUD operations
- Drag-and-drop functionality

### Phase 3: Core Automation
- iCal sync with cron jobs
- Automatic task creation from bookings

### Phase 4: Finance & Dashboards
- Financial KPIs
- Charts and reports
- Owner portal

### Phase 5: AI Features
- Listing generator with Google Gemini

## License

ISC

