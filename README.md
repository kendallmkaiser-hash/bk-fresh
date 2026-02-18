# 🥬 Project Sauce — BK Fresh

**Fighting food insecurity in Downtown Brooklyn**

A free, open-source tool that helps people find affordable groceries, weekly deals, budget recipes, and SNAP/EBT resources in Downtown Brooklyn.

**Live site:** `projectsauce.vercel.app` (or `bkfresh.projectsauce.org` with custom domain)

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTOMATED PIPELINE                        │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Flipp API   │    │ Whole Foods  │    │ Trader Joe's │  │
│  │  (backflipp) │    │ Sales Flyer  │    │  Catalog     │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │           │
│         └───────────┬───────┘───────────────────┘           │
│                     ▼                                       │
│         ┌──────────────────────┐                           │
│         │  GitHub Actions      │  Runs every Wednesday     │
│         │  (scrape_deals.py)   │  at 6:00 AM EST           │
│         └──────────┬───────────┘                           │
│                    ▼                                        │
│         ┌──────────────────────┐                           │
│         │  Google Sheets       │  ← Volunteers can also    │
│         │  (single source of   │    manually add deals     │
│         │   truth)             │    via Google Forms        │
│         └──────────┬───────────┘                           │
│                    ▼                                        │
│         ┌──────────────────────┐                           │
│         │  Vercel (free)       │  React app pulls from     │
│         │  projectsauce.app   │  Google Sheets API         │
│         └──────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
project-sauce/
├── README.md                          # This file
├── scrapers/
│   ├── scrape_deals.py                # Main scraper (Flipp + Whole Foods + TJ's)
│   ├── google_sheets.py               # Google Sheets integration
│   ├── requirements.txt               # Python dependencies
│   └── config.py                      # Store list and search terms config
├── app/
│   ├── package.json                   # React app config
│   ├── src/
│   │   └── App.jsx                    # Main React app (BK Fresh UI)
│   └── public/
│       └── index.html
└── .github/
    └── workflows/
        └── scrape-deals.yml           # GitHub Actions automation
```

## Quick Start

### 1. Set Up Google Sheets (5 min)
1. Create a new Google Sheet with tabs: `deals`, `stores`, `recipes`
2. Set up a Google Cloud service account (free)
3. Share the sheet with your service account email
4. Copy the Sheet ID from the URL

### 2. Set Up Scrapers
```bash
cd scrapers
pip install -r requirements.txt
cp .env.example .env   # Add your Google Sheets credentials
python scrape_deals.py  # Test run
```

### 3. Deploy the App (free on Vercel)
```bash
cd app
npm install
npm run dev             # Local development
# Push to GitHub → Connect to Vercel → Auto-deploys
```

### 4. Automate with GitHub Actions
Add these secrets to your GitHub repo:
- `GOOGLE_SHEETS_CREDENTIALS` — your service account JSON
- `GOOGLE_SHEET_ID` — your spreadsheet ID

The workflow runs every Wednesday at 6 AM EST automatically.

## Cost

| Component | Cost |
|-----------|------|
| Hosting (Vercel) | Free |
| Database (Google Sheets) | Free |
| Automation (GitHub Actions) | Free |
| Scraping (Flipp API + web) | Free |
| Domain (optional) | ~$10/year |
| **Total** | **$0 – $10/year** |

## Volunteer Guide

**Non-technical volunteers** can contribute by:
- Adding deals to the Google Sheet directly
- Submitting deals via the Google Form (link TBD)
- Checking store hours and SNAP acceptance status

**Technical volunteers** can contribute by:
- Improving scrapers when sites change
- Adding new store sources
- Building new features in the app

## License

MIT — Built with ❤️ by Project Sauce
