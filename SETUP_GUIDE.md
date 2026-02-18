# Project Sauce — Setup Guide
## Step-by-step instructions to get BK Fresh running for free

---

## What You're Building

You have a folder of files that together make up the BK Fresh tool. Here's every file and what it does:

```
project-sauce/
│
├── README.md                        ← Project overview (for your GitHub page)
├── SETUP_GUIDE.md                   ← This file you're reading
│
├── app/                             ← THE WEBSITE (what users see)
│   └── App.jsx                      ← The entire BK Fresh interface
│
├── scrapers/                        ← THE DEAL SCRAPERS (runs automatically)
│   ├── scrape_deals.py              ← Main script — scrapes Flipp, Whole Foods, TJ's
│   ├── google_sheets.py             ← Connects scraper → Google Sheets
│   ├── config.py                    ← List of stores, search terms, categories
│   ├── requirements.txt             ← Python packages needed (like an ingredient list)
│   └── .env.example                 ← Template for your secret credentials
│
└── .github/
    └── workflows/
        └── scrape-deals.yml         ← Tells GitHub to run the scraper every Wednesday
```

**You will push ALL of these files to GitHub.** GitHub is where your code lives, and it does two jobs: (1) stores your code so Vercel can build the website from it, and (2) runs the scraper automatically every week via GitHub Actions.

---

## Step 1: Create a GitHub Account and Repository (5 minutes)

If you don't have a GitHub account:
1. Go to github.com and sign up (free)

Create the repository:
1. Click the **+** button in the top right → **New repository**
2. Fill in:
   - **Repository name:** `bk-fresh`
   - **Description:** `Fighting food insecurity in Downtown Brooklyn — by Project Sauce`
   - **Public** (select this — it's free and your project is open source)
   - Check **"Add a README file"**
3. Click **Create repository**

You now have an empty repo at `github.com/YOUR-USERNAME/bk-fresh`

---

## Step 2: Upload the Project Files to GitHub (10 minutes)

### Option A: Upload via the GitHub Website (easiest — no coding tools needed)

1. Go to your repo page: `github.com/YOUR-USERNAME/bk-fresh`
2. Click **"Add file"** → **"Upload files"**
3. Drag in these files from the `project-sauce` folder you downloaded:
   - `README.md`
   - `SETUP_GUIDE.md`
4. Click **"Commit changes"**

Now create the subfolders and upload their files:

**Upload the app/ folder:**
1. Click **"Add file"** → **"Create new file"**
2. In the filename box, type: `app/App.jsx`
   (typing the `/` automatically creates the folder)
3. Paste the entire contents of App.jsx into the editor
4. Click **"Commit changes"**

**Upload the scrapers/ folder (repeat for each file):**
1. Click **"Add file"** → **"Create new file"**
2. Type the filename: `scrapers/scrape_deals.py`
3. Paste the contents of scrape_deals.py
4. Click **"Commit changes"**
5. Repeat for each of these files:
   - `scrapers/google_sheets.py`
   - `scrapers/config.py`
   - `scrapers/requirements.txt`
   - `scrapers/.env.example`

**Upload the GitHub Actions workflow:**
1. Click **"Add file"** → **"Create new file"**
2. In the filename box, type: `.github/workflows/scrape-deals.yml`
   (this creates two nested folders — that's expected)
3. Paste the contents of scrape-deals.yml
4. Click **"Commit changes"**

Your repo should now look like this:
```
bk-fresh/
├── .github/workflows/scrape-deals.yml
├── README.md
├── SETUP_GUIDE.md
├── app/
│   └── App.jsx
└── scrapers/
    ├── .env.example
    ├── config.py
    ├── google_sheets.py
    ├── requirements.txt
    └── scrape_deals.py
```

### Option B: Upload via Terminal (faster if you or a friend know Git)

```bash
# 1. Open terminal (Mac: Terminal app, Windows: Git Bash)

# 2. Navigate to wherever you saved the project-sauce folder
cd ~/Downloads/project-sauce

# 3. Initialize Git in the folder
git init

# 4. Connect it to your GitHub repo (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/bk-fresh.git

# 5. Add ALL files at once
git add .

# 6. Create your first commit
git commit -m "Initial commit — BK Fresh by Project Sauce"

# 7. Push everything to GitHub
git branch -M main
git push -u origin main
```

That pushes every file in one shot. You're done.

---

## Step 3: Create a Google Sheet (5 minutes)

This is your "database" — where deals live. The scraper writes to it, the website reads from it.

1. Go to sheets.google.com → create a new spreadsheet
2. Name it: **"Project Sauce — BK Fresh Deals"**
3. Rename the first tab (bottom of screen) to: `deals`
4. In row 1, type these headers (one per column, A through J):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| store | item | price | original_price | category | icon | expires_in | sale_story | source | scraped_at |

5. Create two more tabs at the bottom: `stores` and `meta`
6. Publish the sheet:
   - Go to **File → Share → Publish to web**
   - Select the **deals** tab
   - Choose **CSV** as the format
   - Click **Publish** and confirm
7. Copy your **Sheet ID** from the URL bar. It's the long string between `/d/` and `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_SHEET_ID/edit
   ```

---

## Step 4: Set Up Google Cloud Service Account (10 minutes)

This gives the scraper permission to write deals into your Google Sheet automatically.

1. Go to console.cloud.google.com
2. Click **Select a project** → **New Project**
   - Name: `project-sauce`
   - Click **Create** (free)
3. In the left sidebar: **APIs & Services → Library**
4. Search for **"Google Sheets API"** → click it → click **Enable**
5. In the left sidebar: **APIs & Services → Credentials**
6. Click **Create Credentials** → **Service Account**
   - Name: `scraper`
   - Click **Done** (skip optional fields)
7. Click on the service account you just created
8. Go to the **Keys** tab → **Add Key** → **Create new key** → **JSON**
9. A .json file downloads — keep this safe, it's like a password
10. Go back to your Google Sheet → click **Share**
11. Paste the service account email
    (it looks like `scraper@project-sauce-12345.iam.gserviceaccount.com`)
12. Give it **Editor** access → click **Send**

---

## Step 5: Add Secrets to GitHub (3 minutes)

GitHub needs your Google credentials to run the scraper automatically.

1. Go to your repo: `github.com/YOUR-USERNAME/bk-fresh`
2. Click **Settings** (tab at the top of the repo)
3. In the left sidebar: **Secrets and variables** → **Actions**
4. Click **New repository secret** and add TWO secrets:

**Secret 1:**
- Name: `GOOGLE_SHEETS_CREDENTIALS`
- Value: Open the .json key file from Step 4, select all, copy, and paste the entire contents here

**Secret 2:**
- Name: `GOOGLE_SHEET_ID`
- Value: The Sheet ID you copied in Step 3

---

## Step 6: Connect Your Sheet ID in the App (2 minutes)

1. In your GitHub repo, navigate to `app/App.jsx`
2. Click the **pencil icon** to edit
3. Find this line near the top:
   ```javascript
   const GOOGLE_SHEET_ID = "YOUR_SHEET_ID_HERE";
   ```
4. Replace `YOUR_SHEET_ID_HERE` with your actual Sheet ID
5. Click **Commit changes**

---

## Step 7: Deploy on Vercel for Free (5 minutes)

Vercel turns your GitHub code into a live website, automatically.

1. Go to vercel.com → **Sign up with GitHub**
2. Click **"Add New..."** → **"Project"**
3. Find and select your `bk-fresh` repo
4. In the configuration:
   - **Root Directory:** click "Edit" and type `app`
5. Click **Deploy**
6. Wait about 60 seconds — your site is live!
7. Vercel gives you a URL like: `bk-fresh-abc123.vercel.app`
8. Go to **Settings → Domains** to customize it to: `projectsauce.vercel.app`

Every time you push code to GitHub, Vercel auto-deploys the update.

---

## Step 8: Test the Full Pipeline (5 minutes)

**Test the scraper:**
1. Go to your repo → **Actions** tab
2. Click **"Scrape Weekly Deals"** on the left
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait 2-3 minutes — watch it turn green
5. Check your Google Sheet — it should now have deals in it

**Test the website:**
1. Visit your Vercel URL
2. Click the **Deals** tab
3. You should see live deals pulled from your Google Sheet

---

## Step 9 (Optional): Custom Domain — $10/year

1. Buy `projectsauce.org` from Namecheap (~$10/year)
2. In Vercel → **Settings → Domains** → add `bkfresh.projectsauce.org`
3. In Namecheap → **DNS Settings** → add a CNAME record:
   - Host: `bkfresh`
   - Value: `cname.vercel-dns.com`
4. Wait 10-30 minutes for DNS to propagate

---

## Ongoing: Who Does What

| Task | How Often | Who Does It | How |
|------|-----------|-------------|-----|
| Scrape deals | Every Wed 6AM | Automatic | GitHub Actions |
| Check if scraper worked | Weekly | Any volunteer | Check Actions tab for green check |
| Add deals the scraper missed | As needed | Any volunteer | Type into Google Sheet |
| Verify Trader Joe's prices | Monthly | Volunteer visits store | Update Google Sheet |
| Add new recipes | As needed | Anyone | Edit App.jsx on GitHub |
| Fix scraper if it breaks | When needed | Tech volunteer | Edit scrape_deals.py |

---

## Troubleshooting

**"I see sample data instead of live deals"**
→ Make sure your Google Sheet ID is correct in app/App.jsx
→ Make sure the sheet is published to web
→ Run the GitHub Action manually to populate the sheet

**"GitHub Action shows a red X"**
→ Click on it to see the error log
→ Most common: secrets aren't set correctly
→ The website still works with the last successful data

**"The scraper returns 0 results"**
→ The source website may have changed
→ Volunteers can manually add deals to the Google Sheet

**"Vercel deployment failed"**
→ Check that app/App.jsx has no syntax errors
→ Click "Redeploy" in the Vercel dashboard

---

*Built with love by Project Sauce — fighting food insecurity in Downtown Brooklyn*
