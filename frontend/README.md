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

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

- `UPLOADTHING_TOKEN` - Your UploadThing API token (required for image uploads)
- `BACKEND_API_URL` - Backend API URL (optional, defaults to `http://localhost:3001/api`)

**Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

## Troubleshooting

### UploadThing DNS Errors on Windows

If you see `ENOTFOUND sea1.ingest.uploadthing.com` errors in the console, this is a known Node.js DNS resolution issue on Windows. The uploads still work (file URL is returned), but metadata registration may fail.

**Fix:** Set Node.js to use IPv4 DNS resolution:

```bash
# Windows PowerShell
$env:NODE_OPTIONS="--dns-result-order=ipv4first"
npm run dev
```

Or add to your `.env.local`:

```
NODE_OPTIONS=--dns-result-order=ipv4first
```

This forces Node.js to prefer IPv4 over IPv6, which resolves the DNS issue on Windows.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
