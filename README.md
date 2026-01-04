# A_ATWA Command Center

This repository contains the source code for **A_ATWA Command Center**, a futuristic personal and business management dashboard. The application is built with React, TypeScript, Tailwind CSS and Supabase for authentication and database services. It offers modules for tracking businesses, finances, goals and day‑to‑day planning in one unified interface.

## Features

- **Dashboard** with interactive charts for cash flow, savings and goals.
- **Business management** including departments and revenue.
- **Financial ledger** for transactions, savings and investments.
- **Goal setting** and tracking.
- **Day planner** for tasks and events.
- **User authentication** and profile management via Supabase.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later).
- A [Supabase](https://supabase.com/) project and an anonymous API key.

### Installation

1. Clone the repository and navigate into it:

   ```sh
   git clone <REPO_URL>
   cd <REPO_NAME>
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Copy `.env.example` to `.env` and update the values with your own Supabase credentials and desired application name:

   ```sh
   cp .env.example .env
   # Then edit .env in your editor
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

   The app will be available at `http://localhost:5173` by default.

### Building for production

Run the following command to create an optimised production build:

```sh
npm run build
```

You can preview the built application locally with:

```sh
npm run preview
```

## Environment variables

The application is configured via environment variables. The following variables are recognised (see `.env.example` for a template):

- `VITE_SUPABASE_URL` — your Supabase project URL (no trailing slash).
- `VITE_SUPABASE_PUBLISHABLE_KEY` — the public anonymous API key from Supabase.
- `VITE_APP_NAME` — the display name of the app (defaults to `A_ATWA`).
- `VITE_APP_ABBR` — a short abbreviation used in the logo (defaults to the first letters of the app name).

## Project structure

- `src/` — React components, pages, contexts and hooks.
- `public/` — static assets such as the favicon and placeholder image.
- `supabase/` — configuration and generated TypeScript types for your database schema.

Feel free to explore and customise the components to suit your own needs. If you wish to deploy the application, serve the contents of the `dist/` folder from any static hosting provider after running the production build.