This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on Render

This repo ships a [`render.yaml`](./render.yaml) blueprint, so deployment is a button click:

1. Push this branch to GitHub.
2. In the Render dashboard, go to **New → Blueprint** and connect the GitHub repo.
3. Render auto-detects `render.yaml` and provisions the `elecweb` web service (Node 22, `npm install && npm run build`, `npm run start`).
4. On the first deploy, set `ADMIN_PASSWORD` in **Environment** — the admin login at `/admin` requires it.

Notes:

- Free instances go to sleep after ~15 minutes idle, so the first request after a pause can take a few seconds to wake up.
- Runtime data (products, orders, restock requests, uploaded datasheets/images) is stored in the local `.data/` folder. Render's free instances have an ephemeral filesystem, so that data resets whenever the service restarts or redeploys. For persistent storage, attach a [Disk](https://render.com/docs/disks) to the service and mount it at the repo's `.data/` path.

## Keeping VoltCart awake

Render's free web service sleeps after ~15 minutes without traffic, and a GitHub Actions cron alone won't reliably prevent that (scheduled runs can be delayed 15–30 minutes by GitHub). Use an external uptime monitor for a strict cadence:

1. **cron-job.org (recommended)** — free. Create a job that hits `https://elecweb.onrender.com` on a **1-minute** interval. A 1-minute cadence sits well inside the 15-minute sleep window and gives you downtime alerts.
2. **UptimeRobot** — free. Add an HTTP(S) monitor on the same URL; it checks every 5 minutes and alerts on downtime.

The repo also ships a [keep-awake workflow](./.github/workflows/keep-awake.yml) pinging every 5 minutes as a best-effort fallback on top of the external monitor.

Heads-up: keeping the instance awake around the clock consumes nearly the whole monthly free allowance (750 hours). If the store doesn't need to be live 24/7, skip the pinger and accept a ~5–10 second cold start on the first visit instead.
