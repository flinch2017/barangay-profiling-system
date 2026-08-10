# Render Deployment

This repository is prepared for a two-service Render deployment:

- `barangay-profiling-api`: Node web service from `backend`
- `barangay-profiling-frontend`: static Vite React site from `frontend`

## If Render Says Root `package.json` Is Missing

That means the service was created at the repository root instead of using the
`frontend` or `backend` root directory.

The repo now includes a root `package.json` so this common Render setup works:

```text
Build Command: npm install && npm run build
Publish Directory: dist
```

For a cleaner two-service setup, use the included `render.yaml` Blueprint or set
the service root directories manually:

```text
API Root Directory: backend
Frontend Root Directory: frontend
```

## Backend Environment Variables

Set these on `barangay-profiling-api`:

```env
NODE_ENV=production
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
CORS_ORIGIN=https://your-frontend-service.onrender.com
R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
```

`CORS_ORIGIN` can contain multiple comma-separated origins if needed.

## Frontend Environment Variables

Set these on `barangay-profiling-frontend`:

```env
VITE_API_BASE_URL=https://your-api-service.onrender.com
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Vite embeds `VITE_*` variables during the static-site build. If you change
`VITE_API_BASE_URL`, redeploy the frontend.

## Health Check

The API exposes:

```text
GET /api/health
```

Render uses this endpoint in `render.yaml`.
