// ============================================================
//  AutoMart Backend Server
//  --------------------------------------------------------
//  Tech Stack : Node.js + Express
//  Car API    : CarAPI.app (https://carapi.app) — Free Tier
//  Pricing    : Custom depreciation-based estimation algorithm
//  Author     : AutoMart Team
//  ============================================================

// ---- 1. IMPORTS ----
const express  = require('express');                 // Web framework
const cors     = require('cors');                    // Cross-origin support
const fetch    = require('node-fetch');              // HTTP client for API calls
const path     = require('path');                    // File path utilities
const fs       = require('fs');                      // File system (for priceData)

// ---- 2. APP CONFIGURATION ----
const app  = express();
const PORT = process.env.PORT || 3000;               // Default port

// Load the base MSRP / price data from our local JSON file
// This is used as a fallback when the API doesn't return MSRP
const priceData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'priceData.json'), 'utf-8')
);

// ---- 3. MIDDLEWARE ----
app.use(cors());                                     // Allow cross-origin requests
app.use(express.json());                             // Parse JSON request bodies
app.use(express.static(path.join(__dirname)));       // Serve frontend files

// ---- 4. CONSTANTS ----
// CarAPI.app base URL (free tier — no API key needed for basic data)
const CAR_API_BASE = 'https://carapi.app/api';

// Hardcoded specs for exotic/hypercar models where the API returns N/A
const KNOWN_SPECS = {
  "Ferrari": {
    "812 GTS":       { engine: "6.5L V12", horsepower: 789, torque: 530, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: 12 },
    "812 Superfast":  { engine: "6.5L V12", horsepower: 789, torque: 530, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: 12 },
    "SF90 Stradale": { engine: "4.0L Twin-Turbo V8 Hybrid", horsepower: 986, torque: 590, fuel_type: "Hybrid", transmission: "8-Speed Dual-Clutch", drive_type: "AWD", cylinders: 8 },
    "F8 Tributo":    { engine: "3.9L Twin-Turbo V8", horsepower: 710, torque: 568, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: 8 },
    "Roma":          { engine: "3.9L Twin-Turbo V8", horsepower: 612, torque: 561, fuel_type: "Gasoline", transmission: "8-Speed Dual-Clutch", drive_type: "RWD", cylinders: 8 },
    "296 GTB":       { engine: "3.0L Twin-Turbo V6 Hybrid", horsepower: 819, torque: 546, fuel_type: "Hybrid", transmission: "8-Speed Dual-Clutch", drive_type: "RWD", cylinders: 6 },
    "Portofino M":   { engine: "3.9L Twin-Turbo V8", horsepower: 612, torque: 561, fuel_type: "Gasoline", transmission: "8-Speed Dual-Clutch", drive_type: "RWD", cylinders: 8 },
    "488 GTB":       { engine: "3.9L Twin-Turbo V8", horsepower: 661, torque: 561, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: 8 },
    "LaFerrari":     { engine: "6.3L V12 Hybrid", horsepower: 950, torque: 664, fuel_type: "Hybrid", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: 12 }
  },
  "Bugatti": {
    "Chiron":        { engine: "8.0L Quad-Turbo W16", horsepower: 1479, torque: 1180, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: 16 },
    "Divo":          { engine: "8.0L Quad-Turbo W16", horsepower: 1500, torque: 1180, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: 16 },
    "Veyron":        { engine: "8.0L Quad-Turbo W16", horsepower: 1001, torque: 922, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: 16 },
    "Centodieci":    { engine: "8.0L Quad-Turbo W16", horsepower: 1577, torque: 1180, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: 16 },
    "Bolide":        { engine: "8.0L Quad-Turbo W16", horsepower: 1824, torque: 1364, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: 16 },
    "Mistral":       { engine: "8.0L Quad-Turbo W16", horsepower: 1577, torque: 1180, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: 16 }
  },
  "Lamborghini": {
    "Hurac\u00e1n":       { engine: "5.2L V10", horsepower: 631, torque: 417, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: 10 },
    "Aventador":     { engine: "6.5L V12", horsepower: 769, torque: 531, fuel_type: "Gasoline", transmission: "7-Speed ISR", drive_type: "AWD", cylinders: 12 },
    "Urus":          { engine: "4.0L Twin-Turbo V8", horsepower: 657, torque: 627, fuel_type: "Gasoline", transmission: "8-Speed Automatic", drive_type: "AWD", cylinders: 8 },
    "Revuelto":      { engine: "6.5L V12 Hybrid", horsepower: 1001, torque: 535, fuel_type: "Hybrid", transmission: "8-Speed Dual-Clutch", drive_type: "AWD", cylinders: 12 }
  },
  "McLaren": {
    "720S":          { engine: "4.0L Twin-Turbo V8", horsepower: 710, torque: 568, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: 8 },
    "765LT":         { engine: "4.0L Twin-Turbo V8", horsepower: 755, torque: 590, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: 8 },
    "Artura":        { engine: "3.0L Twin-Turbo V6 Hybrid", horsepower: 671, torque: 531, fuel_type: "Hybrid", transmission: "8-Speed Dual-Clutch", drive_type: "RWD", cylinders: 6 },
    "GT":            { engine: "4.0L Twin-Turbo V8", horsepower: 612, torque: 465, fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: 8 }
  }
};

// ============================================================
//  5. HELPER FUNCTIONS
// ============================================================

/**
 * fetchJSON — Fetch data from a URL with timeout & error handling
 * @param {string} url      - The URL to fetch
 * @param {number} timeoutMs - Timeout in milliseconds (default 12s)
 * @returns {object} Parsed JSON response
 */
async function fetchJSON(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    // Handle non-200 responses
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`API returned ${response.status}: ${text}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * estimatePrice — Custom depreciation-based price estimation
 * ============================================================
 * ALGORITHM  (5-step formula):
 *
 *   Step 1 — Get base MSRP:
 *       → CarAPI MSRP  →  priceData.json  →  category default
 *
 *   Step 2 — Apply DEPRECIATION by vehicle age:
 *       →  Year 0 : 0%    (brand new)
 *       →  Year 1 : 20%   (biggest drop — drives off lot)
 *       →  Year 2 : +15%  (total ≈ 35%)
 *       →  Year 3+: +10% per year (capped at 90% max)
 *
 *   Step 3 — Apply CATEGORY MULTIPLIER:
 *       →  Trucks: ×1.05   (hold value better)
 *       →  SUVs:   ×1.02   (slightly better retention)
 *       →  Sports: ×0.92   (depreciate faster)
 *       →  Luxury: ×0.97   (higher maintenance factored in)
 *
 *   Step 4 — Enforce PRICE FLOOR:
 *       →  Never below 10% of original MSRP
 *
 *   Step 5 — Round to nearest $100
 *
 * @param {string}      make     - Car manufacturer
 * @param {string}      model    - Car model name
 * @param {number}      year     - Model year
 * @param {number|null} apiMsrp  - MSRP from CarAPI (if available)
 * @param {string|null} category - Vehicle category (sedan, suv, etc.)
 * @returns {object} { estimated_price, msrp, depreciation_pct, vehicle_age, method }
 */
function estimatePrice(make, model, year, apiMsrp = null, category = null) {
  const currentYear = new Date().getFullYear();
  const vehicleAge  = Math.max(0, currentYear - year);  // Never negative

  // ── Step 1: Determine base MSRP ──
  let baseMsrp    = apiMsrp;
  let priceMethod = 'carapi_msrp';     // Track price source

  // If API didn't provide MSRP, check our local priceData.json
  if (!baseMsrp || baseMsrp <= 0) {
    const makeData = priceData[make];
    if (makeData && makeData[model]) {
      baseMsrp    = makeData[model].base_msrp;
      category    = category || makeData[model].category;
      priceMethod = 'local_msrp';
    }
  }

  // If still no MSRP, use category-based default
  if (!baseMsrp || baseMsrp <= 0) {
    const isLuxury = priceData._luxury_brands?.includes(make);
    let defaultKey = category || 'unknown';
    if (isLuxury && defaultKey === 'sedan') defaultKey = 'luxury_sedan';
    if (isLuxury && defaultKey === 'suv')   defaultKey = 'luxury_suv';

    baseMsrp    = priceData._defaults[defaultKey]?.base_msrp || 32000;
    priceMethod = 'estimated_default';
  }

  // ── Step 2: Calculate depreciation ──
  let depreciationRate = 0;

  if (vehicleAge === 0) {
    depreciationRate = 0;                       // Brand new
  } else if (vehicleAge === 1) {
    depreciationRate = 0.20;                    // Year 1: 20%
  } else if (vehicleAge === 2) {
    depreciationRate = 0.20 + 0.15;             // Year 2: 35%
  } else {
    // Year 3+: 35% + (age-2)×10%, capped at 90%
    depreciationRate = 0.35 + ((vehicleAge - 2) * 0.10);
    depreciationRate = Math.min(depreciationRate, 0.90);
  }

  // ── Step 3: Category multiplier ──
  let categoryMultiplier = 1.0;
  const isLuxury = priceData._luxury_brands?.includes(make);

  if (category === 'truck')  categoryMultiplier = 1.05;
  if (category === 'suv')    categoryMultiplier = 1.02;
  if (category === 'sports') categoryMultiplier = 0.92;
  if (isLuxury)              categoryMultiplier *= 0.97;

  // ── Step 4: Compute final price ──
  let estimatedPrice = baseMsrp * (1 - depreciationRate) * categoryMultiplier;

  // Price floor: never below 10% of original MSRP
  estimatedPrice = Math.max(estimatedPrice, baseMsrp * 0.10);

  // ── Step 5: Round to nearest $100 ──
  estimatedPrice = Math.round(estimatedPrice / 100) * 100;

  return {
    estimated_price:  estimatedPrice,
    msrp:             Math.round(baseMsrp),
    depreciation_pct: Math.round(depreciationRate * 100),
    vehicle_age:      vehicleAge,
    method:           priceMethod
  };
}

// ============================================================
//  6. API ROUTES
// ============================================================

// ----------------------------------------------------------
//  GET /api/years
//  Returns available model years from CarAPI
// ----------------------------------------------------------
app.get('/api/years', async (req, res) => {
  try {
    const data = await fetchJSON(`${CAR_API_BASE}/years`);
    // CarAPI returns a plain array: [2027, 2026, ...]
    res.json({ success: true, years: data });
  } catch (error) {
    console.error('[/api/years] Error:', error.message);
    // Fallback: generate years locally
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear + 1; y >= 1995; y--) years.push(y);
    res.json({ success: true, years, source: 'fallback' });
  }
});

// ----------------------------------------------------------
//  GET /api/makes?year=2022
//  Returns list of car makes. Optional year filter.
// ----------------------------------------------------------
app.get('/api/makes', async (req, res) => {
  try {
    const { year } = req.query;
    let url = `${CAR_API_BASE}/makes/v2?limit=100`;
    if (year) url += `&year=${year}`;

    const data = await fetchJSON(url);

    if (data.data && data.data.length > 0) {
      const makes = data.data.map(m => ({ id: m.id, name: m.name }));
      return res.json({ success: true, count: makes.length, makes });
    }
    throw new Error('Empty response from CarAPI');
  } catch (error) {
    console.error('[/api/makes] Error:', error.message);
    // Fallback: curated popular makes list
    const popularMakes = [
      'Acura','Alfa Romeo','Aston Martin','Audi','Bentley','BMW','Buick',
      'Cadillac','Chevrolet','Chrysler','Dodge','Ferrari','Fiat','Ford',
      'Genesis','GMC','Honda','Hyundai','Infiniti','Jaguar','Jeep','Kia',
      'Lamborghini','Land Rover','Lexus','Lincoln','Lotus','Maserati','Mazda',
      'McLaren','Mercedes-Benz','Mini','Mitsubishi','Nissan','Porsche','Ram',
      'Rolls-Royce','Subaru','Tesla','Toyota','Volkswagen','Volvo'
    ].map((name, i) => ({ id: i + 1, name }));
    res.json({ success: true, count: popularMakes.length, makes: popularMakes, source: 'fallback' });
  }
});

// ----------------------------------------------------------
//  GET /api/models?make=Toyota&year=2022
//  Returns models for a given make (optionally filtered by year)
// ----------------------------------------------------------
app.get('/api/models', async (req, res) => {
  try {
    const { make, year } = req.query;

    if (!make) {
      return res.status(400).json({
        success: false,
        error: 'The "make" query parameter is required.'
      });
    }

    let url = `${CAR_API_BASE}/models/v2?limit=100&make=${encodeURIComponent(make)}`;
    if (year) url += `&year=${year}`;

    const data = await fetchJSON(url);

    if (!data.data || data.data.length === 0) {
      const localMakeData = priceData[make];
      if (localMakeData) {
        const localModels = Object.keys(localMakeData)
          .filter(name => !name.startsWith('_'))
          .map((name, index) => ({ id: `local-${index + 1}`, name, make }));

        return res.json({ success: true, count: localModels.length, models: localModels, source: 'fallback' });
      }

      return res.status(404).json({
        success: false,
        error: `No models found for "${make}"${year ? ` in ${year}` : ''}.`
      });
    }

    // Remove duplicate model names
    const models = data.data.map(m => ({ id: m.id, name: m.name, make: m.make }));
    const unique = [...new Map(models.map(m => [m.name, m])).values()];

    res.json({ success: true, count: unique.length, models: unique });
  } catch (error) {
    console.error('[/api/models] Error:', error.message);

    const { make } = req.query;
    const localMakeData = make ? priceData[make] : null;
    if (localMakeData) {
      const localModels = Object.keys(localMakeData)
        .filter(name => !name.startsWith('_'))
        .map((name, index) => ({ id: `local-${index + 1}`, name, make }));

      return res.json({ success: true, count: localModels.length, models: localModels, source: 'fallback' });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch models. CarAPI may be temporarily unavailable.'
    });
  }
});

// ==============================================================
//  ★ GET /api/car?make=Toyota&model=Camry&year=2022
//  MAIN ENDPOINT — Returns specs + estimated price
//  -------------------------------------------------------
//  Fetches from CarAPI.app:
//    - /api/trims/v2    → trim name, description, MSRP
//    - /api/engines/v2  → engine, fuel, HP, transmission
//  Then runs our custom price estimation algorithm.
//  NOTE: year is OPTIONAL — if omitted, returns latest data.
// ==============================================================
app.get('/api/car', async (req, res) => {
  try {
    const { make, model, year } = req.query;

    // ── Validate required parameters (year is optional) ──
    if (!make || !model) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: make and model.',
        example: '/api/car?make=Toyota&model=Camry&year=2022'
      });
    }

    // Parse year if provided, otherwise null
    let yearNum = null;
    if (year) {
      yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 1995 || yearNum > new Date().getFullYear() + 2) {
        return res.status(400).json({
          success: false,
          error: `Invalid year "${year}". Must be between 1995 and ${new Date().getFullYear() + 2}.`
        });
      }
    }

    // ── Build API query string (year added only if provided) ──
    const yearParam = yearNum ? `&year=${yearNum}` : '';

    // ── Fetch trims + engines from CarAPI in PARALLEL ──
    const [trimsResult, enginesResult] = await Promise.allSettled([
      fetchJSON(
        `${CAR_API_BASE}/trims/v2?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${yearParam}&limit=50`
      ),
      fetchJSON(
        `${CAR_API_BASE}/engines/v2?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${yearParam}&limit=50`
      )
    ]);

    const trimsData   = trimsResult.status   === 'fulfilled' ? trimsResult.value   : null;
    const enginesData = enginesResult.status === 'fulfilled' ? enginesResult.value : null;

    const hasTrims   = trimsData?.data?.length > 0;
    const hasEngines = enginesData?.data?.length > 0;

    // No data at all → check KNOWN_SPECS fallback, then 404
    if (!hasTrims && !hasEngines) {
      const fallbackSpec = (KNOWN_SPECS[make] && KNOWN_SPECS[make][model]) || null;
      const fallbackPrice = (priceData[make] && priceData[make][model]) || null;

      if (fallbackSpec || fallbackPrice) {
        const pricing = estimatePrice(make, model, yearNum || new Date().getFullYear(), null, 'sports');

        const syntheticTrim = {
          trim_name: 'Base',
          submodel: null,
          description: 'N/A',
          engine: fallbackSpec ? fallbackSpec.engine : 'N/A',
          fuel_type: fallbackSpec ? fallbackSpec.fuel_type : 'N/A',
          horsepower: fallbackSpec ? `${fallbackSpec.horsepower} HP` : 'N/A',
          torque: fallbackSpec ? `${fallbackSpec.torque} lb-ft` : 'N/A',
          transmission: fallbackSpec ? fallbackSpec.transmission : 'N/A',
          drive_type: fallbackSpec ? fallbackSpec.drive_type : 'N/A',
          cylinders: fallbackSpec ? fallbackSpec.cylinders : 'N/A',
          msrp: pricing ? pricing.msrp : null,
          estimated_price: pricing ? pricing.estimated_price : null,
          depreciation_pct: pricing ? pricing.depreciation_pct : null,
          price_method: pricing ? pricing.method : null
        };

        return res.json({
          success: true,
          vehicle: {
            year: yearNum || 'All Years',
            make: make,
            model: model,
            total_trims: 1,
            trims: [syntheticTrim],
            source: 'AutoMart Database'
          }
        });
      }

      return res.status(404).json({
        success: false,
        error: `No data found for ${yearNum ? yearNum + ' ' : ''}${make} ${model}.`,
        suggestions: 'The free tier covers many years. Check your spelling or try: Toyota Camry 2020'
      });
    }

    // ── Build engine lookup (trim_id → engine specs) ──
    const engineMap = {};
    if (hasEngines) {
      enginesData.data.forEach(eng => {
        engineMap[eng.trim_id] = {
          engine_type:  eng.engine_type   || 'N/A',
          fuel_type:    eng.fuel_type     || 'N/A',
          cylinders:    eng.cylinders     || 'N/A',
          displacement: eng.size ? `${eng.size}L` : 'N/A',
          horsepower:   eng.horsepower_hp || null,
          hp_rpm:       eng.horsepower_rpm || null,
          torque:       eng.torque_ft_lbs  || null,
          valve_timing: eng.valve_timing   || 'N/A',
          cam_type:     eng.cam_type       || 'N/A',
          drive_type:   eng.drive_type     || 'N/A',
          transmission: eng.transmission   || 'N/A'
        };
      });
    }

    // ── Build trim results with specs + price ──
    let trims = [];

    // Get fallback specs for exotic cars from KNOWN_SPECS
    const knownSpec = (KNOWN_SPECS[make] && KNOWN_SPECS[make][model]) || null;

    if (hasTrims) {
      trims = trimsData.data.map(trim => {
        const engine = engineMap[trim.id] || {};

        // Detect category from description text
        const desc = (trim.description || '').toLowerCase();
        let category = null;
        if (desc.includes('sedan'))          category = 'sedan';
        else if (desc.includes('suv'))       category = 'suv';
        else if (desc.includes('truck') || desc.includes('cab'))  category = 'truck';
        else if (desc.includes('coupe') || desc.includes('convertible')) category = 'sports';
        else if (desc.includes('van'))       category = 'van';

        // For exotic cars, use KNOWN_SPECS as category fallback
        if (!category && knownSpec) category = 'sports';

        // Run price estimation — use API MSRP if available, otherwise fallback to local data
        const hasRealMsrp = trim.msrp && trim.msrp > 0;
        const pricing = hasRealMsrp
          ? estimatePrice(make, model, yearNum || new Date().getFullYear(), trim.msrp, category)
          : estimatePrice(make, model, yearNum || new Date().getFullYear(), null, category);

        // Build engine display — prefer API data, fallback to KNOWN_SPECS
        const rawEngine = engine.displacement && engine.displacement !== 'N/A'
          ? `${engine.displacement} ${engine.cylinders || ''} ${engine.engine_type || ''}`.trim()
          : (engine.engine_type && engine.engine_type !== 'N/A' ? engine.engine_type : null);

        return {
          trim_name:       trim.trim || 'Base',
          submodel:        trim.submodel || null,
          description:     trim.description || 'N/A',
          // ── Specs (API → KNOWN_SPECS fallback) ──
          engine:          rawEngine || (knownSpec ? knownSpec.engine : 'N/A'),
          fuel_type:       (engine.fuel_type && engine.fuel_type !== 'N/A') ? engine.fuel_type : (knownSpec ? knownSpec.fuel_type : 'N/A'),
          horsepower:      engine.horsepower   ? `${engine.horsepower} HP` : (knownSpec ? `${knownSpec.horsepower} HP` : 'N/A'),
          torque:          engine.torque        ? `${engine.torque} lb-ft` : (knownSpec ? `${knownSpec.torque} lb-ft` : 'N/A'),
          transmission:    (engine.transmission && engine.transmission !== 'N/A') ? engine.transmission : (knownSpec ? knownSpec.transmission : 'N/A'),
          drive_type:      (engine.drive_type && engine.drive_type !== 'N/A') ? engine.drive_type : (knownSpec ? knownSpec.drive_type : 'N/A'),
          cylinders:       (engine.cylinders && engine.cylinders !== 'N/A') ? engine.cylinders : (knownSpec ? knownSpec.cylinders : 'N/A'),
          // ── Pricing ──
          msrp:            pricing ? pricing.msrp            : null,
          estimated_price: pricing ? pricing.estimated_price : null,
          depreciation_pct:pricing ? pricing.depreciation_pct: null,
          price_method:    pricing ? pricing.method          : null
        };
      });
    } else if (hasEngines) {
      // Trims unavailable but engines exist — no MSRP available, skip pricing
      trims = enginesData.data.map(eng => {
        return {
          trim_name:       eng.trim || 'Base',
          submodel:        eng.submodel || null,
          description:     eng.trim_description || 'N/A',
          engine:          eng.size ? `${eng.size}L ${eng.cylinders || ''} ${eng.engine_type || ''}`.trim() : 'N/A',
          fuel_type:       eng.fuel_type     || 'N/A',
          horsepower:      eng.horsepower_hp ? `${eng.horsepower_hp} HP` : 'N/A',
          torque:          eng.torque_ft_lbs ? `${eng.torque_ft_lbs} lb-ft` : 'N/A',
          transmission:    eng.transmission  || 'N/A',
          drive_type:      eng.drive_type    || 'N/A',
          cylinders:       eng.cylinders     || 'N/A',
          msrp:            null,
          estimated_price: null,
          depreciation_pct:null,
          price_method:    null
        };
      });
    }

    // Deduplicate by (trim_name + description)
    const seen = new Set();
    trims = trims.filter(t => {
      const key = `${t.trim_name}|${t.description}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // ── Return JSON response ──
    res.json({
      success: true,
      vehicle: {
        year:        yearNum || 'All Years',
        make:        make,
        model:       model,
        total_trims: trims.length,
        trims:       trims,
        source:      'CarAPI.app'
      }
    });

  } catch (error) {
    console.error('[/api/car] Error:', error.message);

    if (error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        error: 'Request to CarAPI timed out. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching car data.'
    });
  }
});

// ---- Catch-all: serve index.html for unknown routes ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- Global error handler ----
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ============================================================
//  7. START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`\n  ⚡ AutoMart Server running at http://localhost:${PORT}`);
  console.log(`  📡 API Endpoints:`);
  console.log(`     GET /api/years                           → Available years`);
  console.log(`     GET /api/makes?year=                     → Car makes`);
  console.log(`     GET /api/models?make=Toyota&year=2022    → Models list`);
  console.log(`     GET /api/car?make=Toyota&model=Camry&year=2022`);
  console.log(`         → Full specs + estimated price`);
  console.log(`\n  🌐 Frontend: http://localhost:${PORT}/cars.html\n`);
});
