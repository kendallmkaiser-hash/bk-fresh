import { useState, useEffect } from "react";

/*
 * ─────────────────────────────────────────────────────────
 * PROJECT SAUCE — BK Fresh
 * Fighting food insecurity in Downtown Brooklyn
 *
 * Data sources (in priority order):
 *   1. Google Sheets (published CSV) — auto-updated by scraper
 *   2. Local deals.json — committed by GitHub Actions
 *   3. Fallback hardcoded data — always available
 * ─────────────────────────────────────────────────────────
 */

// ─── CONFIG ──────────────────────────────────────────────
// Replace with your published Google Sheet ID after setup
const GOOGLE_SHEET_ID = "YOUR_SHEET_ID_HERE";
const DEALS_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=deals`;

// ─── FALLBACK DATA ───────────────────────────────────────
const STORES = [
  { id: 1, name: "Food Bazaar Supermarket", address: "445 Gold St, Brooklyn, NY 11201", neighborhood: "Downtown Brooklyn", distance: "0.3 mi", snapEbt: true, hours: "7AM – 10PM", priceLevel: "$", tags: ["International", "Fresh Produce", "Bulk"], description: "Large supermarket with diverse international products at very affordable prices." },
  { id: 2, name: "Key Food - Myrtle Ave", address: "492 Myrtle Ave, Brooklyn, NY 11205", neighborhood: "Fort Greene", distance: "0.6 mi", snapEbt: true, hours: "7AM – 11PM", priceLevel: "$", tags: ["Store Brand", "Weekly Specials"], description: "Reliable neighborhood grocer with affordable Urban Meadow store brand." },
  { id: 3, name: "Trader Joe's - City Point", address: "445 Albee Square W, Brooklyn, NY 11201", neighborhood: "Downtown Brooklyn", distance: "0.2 mi", snapEbt: true, hours: "8AM – 9PM", priceLevel: "$$", tags: ["Private Label", "Prepared Foods"], description: "Great for affordable staples like rice, pasta, frozen meals, and snacks." },
  { id: 4, name: "ALDI - Fulton St", address: "625 Fulton St, Brooklyn, NY 11217", neighborhood: "Downtown Brooklyn", distance: "0.4 mi", snapEbt: true, hours: "9AM – 8PM", priceLevel: "$", tags: ["Budget", "No-Frills"], description: "German discount chain with rock-bottom prices. Bag your own to save." },
  { id: 5, name: "NYC Fresh Market", address: "150 Myrtle Ave, Brooklyn, NY 11201", neighborhood: "Downtown Brooklyn", distance: "0.4 mi", snapEbt: true, hours: "7AM – 10PM", priceLevel: "$", tags: ["Fresh Produce", "Deli"], description: "Neighborhood market with fresh produce and competitive prices." },
  { id: 6, name: "Bravo Supermarkets", address: "331 Myrtle Ave, Brooklyn, NY 11205", neighborhood: "Fort Greene", distance: "0.5 mi", snapEbt: true, hours: "7AM – 10PM", priceLevel: "$", tags: ["Latin Products", "Meat"], description: "Affordable supermarket with great Latin American products and fresh meats." },
  { id: 7, name: "Whole Foods - Fort Greene", address: "292 Ashland Pl, Brooklyn, NY 11217", neighborhood: "Fort Greene", distance: "0.5 mi", snapEbt: true, hours: "7AM – 10PM", priceLevel: "$$$", tags: ["Organic", "365 Brand"], description: "Higher-end but the 365 store brand is competitively priced." },
  { id: 8, name: "Lidl - Park Slope", address: "461 5th Ave, Brooklyn, NY 11215", neighborhood: "Park Slope", distance: "1.1 mi", snapEbt: true, hours: "8AM – 9PM", priceLevel: "$", tags: ["Budget", "European", "Bakery"], description: "German discount chain. Famous for 49¢ croissants and deep discounts." },
];

const FALLBACK_DEALS = [
  { store: "Food Bazaar", item: "Chicken Leg Quarters", price: "$0.79/lb", original_price: "$1.29/lb", category: "Protein", expires_in: "5 days", icon: "🍗", source: "flipp" },
  { store: "ALDI", item: "Long Grain White Rice (5lb)", price: "$2.99", original_price: "$4.49", category: "Staples", expires_in: "5 days", icon: "🍚", source: "flipp" },
  { store: "Key Food", item: "Black Beans (15oz can)", price: "$0.69", original_price: "$1.19", category: "Staples", expires_in: "5 days", icon: "🫘", source: "flipp" },
  { store: "Trader Joe's", item: "Frozen Stir-Fry Vegetables", price: "$1.99", original_price: "", category: "Produce", expires_in: "Always", icon: "🥦", source: "trader_joes" },
  { store: "Food Bazaar", item: "Bananas", price: "$0.39/lb", original_price: "$0.59/lb", category: "Produce", expires_in: "5 days", icon: "🍌", source: "flipp" },
  { store: "Lidl", item: "Eggs (Dozen, Large)", price: "$2.49", original_price: "$3.99", category: "Dairy", expires_in: "5 days", icon: "🥚", source: "flipp" },
  { store: "ALDI", item: "Pasta (1lb box)", price: "$0.89", original_price: "$1.29", category: "Staples", expires_in: "5 days", icon: "🍝", source: "flipp" },
  { store: "Bravo", item: "Green Plantains", price: "$0.49/each", original_price: "$0.79/each", category: "Produce", expires_in: "5 days", icon: "🍌", source: "flipp" },
  { store: "Whole Foods", item: "365 Organic Canned Tomatoes", price: "$1.49", original_price: "$1.99", category: "Staples", expires_in: "This week", icon: "🍅", source: "whole_foods" },
  { store: "Trader Joe's", item: "Peanut Butter (16oz)", price: "$2.49", original_price: "", category: "Staples", expires_in: "Always", icon: "🥜", source: "trader_joes" },
];

const RECIPES = [
  { id: 1, name: "Rice & Beans Bowl", totalCost: "$4.20", servings: 4, costPerServing: "$1.05", prepTime: "30 min", tags: ["High Protein", "SNAP Friendly"], image: "🍚",
    ingredients: [
      { item: "Long grain rice (2 cups)", cost: "$0.60", store: "ALDI" },
      { item: "Black beans, 2 cans", cost: "$1.38", store: "Key Food" },
      { item: "Onion (1)", cost: "$0.40", store: "Food Bazaar" },
      { item: "Garlic, cumin, salt, lime", cost: "$0.82", store: "Food Bazaar" },
      { item: "Hot sauce", cost: "$1.00", store: "ALDI" },
    ],
    steps: ["Rinse rice, combine with 2 cups water, boil then simmer covered 18 min.", "Dice onion, mince garlic. Sauté in oil until soft.", "Add drained beans, cumin, salt. Cook 8 min.", "Squeeze lime over beans. Serve over rice with hot sauce."],
  },
  { id: 2, name: "Chicken Stir-Fry", totalCost: "$6.50", servings: 4, costPerServing: "$1.63", prepTime: "25 min", tags: ["Quick", "SNAP Friendly"], image: "🍗",
    ingredients: [
      { item: "Chicken leg quarters (2 lbs)", cost: "$1.58", store: "Food Bazaar" },
      { item: "Frozen stir-fry veggies (16oz)", cost: "$1.99", store: "Trader Joe's" },
      { item: "Rice (2 cups)", cost: "$0.60", store: "ALDI" },
      { item: "Soy sauce, garlic, ginger, oil", cost: "$0.95", store: "Food Bazaar" },
    ],
    steps: ["Debone chicken legs, cut bite-size. Season with salt & pepper.", "Cook rice per package directions.", "Heat oil, cook chicken 6–7 min until golden.", "Add garlic and ginger 1 min, add frozen veggies, stir-fry 5 min, add soy sauce. Serve over rice."],
  },
  { id: 3, name: "Pasta e Fagioli", totalCost: "$3.80", servings: 4, costPerServing: "$0.95", prepTime: "35 min", tags: ["Vegetarian", "SNAP Friendly"], image: "🍝",
    ingredients: [
      { item: "Pasta (8oz)", cost: "$0.45", store: "ALDI" },
      { item: "Canned tomatoes (28oz)", cost: "$0.99", store: "Key Food" },
      { item: "White beans, 1 can", cost: "$0.69", store: "Key Food" },
      { item: "Onion, garlic, seasoning, olive oil", cost: "$1.00", store: "Food Bazaar" },
      { item: "Parmesan (optional)", cost: "$0.67", store: "Trader Joe's" },
    ],
    steps: ["Dice onion, mince garlic. Sauté in olive oil until golden.", "Add canned tomatoes, Italian seasoning, salt. Simmer 10 min.", "Add 2 cups water and pasta. Cook until al dente.", "Stir in drained beans. Cook 5 more min. Top with parmesan."],
  },
  { id: 4, name: "Plantain & Egg Breakfast", totalCost: "$2.60", servings: 2, costPerServing: "$1.30", prepTime: "15 min", tags: ["Quick", "Breakfast"], image: "🥚",
    ingredients: [
      { item: "Green plantains (2)", cost: "$0.98", store: "Bravo" },
      { item: "Eggs (4)", cost: "$0.83", store: "Lidl" },
      { item: "Oil, salt, pepper, hot sauce", cost: "$0.45", store: "Pantry" },
    ],
    steps: ["Peel plantains, slice into ½ inch rounds.", "Heat oil, fry plantains 3 min per side until golden.", "Push plantains aside, scramble or fry eggs in same pan.", "Season everything, serve with hot sauce."],
  },
];

const RESOURCES = [
  { title: "Apply for SNAP/EBT Benefits", description: "Get help paying for groceries — apply online through ACCESS HRA", link: "https://a069-access.nyc.gov/accesshra/", icon: "💳", type: "Apply" },
  { title: "SNAP Center - Brooklyn", description: "243 Schermerhorn St, Brooklyn, NY 11201 • (718) 722-4004", link: null, icon: "🏢", type: "Visit" },
  { title: "Food Help NYC Map", description: "Find food pantries and community kitchens near you", link: "https://foodhelp.nyc.gov/", icon: "🗺️", type: "Find Food" },
  { title: "Summer EBT for Kids", description: "Free grocery benefits for school-age children during summer break", link: "https://www.ny.gov/services/apply-snap", icon: "☀️", type: "Learn More" },
  { title: "Protect Your EBT Card", description: "Freeze your card using ebtEDGE. Only unfreeze when shopping.", link: null, icon: "🔒", type: "Safety Tip" },
];

const DEAL_CATEGORIES = ["All", "Protein", "Produce", "Staples", "Dairy"];

// ─── DATA FETCHING ───────────────────────────────────────

function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim());
  return lines.slice(1).map(line => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; }
      else if (line[i] === ',' && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += line[i]; }
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ""; });
    return obj;
  });
}

// ─── STYLES ──────────────────────────────────────────────
const s = {
  card: { background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "12px", padding: "18px", transition: "all 0.2s ease" },
  greenText: { color: "#4ade80" },
  mutedText: { color: "#8888aa", fontSize: "13px" },
  tag: { background: "#0f0f1e", color: "#8888cc", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", border: "1px solid #2a2a4a" },
  mono: { fontFamily: "'DM Mono', monospace" },
  sans: { fontFamily: "'DM Sans', sans-serif" },
};

// ─── COMPONENTS ──────────────────────────────────────────

function SnapBadge() {
  return <span style={{ background: "#1e3a5f", color: "#7dd3fc", border: "1px solid #1e40af", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, ...s.mono }}>SNAP/EBT ✓</span>;
}

function PriceBadge({ level }) {
  const c = { "$": ["#14532d", "#86efac", "#166534"], "$$": ["#713f12", "#fcd34d", "#854d0e"], "$$$": ["#7f1d1d", "#fca5a5", "#991b1b"] }[level] || ["#14532d", "#86efac", "#166534"];
  return <span style={{ background: c[0], color: c[1], border: `1px solid ${c[2]}`, padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700, ...s.mono }}>{level}</span>;
}

function SourceBadge({ source }) {
  if (source === "trader_joes" || source === "trader_joes_curated") return <span style={{ background: "#4a1942", color: "#e879a8", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", ...s.mono }}>TJ's</span>;
  if (source === "whole_foods") return <span style={{ background: "#1a3a1a", color: "#86efac", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", ...s.mono }}>WF</span>;
  return null;
}

function StoreCard({ store }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} style={{ ...s.card, cursor: "pointer", ...(open ? { borderColor: "#4ade80" } : {}) }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#4ade80"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = "#2a2a4a"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
            <h3 style={{ margin: 0, color: "#f0f0f0", fontSize: "17px", fontWeight: 700, ...s.sans }}>{store.name}</h3>
            <PriceBadge level={store.priceLevel} />
            {store.snapEbt && <SnapBadge />}
          </div>
          <p style={{ margin: "4px 0 0", ...s.mutedText, ...s.sans }}>{store.address}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ ...s.greenText, fontWeight: 700, fontSize: "15px", ...s.mono }}>{store.distance}</div>
          <div style={{ ...s.mutedText, fontSize: "12px", marginTop: "2px", ...s.sans }}>{store.hours}</div>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #2a2a4a", animation: "fadeIn 0.2s ease" }}>
          <p style={{ color: "#b0b0cc", fontSize: "14px", margin: "0 0 12px", lineHeight: 1.6, ...s.sans }}>{store.description}</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {store.tags.map(t => <span key={t} style={s.tag}>{t}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function DealCard({ deal }) {
  const hasSavings = deal.original_price && deal.original_price !== deal.price;
  return (
    <div style={{ ...s.card, display: "flex", gap: "16px", alignItems: "center" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#4ade80"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a4a"}>
      <div style={{ width: "52px", height: "52px", background: "#0f0f1e", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0 }}>{deal.icon || "🛒"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ color: "#f0f0f0", fontWeight: 700, fontSize: "15px", ...s.sans }}>{deal.item}</span>
          <SourceBadge source={deal.source} />
        </div>
        <div style={{ ...s.mutedText, marginTop: "4px", ...s.sans }}>
          {deal.store} {deal.expires_in ? `• ${deal.expires_in === "Always" ? "Everyday price" : `Expires: ${deal.expires_in}`}` : ""}
        </div>
        {deal.sale_story && deal.sale_story !== "Everyday low price" && (
          <div style={{ color: "#6a9a6a", fontSize: "12px", marginTop: "2px", ...s.sans }}>{deal.sale_story}</div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ ...s.greenText, fontWeight: 700, fontSize: "18px", ...s.mono }}>{deal.price}</div>
        {hasSavings && <div style={{ color: "#666", fontSize: "13px", textDecoration: "line-through", ...s.mono }}>{deal.original_price}</div>}
      </div>
    </div>
  );
}

function RecipeCard({ recipe, onSelect }) {
  return (
    <div onClick={() => onSelect(recipe)} style={{ ...s.card, cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#4ade80"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a4a"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ width: "60px", height: "60px", background: "#0f0f1e", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", flexShrink: 0 }}>{recipe.image}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: "#f0f0f0", fontSize: "17px", fontWeight: 700, ...s.sans }}>{recipe.name}</h3>
          <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
            <span style={{ ...s.greenText, fontWeight: 700, fontSize: "15px", ...s.mono }}>{recipe.costPerServing}<span style={{ ...s.mutedText, fontWeight: 400, fontSize: "12px" }}>/serving</span></span>
            <span style={{ ...s.mutedText, ...s.sans }}>⏱ {recipe.prepTime}</span>
            <span style={{ ...s.mutedText, ...s.sans }}>👥 Serves {recipe.servings}</span>
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
            {recipe.tags.map(t => <span key={t} style={{ ...s.tag, ...(t === "SNAP Friendly" ? { background: "#1e3a5f", color: "#7dd3fc", borderColor: "#1e40af" } : {}) }}>{t}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecipeDetail({ recipe, onBack }) {
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", ...s.greenText, cursor: "pointer", fontSize: "14px", padding: "0 0 16px", fontWeight: 600, ...s.sans }}>← Back to recipes</button>
      <div style={{ ...s.card, padding: "24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ width: "72px", height: "72px", background: "#0f0f1e", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>{recipe.image}</div>
          <div>
            <h2 style={{ margin: 0, color: "#f0f0f0", fontSize: "24px", ...s.sans }}>{recipe.name}</h2>
            <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
              <span style={{ ...s.greenText, fontWeight: 700, ...s.mono }}>{recipe.totalCost} total</span>
              <span style={{ ...s.mutedText, ...s.sans }}>⏱ {recipe.prepTime}</span>
              <span style={{ ...s.mutedText, ...s.sans }}>👥 {recipe.servings} servings</span>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <h4 style={{ ...s.greenText, fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", ...s.mono }}>Ingredients & Where to Buy</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {recipe.ingredients.map((ing, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#0f0f1e", borderRadius: "8px", gap: "8px" }}>
                  <span style={{ color: "#d0d0e0", fontSize: "14px", ...s.sans }}>{ing.item}</span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                    <span style={{ ...s.mutedText, fontSize: "12px", ...s.sans }}>{ing.store}</span>
                    <span style={{ ...s.greenText, fontWeight: 700, fontSize: "14px", ...s.mono }}>{ing.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ ...s.greenText, fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px", ...s.mono }}>Steps</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recipe.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "12px" }}>
                  <div style={{ width: "28px", height: "28px", background: "#14532d", color: "#4ade80", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0, ...s.mono }}>{i + 1}</div>
                  <p style={{ color: "#b0b0cc", fontSize: "14px", lineHeight: 1.6, margin: 0, ...s.sans }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("stores");
  const [dealFilter, setDealFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deals, setDeals] = useState(FALLBACK_DEALS);
  const [dataSource, setDataSource] = useState("fallback");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Try to fetch live deals from Google Sheets or local JSON
  useEffect(() => {
    async function fetchDeals() {
      // Try Google Sheets first
      if (GOOGLE_SHEET_ID !== "YOUR_SHEET_ID_HERE") {
        try {
          const resp = await fetch(DEALS_CSV_URL);
          if (resp.ok) {
            const csv = await resp.text();
            const parsed = parseCSV(csv);
            if (parsed.length > 0) {
              setDeals(parsed);
              setDataSource("google_sheets");
              setLastUpdated(new Date().toLocaleDateString());
              return;
            }
          }
        } catch (e) { console.log("Google Sheets unavailable, trying local..."); }
      }

      // Try local deals.json (committed by GitHub Actions)
      try {
        const resp = await fetch("/deals.json");
        if (resp.ok) {
          const data = await resp.json();
          if (data.deals && data.deals.length > 0) {
            setDeals(data.deals);
            setDataSource("local_json");
            setLastUpdated(data.week_of || new Date().toLocaleDateString());
          }
        }
      } catch (e) { console.log("Using fallback data"); }
    }
    fetchDeals();
  }, []);

  const filteredStores = STORES.filter(st => {
    const mp = priceFilter === "All" || st.priceLevel === priceFilter;
    const ms = searchQuery === "" || st.name.toLowerCase().includes(searchQuery.toLowerCase()) || st.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    return mp && ms;
  });

  const filteredDeals = deals.filter(d => dealFilter === "All" || d.category === dealFilter);
  const tabs = [
    { id: "stores", label: "Stores", icon: "📍" },
    { id: "deals", label: "Deals", icon: "🏷️" },
    { id: "recipes", label: "Recipes", icon: "🍳" },
    { id: "resources", label: "Help", icon: "💚" },
  ];

  const today = new Date();
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
  const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a1a", color: "#f0f0f0", ...s.sans }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; } ::selection { background: #4ade80; color: #0a0a1a; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 3px; }
        input::placeholder { color: #55557a; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "32px 24px 24px", background: "linear-gradient(180deg, #0f1a0f 0%, #0a0a1a 100%)", borderBottom: "1px solid #1a2a1a" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <div style={{ width: "40px", height: "40px", background: "#14532d", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🥬</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "28px", fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "#f0f0f0", letterSpacing: "-0.5px" }}>BK Fresh</h1>
            </div>
          </div>
          <p style={{ color: "#6a9a6a", fontSize: "14px", margin: "4px 0 0 52px", ...s.sans }}>
            by <strong style={{ color: "#4ade80" }}>Project Sauce</strong> — affordable groceries in Downtown Brooklyn
          </p>
          <div style={{ marginTop: "14px", marginLeft: "52px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#14532d22", border: "1px solid #14532d55", padding: "6px 14px", borderRadius: "20px" }}>
              <div style={{ width: "8px", height: "8px", background: "#4ade80", borderRadius: "50%", animation: "pulse 2s infinite" }} />
              <span style={{ ...s.greenText, fontSize: "12px", fontWeight: 600, ...s.mono }}>Week of {weekLabel}</span>
            </div>
            {dataSource !== "fallback" && (
              <span style={{ ...s.mutedText, fontSize: "11px", ...s.mono }}>
                Live data via {dataSource === "google_sheets" ? "Google Sheets" : "GitHub Actions"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#0a0a1aee", backdropFilter: "blur(12px)", borderBottom: "1px solid #1a1a2e" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", gap: "4px", padding: "8px 24px" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedRecipe(null); }}
              style={{ flex: 1, padding: "10px 0", background: activeTab === tab.id ? "#14532d" : "transparent", border: "none", borderRadius: "8px", color: activeTab === tab.id ? "#4ade80" : "#55557a", cursor: "pointer", fontSize: "13px", fontWeight: 600, ...s.sans, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <span style={{ fontSize: "16px" }}>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "20px 24px 80px" }}>

        {activeTab === "stores" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
              <input type="text" placeholder="Search stores or neighborhoods..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: "200px", padding: "10px 14px", background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "8px", color: "#f0f0f0", fontSize: "14px", ...s.sans, outline: "none" }}
                onFocus={e => e.target.style.borderColor = "#4ade80"} onBlur={e => e.target.style.borderColor = "#2a2a4a"} />
              <div style={{ display: "flex", gap: "6px" }}>
                {["All", "$", "$$", "$$$"].map(l => (
                  <button key={l} onClick={() => setPriceFilter(l)}
                    style={{ padding: "8px 14px", background: priceFilter === l ? "#14532d" : "#1a1a2e", border: `1px solid ${priceFilter === l ? "#166534" : "#2a2a4a"}`, borderRadius: "8px", color: priceFilter === l ? "#4ade80" : "#8888aa", cursor: "pointer", fontSize: "13px", fontWeight: 600, ...s.mono }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredStores.map(st => <StoreCard key={st.id} store={st} />)}
              {filteredStores.length === 0 && <p style={{ color: "#55557a", textAlign: "center", padding: "40px 0" }}>No stores match your search.</p>}
            </div>
            <div style={{ marginTop: "20px", padding: "16px", ...s.card, textAlign: "center" }}>
              <p style={{ ...s.mutedText, margin: 0 }}>Distances from Jay St – MetroTech. Know a store we're missing? <span style={{ ...s.greenText, cursor: "pointer" }}>Let us know →</span></p>
            </div>
          </div>
        )}

        {activeTab === "deals" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
              {DEAL_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setDealFilter(cat)}
                  style={{ padding: "8px 16px", background: dealFilter === cat ? "#14532d" : "#1a1a2e", border: `1px solid ${dealFilter === cat ? "#166534" : "#2a2a4a"}`, borderRadius: "8px", color: dealFilter === cat ? "#4ade80" : "#8888aa", cursor: "pointer", fontSize: "13px", fontWeight: 600, ...s.sans }}>{cat}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredDeals.map((d, i) => <DealCard key={i} deal={d} />)}
            </div>
            <div style={{ marginTop: "20px", padding: "16px 20px", background: "linear-gradient(135deg, #14532d22, #1e3a5f22)", borderRadius: "10px", border: "1px solid #14532d55" }}>
              <p style={{ color: "#6a9a6a", fontSize: "13px", margin: 0, lineHeight: 1.6, ...s.sans }}>
                💡 <strong style={{ ...s.greenText }}>Tip:</strong> Deals are auto-scraped from Flipp, Whole Foods, and Trader Joe's every Wednesday.
                {dataSource === "fallback" && " Currently showing sample data — connect Google Sheets to see live deals."}
                {" "}Prices may vary. Always check in-store.
              </p>
            </div>
          </div>
        )}

        {activeTab === "recipes" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {selectedRecipe ? <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} /> : (
              <>
                <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #14532d22, #0f0f1e)", borderRadius: "10px", border: "1px solid #14532d44", marginBottom: "20px" }}>
                  <p style={{ color: "#6a9a6a", fontSize: "14px", margin: 0, lineHeight: 1.6, ...s.sans }}>
                    Every recipe is priced using this week's deals at nearby stores. All are <strong style={{ ...s.greenText }}>under $2 per serving</strong> and SNAP/EBT eligible.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {RECIPES.map(r => <RecipeCard key={r.id} recipe={r} onSelect={setSelectedRecipe} />)}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "resources" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <h3 style={{ color: "#f0f0f0", fontSize: "18px", marginBottom: "6px", fontWeight: 700, ...s.sans }}>SNAP & Food Assistance</h3>
            <p style={{ ...s.mutedText, fontSize: "14px", marginBottom: "20px", lineHeight: 1.6, ...s.sans }}>Resources for you and your family in Brooklyn.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {RESOURCES.map((r, i) => {
                const inner = (
                  <div key={i} style={{ ...s.card, display: "flex", gap: "14px", alignItems: "center", cursor: r.link ? "pointer" : "default" }}
                    onMouseEnter={e => r.link && (e.currentTarget.style.borderColor = "#4ade80")}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a4a"}>
                    <div style={{ width: "48px", height: "48px", background: "#0f0f1e", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>{r.icon}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, color: "#f0f0f0", fontSize: "15px", fontWeight: 700, ...s.sans }}>{r.title}</h4>
                      <p style={{ margin: "4px 0 0", ...s.mutedText, lineHeight: 1.5, ...s.sans }}>{r.description}</p>
                    </div>
                    <span style={{ background: r.link ? "#14532d" : "#2a2a3e", color: r.link ? "#4ade80" : "#8888aa", padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", ...s.sans }}>{r.type} {r.link ? "→" : ""}</span>
                  </div>
                );
                return r.link ? <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{inner}</a> : <div key={i}>{inner}</div>;
              })}
            </div>
            <div style={{ marginTop: "24px", ...s.card, padding: "20px" }}>
              <h4 style={{ margin: "0 0 8px", color: "#f0f0f0", fontSize: "15px", ...s.sans }}>About Project Sauce</h4>
              <p style={{ ...s.mutedText, fontSize: "13px", lineHeight: 1.7, margin: 0, ...s.sans }}>
                Project Sauce is a community nonprofit dedicated to fighting food insecurity in Downtown Brooklyn.
                We auto-update store deals weekly so you can find the best prices on nutritious food near you.
                All information is free and open to everyone.
              </p>
              <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ background: "#14532d", color: "#4ade80", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", ...s.sans }}>Submit a Deal →</span>
                <span style={{ background: "#0f0f1e", color: "#8888cc", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "1px solid #2a2a4a", ...s.sans }}>Volunteer With Us</span>
              </div>
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #2a2a4a" }}>
                <p style={{ ...s.mutedText, fontSize: "11px", margin: 0, ...s.mono }}>
                  projectsauce.vercel.app • Open source • MIT License
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
