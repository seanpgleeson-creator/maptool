# MAPtool

MVP for merchants to negotiate MAP (Minimum Advertised Price) policies and values from suppliers. See [docs/](docs/) for product description, PRD, and execution checklist.

## Deploying

Deploy to Vercel by importing this repo (GitHub). Production deploys from the `main` branch. Build settings: default (Vercel detects Next.js).

Set these in **Vercel → Project → Settings → Environment Variables** for production:

| Variable | Description |
| -------- | ----------- |
| `DATABASE_URL` | Postgres connection string (used in phase 2) |
| `OPENAI_API_KEY` | LLM for policy analysis |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage (or use S3 later) |

See [.env.example](.env.example) for placeholders.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
