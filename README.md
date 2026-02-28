# MAPtool

MVP for merchants to negotiate MAP (Minimum Advertised Price) policies and values from suppliers. See [docs/](docs/) for product description, PRD, and execution checklist.

## Features

- **Single-item assessment:** Enter UPC, MAP price, and upload the vendor’s MAP policy (PDF or Word). The app extracts policy text, checks competitor prices, and analyzes the policy with AI to recommend **Discuss with vendor** or **Proceed.**
- **Competitive prices:** Walmart price lookup by UPC with a **“View product”** link to the product’s page on Walmart.com. Amazon is **coming soon** (placeholder in UI).
- **Policy analysis (AI):** Applicability (all retailers vs segment), consequence specificity, and a short summary. Uses OpenAI (requires `OPENAI_API_KEY`).
- **Info button:** An ℹ️ button on the Single item and Assessment results pages opens an interstitial that explains what the assessment looks for (applicability, consequences, competitive prices, next step).

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
