"""
Project Sauce — Deal Scraper
Scrapes grocery deals from multiple sources for Downtown Brooklyn.

Sources:
  1. Flipp (backflipp API) — ALDI, Key Food, Food Bazaar, Lidl, Bravo
  2. Whole Foods — weekly sales flyer page
  3. Trader Joe's — product catalog for budget staples

Usage:
  python scrape_deals.py              # Scrape all sources
  python scrape_deals.py --flipp      # Scrape Flipp only
  python scrape_deals.py --wholefoods # Scrape Whole Foods only
  python scrape_deals.py --traderjoes # Scrape Trader Joe's only
  python scrape_deals.py --dry-run    # Print results without saving
"""

import requests
import json
import time
import re
import argparse
from datetime import datetime, timedelta
from config import (
    POSTAL_CODE, FLIPP_STORES, SEARCH_TERMS,
    CATEGORIES, CATEGORY_ICONS,
    WHOLE_FOODS_SALES_URL, TRADER_JOES_API_BASE
)

# ─────────────────────────────────────────────────────────────
# 1. FLIPP SCRAPER (backflipp.wishabi.com)
#    This is the undocumented API that Flipp's website uses.
#    It accepts a search query + postal code and returns deals.
# ─────────────────────────────────────────────────────────────

BACKFLIPP_SEARCH_URL = "https://backflipp.wishabi.com/flipp/items/search"
BACKFLIPP_ITEM_URL = "https://backflipp.wishabi.com/flipp/items"


def scrape_flipp_deals():
    """
    Search Flipp for each grocery term near our ZIP code.
    Returns a list of deal dicts.
    """
    print("\n📋 Scraping Flipp deals...")
    all_deals = []
    seen_ids = set()  # Deduplicate

    for term in SEARCH_TERMS:
        try:
            resp = requests.get(
                BACKFLIPP_SEARCH_URL,
                params={"q": term, "postal_code": POSTAL_CODE},
                headers={"User-Agent": "ProjectSauce/1.0"},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

            items = data.get("items", [])
            print(f"  🔍 '{term}' → {len(items)} results")

            for item in items:
                item_id = item.get("flyer_item_id")
                if not item_id or item_id in seen_ids:
                    continue
                seen_ids.add(item_id)

                # Filter to only our target stores
                merchant = item.get("merchant", "")
                if not any(store.lower() in merchant.lower() for store in FLIPP_STORES):
                    continue

                # Get item details
                deal = extract_flipp_deal(item, term)
                if deal:
                    all_deals.append(deal)

            # Be polite — don't hammer the API
            time.sleep(0.5)

        except requests.RequestException as e:
            print(f"  ⚠️  Error searching '{term}': {e}")
            continue

    print(f"  ✅ Found {len(all_deals)} Flipp deals from target stores")
    return all_deals


def extract_flipp_deal(item, search_term):
    """Extract a structured deal from a Flipp search result."""
    try:
        name = item.get("name", "").strip()
        merchant = item.get("merchant", "").strip()
        current_price = item.get("current_price")
        pre_price = item.get("pre_price_text", "")
        sale_story = item.get("sale_story", "")
        valid_from = item.get("valid_from", "")
        valid_to = item.get("valid_to", "")

        # Try to parse price
        price_str = ""
        if current_price:
            price_str = f"${current_price:.2f}"
        elif sale_story:
            # Sometimes the price is in the sale story like "2/$5" or "$1.99/lb"
            price_str = sale_story

        if not price_str and not sale_story:
            return None  # Skip items with no price info

        # Determine category
        category = CATEGORIES.get(search_term, "Other")
        icon = CATEGORY_ICONS.get(category, "🛒")

        # Calculate days until expiry
        expires_in = ""
        if valid_to:
            try:
                exp_date = datetime.fromisoformat(valid_to.replace("Z", "+00:00"))
                days_left = (exp_date - datetime.now(exp_date.tzinfo)).days
                expires_in = f"{days_left} days" if days_left > 0 else "Today"
            except (ValueError, TypeError):
                expires_in = "This week"

        return {
            "source": "flipp",
            "store": merchant,
            "item": name if name else search_term.title(),
            "price": price_str if price_str else sale_story,
            "original_price": pre_price,
            "sale_story": sale_story,
            "category": category,
            "icon": icon,
            "valid_from": valid_from,
            "valid_to": valid_to,
            "expires_in": expires_in,
            "scraped_at": datetime.now().isoformat(),
        }
    except Exception as e:
        print(f"  ⚠️  Error parsing item: {e}")
        return None


# ─────────────────────────────────────────────────────────────
# 2. WHOLE FOODS SCRAPER
#    Scrapes the weekly sales flyer page.
#    Falls back to Amazon Fresh if the flyer page is hard to parse.
# ─────────────────────────────────────────────────────────────

def scrape_whole_foods_deals():
    """
    Scrape Whole Foods weekly sales.
    Attempts to get data from their sales flyer page.
    """
    print("\n🥑 Scraping Whole Foods deals...")
    deals = []

    try:
        # Whole Foods sales flyer is a dynamic page, so we try their
        # store-specific API endpoint that powers the flyer
        # This URL pattern returns JSON for a specific store
        api_url = "https://www.wholefoodsmarket.com/api/sales-flyer"
        resp = requests.get(
            api_url,
            params={"store_id": "10454"},  # Fort Greene
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                              "AppleWebKit/537.36 (KHTML, like Gecko) "
                              "Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
            },
            timeout=15,
        )

        if resp.status_code == 200:
            try:
                data = resp.json()
                # Parse the response (structure may vary)
                items = data if isinstance(data, list) else data.get("items", [])
                for item in items:
                    deal = {
                        "source": "whole_foods",
                        "store": "Whole Foods - Fort Greene",
                        "item": item.get("name", item.get("title", "")),
                        "price": item.get("sale_price", item.get("price", "")),
                        "original_price": item.get("regular_price", ""),
                        "sale_story": item.get("description", ""),
                        "category": categorize_item(item.get("name", "")),
                        "icon": "🥑",
                        "valid_from": "",
                        "valid_to": "",
                        "expires_in": "This week",
                        "scraped_at": datetime.now().isoformat(),
                    }
                    deals.append(deal)
            except json.JSONDecodeError:
                print("  ⚠️  Whole Foods API returned non-JSON, trying HTML scrape...")
                deals = scrape_whole_foods_html()
        else:
            print(f"  ⚠️  Whole Foods API returned {resp.status_code}, trying HTML scrape...")
            deals = scrape_whole_foods_html()

    except requests.RequestException as e:
        print(f"  ⚠️  Error fetching Whole Foods: {e}")
        deals = scrape_whole_foods_html()

    print(f"  ✅ Found {len(deals)} Whole Foods deals")
    return deals


def scrape_whole_foods_html():
    """
    Fallback: scrape the Whole Foods sales flyer HTML page.
    This is a backup in case the API doesn't work.
    """
    deals = []
    try:
        resp = requests.get(
            WHOLE_FOODS_SALES_URL,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                              "AppleWebKit/537.36",
            },
            timeout=15,
        )
        if resp.status_code == 200:
            html = resp.text
            # Look for JSON-LD or structured data in the page
            # Whole Foods often embeds product data in script tags
            json_matches = re.findall(
                r'<script[^>]*type="application/(?:ld\+)?json"[^>]*>(.*?)</script>',
                html, re.DOTALL
            )
            for match in json_matches:
                try:
                    data = json.loads(match)
                    if isinstance(data, dict) and "offers" in str(data).lower():
                        print(f"  📄 Found structured data in Whole Foods page")
                except json.JSONDecodeError:
                    continue

            # If we can't get structured data, log for manual entry
            print("  ℹ️  Whole Foods may require manual deal entry this week")
            print("     Visit: https://www.wholefoodsmarket.com/sales-flyer")
    except requests.RequestException as e:
        print(f"  ⚠️  HTML scrape failed: {e}")

    return deals


# ─────────────────────────────────────────────────────────────
# 3. TRADER JOE'S SCRAPER
#    TJ's doesn't have weekly deals — they have everyday low prices.
#    We scrape their product catalog for budget staples.
# ─────────────────────────────────────────────────────────────

def scrape_trader_joes_staples():
    """
    Scrape Trader Joe's product catalog for budget-friendly items.
    Since TJ's doesn't do weekly sales, we look for their cheapest staples.
    """
    print("\n🌺 Scraping Trader Joe's staples...")
    deals = []

    # TJ's uses a GraphQL API for their product catalog
    budget_searches = [
        "rice", "pasta", "beans", "frozen vegetables", "eggs",
        "bananas", "bread", "chicken", "canned", "oatmeal",
    ]

    for term in budget_searches:
        try:
            # TJ's product search endpoint
            resp = requests.get(
                f"https://www.traderjoes.com/api/graphql",
                params={
                    "operationName": "SearchProducts",
                    "variables": json.dumps({
                        "search": term,
                        "pageSize": 5,
                        "currentPage": 1,
                        "storeCode": "TPS0543",  # Brooklyn City Point
                        "published": "1",
                    }),
                    "extensions": json.dumps({
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "6b607f7c9c571c8e3a26e8dd5e1b8e3e3e9e4d7b"
                        }
                    }),
                },
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                                  "AppleWebKit/537.36",
                    "Accept": "application/json",
                },
                timeout=10,
            )

            if resp.status_code == 200:
                try:
                    data = resp.json()
                    products = (
                        data.get("data", {})
                        .get("products", {})
                        .get("items", [])
                    )
                    for product in products:
                        price = product.get("price_range", {}).get(
                            "minimum_price", {}
                        ).get("final_price", {}).get("value")

                        if price and price < 5.00:  # Only budget items
                            deal = {
                                "source": "trader_joes",
                                "store": "Trader Joe's - City Point",
                                "item": product.get("name", term.title()),
                                "price": f"${price:.2f}",
                                "original_price": "",
                                "sale_story": "Everyday low price",
                                "category": categorize_item(
                                    product.get("name", term)
                                ),
                                "icon": "🌺",
                                "valid_from": "",
                                "valid_to": "",
                                "expires_in": "Always",
                                "scraped_at": datetime.now().isoformat(),
                            }
                            deals.append(deal)
                except json.JSONDecodeError:
                    pass

            time.sleep(0.5)

        except requests.RequestException as e:
            print(f"  ⚠️  Error searching TJ's for '{term}': {e}")
            continue

    # If the GraphQL API doesn't work (it changes frequently),
    # fall back to a curated list of known TJ's budget staples
    if not deals:
        print("  ℹ️  TJ's API unavailable — using curated staples list")
        deals = get_trader_joes_curated_staples()

    print(f"  ✅ Found {len(deals)} Trader Joe's items")
    return deals


def get_trader_joes_curated_staples():
    """
    Fallback: curated list of Trader Joe's budget staples.
    These prices are relatively stable and rarely change.
    Volunteers should verify prices monthly.
    """
    staples = [
        ("Organic Bananas (bunch)", "$0.29/each", "Produce"),
        ("Long Grain White Rice (3lb)", "$3.49", "Staples"),
        ("Organic Pasta (16oz)", "$1.49", "Staples"),
        ("Canned Black Beans (15oz)", "$1.19", "Protein"),
        ("Frozen Stir Fry Vegetables (16oz)", "$1.99", "Produce"),
        ("Frozen Riced Cauliflower (12oz)", "$2.29", "Produce"),
        ("Cage-Free Eggs (dozen)", "$3.49", "Protein"),
        ("Sliced Whole Wheat Bread", "$2.99", "Staples"),
        ("Peanut Butter Creamy (16oz)", "$2.49", "Staples"),
        ("Chicken Thighs (per lb)", "$2.49/lb", "Protein"),
        ("Organic Canned Tomatoes (28oz)", "$1.99", "Staples"),
        ("Frozen Brown Rice (3-pack)", "$2.99", "Staples"),
        ("Garlic (3-pack)", "$0.99", "Produce"),
        ("Yellow Onions (3lb bag)", "$1.99", "Produce"),
        ("Russet Potatoes (5lb)", "$3.99", "Produce"),
        ("Italian Style Wedding Soup", "$2.49", "Staples"),
    ]

    deals = []
    for name, price, category in staples:
        deals.append({
            "source": "trader_joes_curated",
            "store": "Trader Joe's - City Point",
            "item": name,
            "price": price,
            "original_price": "",
            "sale_story": "Everyday low price",
            "category": category,
            "icon": "🌺",
            "valid_from": "",
            "valid_to": "",
            "expires_in": "Always",
            "scraped_at": datetime.now().isoformat(),
        })
    return deals


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def categorize_item(item_name):
    """Guess a deal category from the item name."""
    name_lower = item_name.lower()
    protein_words = ["chicken", "beef", "pork", "turkey", "eggs", "bean", "tuna", "lentil", "fish", "salmon"]
    produce_words = ["banana", "apple", "potato", "onion", "tomato", "lettuce", "carrot", "cabbage", "plantain", "avocado", "vegetable", "fruit", "broccoli", "pepper"]
    dairy_words = ["milk", "cheese", "yogurt", "butter", "cream"]

    if any(w in name_lower for w in protein_words):
        return "Protein"
    elif any(w in name_lower for w in produce_words):
        return "Produce"
    elif any(w in name_lower for w in dairy_words):
        return "Dairy"
    return "Staples"


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Project Sauce Deal Scraper")
    parser.add_argument("--flipp", action="store_true", help="Scrape Flipp only")
    parser.add_argument("--wholefoods", action="store_true", help="Scrape Whole Foods only")
    parser.add_argument("--traderjoes", action="store_true", help="Scrape Trader Joe's only")
    parser.add_argument("--dry-run", action="store_true", help="Print results, don't save")
    parser.add_argument("--output", default="deals.json", help="Output file path")
    args = parser.parse_args()

    scrape_all = not (args.flipp or args.wholefoods or args.traderjoes)

    all_deals = []

    print("=" * 60)
    print("🥬 Project Sauce — Deal Scraper")
    print(f"   ZIP: {POSTAL_CODE} | {datetime.now().strftime('%B %d, %Y %I:%M %p')}")
    print("=" * 60)

    # Run scrapers
    if scrape_all or args.flipp:
        all_deals.extend(scrape_flipp_deals())

    if scrape_all or args.wholefoods:
        all_deals.extend(scrape_whole_foods_deals())

    if scrape_all or args.traderjoes:
        all_deals.extend(scrape_trader_joes_staples())

    # Summary
    print("\n" + "=" * 60)
    print(f"📊 SUMMARY: {len(all_deals)} total deals found")

    by_store = {}
    for d in all_deals:
        store = d["store"]
        by_store[store] = by_store.get(store, 0) + 1
    for store, count in sorted(by_store.items()):
        print(f"   {store}: {count} deals")

    by_category = {}
    for d in all_deals:
        cat = d["category"]
        by_category[cat] = by_category.get(cat, 0) + 1
    for cat, count in sorted(by_category.items()):
        print(f"   {cat}: {count} items")

    print("=" * 60)

    if args.dry_run:
        print("\n🔍 DRY RUN — Sample deals:")
        for deal in all_deals[:10]:
            print(f"  {deal['icon']} {deal['item'][:40]:40s} {deal['price']:>10s}  @ {deal['store']}")
        return

    # Save to JSON
    output = {
        "scraped_at": datetime.now().isoformat(),
        "postal_code": POSTAL_CODE,
        "week_of": datetime.now().strftime("%B %d, %Y"),
        "total_deals": len(all_deals),
        "deals": all_deals,
    }

    with open(args.output, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n💾 Saved {len(all_deals)} deals to {args.output}")

    # Also try to push to Google Sheets if configured
    try:
        from google_sheets import push_deals_to_sheets
        push_deals_to_sheets(all_deals)
    except ImportError:
        print("ℹ️  Google Sheets module not configured — skipping upload")
    except Exception as e:
        print(f"⚠️  Google Sheets upload failed: {e}")
        print("   Deals are still saved locally in deals.json")


if __name__ == "__main__":
    main()
