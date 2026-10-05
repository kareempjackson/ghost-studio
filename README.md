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

## Content (Sanity)

Every word and picture on the site comes from Sanity. The Studio is mounted at
[/studio](http://localhost:3000/studio).

1. Copy `.env.example` to `.env.local` and fill it in: the project ID and
   dataset from sanity.io/manage, a **Viewer** token (`SANITY_API_READ_TOKEN`)
   for previews, and an **Editor** token (`SANITY_API_WRITE_TOKEN`) for seeding.
2. On sanity.io/manage → API → CORS origins, add `http://localhost:3000` and the
   production URL, both with credentials allowed.
3. `npm run seed` once, to load the site's original content and pictures.
   It overwrites the seeded documents, so don't run it after editors start.
   `npm run seed -- --dry` prints the documents without writing.
4. Optional backstop for Sanity Live: a GROQ webhook to `/api/revalidate`
   (create/update/delete, projection `{_type}`, secret = `SANITY_REVALIDATE_SECRET`).

Where things live: schemas in `sanity/schemaTypes/`, every query in
`sanity/content.ts`, the shapes components read in `sanity/types.ts`, and the
original content (the seed's source) in `sanity/seed/content/`.
