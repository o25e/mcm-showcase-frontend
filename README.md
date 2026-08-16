# mcm-ai-journey-fe

## Vercel deployment

This is a Vite/React frontend.

- Build command: `npm run build`
- Output directory: `dist`

Set these Vercel environment variables:

- `VITE_API_BASE_URL`: the separate backend server origin
- `VITE_PUBLIC_APP_URL`: the Vercel or custom frontend URL

`vercel.json` handles direct access to routes such as `/ar` and `/my-closet`.
