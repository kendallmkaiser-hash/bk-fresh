"""
Configuration for Project Sauce deal scrapers.
Edit this file to add/remove stores and search terms.
"""

# Downtown Brooklyn ZIP code
POSTAL_CODE = "11201"

# ─────────────────────────────────────────────
# Stores to scrape from Flipp (via backflipp API)
# These are the store names as they appear on Flipp
# ─────────────────────────────────────────────
FLIPP_STORES = [
    "ALDI",
    "Key Food",
    "Food Bazaar",
    "Lidl",
    "Bravo Supermarkets",
    "C-Town Supermarkets",
    "Associated Supermarket",
]

# ─────────────────────────────────────────────
# Search terms to query on Flipp
# These are common affordable grocery items
# ─────────────────────────────────────────────
SEARCH_TERMS = [
    # Protein
    "chicken",
    "ground beef",
    "eggs",
    "beans",
    "lentils",
    "canned tuna",
    "pork",
    "turkey",
    # Produce
    "bananas",
    "apples",
    "potatoes",
    "onions",
    "tomatoes",
    "lettuce",
    "carrots",
    "cabbage",
    "plantains",
    "avocado",
    # Staples
    "rice",
    "pasta",
    "bread",
    "flour",
    "cooking oil",
    "canned tomatoes",
    "cereal",
    "oatmeal",
    "peanut butter",
    # Dairy
    "milk",
    "cheese",
    "yogurt",
    "butter",
]

# ─────────────────────────────────────────────
# Whole Foods - Fort Greene location
# ─────────────────────────────────────────────
WHOLE_FOODS_SALES_URL = "https://www.wholefoodsmarket.com/sales-flyer"
WHOLE_FOODS_STORE_ID = "10454"  # Fort Greene store

# ─────────────────────────────────────────────
# Trader Joe's - City Point Brooklyn
# Base product catalog URL
# ─────────────────────────────────────────────
TRADER_JOES_API_BASE = "https://www.traderjoes.com/api/graphql"

# Budget-friendly TJ categories to scrape
TRADER_JOES_CATEGORIES = [
    "Produce",
    "Grains, Pasta & Sides",
    "Canned & Packaged",
    "Frozen",
    "Dairy & Eggs",
    "Meat, Poultry & Seafood",
]

# ─────────────────────────────────────────────
# Deal categories for the app
# ─────────────────────────────────────────────
CATEGORIES = {
    "chicken": "Protein",
    "ground beef": "Protein",
    "eggs": "Protein",
    "beans": "Protein",
    "lentils": "Protein",
    "canned tuna": "Protein",
    "pork": "Protein",
    "turkey": "Protein",
    "bananas": "Produce",
    "apples": "Produce",
    "potatoes": "Produce",
    "onions": "Produce",
    "tomatoes": "Produce",
    "lettuce": "Produce",
    "carrots": "Produce",
    "cabbage": "Produce",
    "plantains": "Produce",
    "avocado": "Produce",
    "rice": "Staples",
    "pasta": "Staples",
    "bread": "Staples",
    "flour": "Staples",
    "cooking oil": "Staples",
    "canned tomatoes": "Staples",
    "cereal": "Staples",
    "oatmeal": "Staples",
    "peanut butter": "Staples",
    "milk": "Dairy",
    "cheese": "Dairy",
    "yogurt": "Dairy",
    "butter": "Dairy",
}

# Emoji mapping for categories
CATEGORY_ICONS = {
    "Protein": "🍗",
    "Produce": "🥬",
    "Staples": "🍚",
    "Dairy": "🥛",
}
