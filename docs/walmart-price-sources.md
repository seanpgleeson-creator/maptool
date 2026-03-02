# Walmart price lookup — Option D (hybrid) with UPCitemdb

The app looks up Walmart price and product URL by UPC. It uses **ScrapingDog + UPCitemdb** when `SCRAPINGDOG_API_KEY` is set; otherwise it falls back to direct scrape of Walmart search.

---

## 1. ScrapingDog + UPCitemdb (recommended)

- **What:** Option D (hybrid). We do **not** search Walmart by UPC. Instead, ScrapingDog fetches the **UPCitemdb** product page for the UPC (`https://www.upcitemdb.com/upc/<upc>`). UPCitemdb’s “Shopping Info” table lists retailers (including Walmart) with price and a “buy” link. We parse that table for the Walmart row and return the price and link (UPCitemdb’s link redirects to Walmart).
- **Why:** Walmart’s own search-by-UPC is unreliable. UPCitemdb already aggregates “where to buy” and price; one ScrapingDog request gives us both without hitting Walmart.
- **Signup:** [ScrapingDog](https://www.scrapingdog.com/) — create an account and get your API key from the dashboard.
- **Env:** Set `SCRAPINGDOG_API_KEY` in Vercel (or `.env` locally). In Vercel, set it for **Production** (and **Preview** if you use preview deployments), then **redeploy**.
- **Caveats:** Price is as of UPCitemdb’s “Last Updated.” Only works when UPCitemdb has a Walmart listing for that UPC; otherwise you get “No Walmart listing for this UPC on UPCitemdb” and the fallback link is Walmart search.

---

## 2. Direct scrape (no API key)

- **What:** The app fetches `https://www.walmart.com/search?q=<upc>` and tries to parse a price from the HTML.
- **Env:** Don’t set `SCRAPINGDOG_API_KEY`. Works out of the box.
- **Caveats:** Walmart often blocks or changes the page; search-by-UPC on the site is unreliable. When it fails, we still save the **search URL** so the user can open Walmart and check manually. Price may often be “Unavailable.”

---

## Summary

| Option              | Env variable          | Best for                          |
| ------------------- | --------------------- | --------------------------------- |
| ScrapingDog + UPCitemdb | `SCRAPINGDOG_API_KEY` | Reliable Walmart price/link when UPCitemdb has a listing |
| Direct scrape       | (none)                | No key; link-only often           |

**Recommendation:** Sign up for ScrapingDog, set `SCRAPINGDOG_API_KEY` in Vercel for Production (and Preview if needed), and redeploy so assessments use UPCitemdb for Walmart price and “View product” link.
