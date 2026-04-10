const SLOT_COUNT = 2;
const compareState = Array.from({ length: SLOT_COUNT }, () => ({
  make: '',
  model: '',
  year: '',
  vehicle: null
}));

const POPULAR_MAKES = [
  'Acura','Alfa Romeo','Aston Martin','Audi','Bentley','BMW','Buick',
  'Cadillac','Chevrolet','Chrysler','Dodge','Ferrari','Fiat','Ford',
  'Genesis','GMC','Honda','Hyundai','Infiniti','Jaguar','Jeep','Kia',
  'Lamborghini','Land Rover','Lexus','Lincoln','Lotus','Maserati','Mazda',
  'McLaren','Mercedes-Benz','Mini','Mitsubishi','Nissan','Porsche','Ram',
  'Rolls-Royce','Subaru','Tesla','Toyota','Volkswagen','Volvo'
];

const CAR_API_BASE = 'https://carapi.app/api';
const CORS_PROXY = 'https://corsproxy.io/?';

const SPEC_ROWS = [
  { key: 'trim_name', label: 'Trim' },
  { key: 'engine', label: 'Engine' },
  { key: 'horsepower', label: 'Horsepower' },
  { key: 'torque', label: 'Torque' },
  { key: 'fuel_type', label: 'Fuel Type' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'drive_type', label: 'Drive Type' },
  { key: 'cylinders', label: 'Cylinders' },
  { key: 'estimated_price_inr', label: 'Estimated Price (INR)' },
  { key: 'msrp_inr', label: 'MSRP (INR)' },
  { key: 'depreciation_pct', label: 'Depreciation' }
];

let localPriceDataCache = null;

function setGlobalLoader(isVisible, message = 'Fetching latest car data...') {
  const loader = document.getElementById('globalLoader');
  const loaderText = document.getElementById('globalLoaderText');
  if (!loader) return;

  if (loaderText) loaderText.textContent = message;
  loader.classList.toggle('active', isVisible);
  loader.setAttribute('aria-busy', isVisible ? 'true' : 'false');
}

function toggleTheme() {
  const html = document.documentElement;
  const themeIcon = document.querySelector('.theme-icon');

  if (html.classList.contains('light-mode')) {
    html.classList.remove('light-mode');
    if (themeIcon) themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.add('light-mode');
    if (themeIcon) themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'light');
  }
}

function initTheme() {
  const html = document.documentElement;
  const themeIcon = document.querySelector('.theme-icon');
  const savedTheme = localStorage.getItem('theme') || 'dark';

  if (savedTheme === 'light') {
    html.classList.add('light-mode');
    if (themeIcon) themeIcon.textContent = '☀️';
  } else {
    html.classList.remove('light-mode');
    if (themeIcon) themeIcon.textContent = '🌙';
  }
}

async function fetchLocalJSON(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJSONViaProxy(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const proxiedUrl = CORS_PROXY + encodeURIComponent(url);
    const response = await fetch(proxiedUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Proxy API returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeVehicleFromApiResponse(vehicleResponse) {
  if (!vehicleResponse || !vehicleResponse.success || !vehicleResponse.vehicle) return null;

  const primaryTrim = vehicleResponse.vehicle.trims && vehicleResponse.vehicle.trims.length > 0
    ? vehicleResponse.vehicle.trims[0]
    : null;

  if (!primaryTrim) return null;

  return {
    year: vehicleResponse.vehicle.year,
    make: vehicleResponse.vehicle.make,
    model: vehicleResponse.vehicle.model,
    source: vehicleResponse.vehicle.source || 'Database',
    trim_name: primaryTrim.trim_name || 'Base',
    engine: primaryTrim.engine || 'N/A',
    horsepower: primaryTrim.horsepower || 'N/A',
    torque: primaryTrim.torque || 'N/A',
    fuel_type: primaryTrim.fuel_type || 'N/A',
    transmission: primaryTrim.transmission || 'N/A',
    drive_type: primaryTrim.drive_type || 'N/A',
    cylinders: primaryTrim.cylinders || 'N/A',
    estimated_price_inr: formatINR(primaryTrim.estimated_price),
    msrp_inr: formatINR(primaryTrim.msrp),
    depreciation_pct: primaryTrim.depreciation_pct !== null && primaryTrim.depreciation_pct !== undefined
      ? `${primaryTrim.depreciation_pct}%`
      : 'N/A'
  };
}

async function fetchModelsFromDirectApi(make) {
  const data = await fetchJSONViaProxy(`${CAR_API_BASE}/models/v2?limit=100&make=${encodeURIComponent(make)}`);
  if (!data || !Array.isArray(data.data)) return [];
  return [...new Set(data.data.map(item => item.name).filter(Boolean))];
}

async function fetchMakesFromDirectApi() {
  const data = await fetchJSONViaProxy(`${CAR_API_BASE}/makes/v2?limit=100`);
  if (!data || !Array.isArray(data.data)) return [];
  return [...new Set(data.data.map(item => item.name).filter(Boolean))];
}

async function fetchVehicleFromDirectApi(make, model, year) {
  const yearParam = year ? `&year=${encodeURIComponent(year)}` : '';

  const [trimsResult, enginesResult] = await Promise.allSettled([
    fetchJSONViaProxy(`${CAR_API_BASE}/trims/v2?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${yearParam}&limit=50`),
    fetchJSONViaProxy(`${CAR_API_BASE}/engines/v2?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${yearParam}&limit=50`)
  ]);

  const trimsData = trimsResult.status === 'fulfilled' ? trimsResult.value : null;
  const enginesData = enginesResult.status === 'fulfilled' ? enginesResult.value : null;

  const trims = trimsData && Array.isArray(trimsData.data) ? trimsData.data : [];
  const engines = enginesData && Array.isArray(enginesData.data) ? enginesData.data : [];

  if (trims.length === 0 && engines.length === 0) return null;

  const engineByTrimId = {};
  engines.forEach(engine => {
    engineByTrimId[engine.trim_id] = engine;
  });

  const selectedTrim = trims[0] || null;
  const matchedEngine = selectedTrim && engineByTrimId[selectedTrim.id]
    ? engineByTrimId[selectedTrim.id]
    : (engines[0] || null);

  const engineName = matchedEngine
    ? `${matchedEngine.size ? `${matchedEngine.size}L ` : ''}${matchedEngine.cylinders ? `${matchedEngine.cylinders} ` : ''}${matchedEngine.engine_type || ''}`.trim()
    : 'N/A';

  const fallbackPriceData = await getLocalPriceData();
  const fallbackLocalMsrp = fallbackPriceData && fallbackPriceData[make] && fallbackPriceData[make][model]
    ? fallbackPriceData[make][model].base_msrp
    : null;

  const apiMsrp = selectedTrim && selectedTrim.msrp ? selectedTrim.msrp : null;
  const priceSource = apiMsrp || fallbackLocalMsrp || null;

  return {
    year: year || 'All Years',
    make,
    model,
    source: 'Direct CarAPI',
    trim_name: selectedTrim ? (selectedTrim.trim || 'Base') : 'Base',
    engine: engineName || 'N/A',
    horsepower: matchedEngine && matchedEngine.horsepower_hp ? `${matchedEngine.horsepower_hp} HP` : 'N/A',
    torque: matchedEngine && matchedEngine.torque_ft_lbs ? `${matchedEngine.torque_ft_lbs} lb-ft` : 'N/A',
    fuel_type: matchedEngine && matchedEngine.fuel_type ? matchedEngine.fuel_type : 'N/A',
    transmission: matchedEngine && matchedEngine.transmission ? matchedEngine.transmission : 'N/A',
    drive_type: matchedEngine && matchedEngine.drive_type ? matchedEngine.drive_type : 'N/A',
    cylinders: matchedEngine && matchedEngine.cylinders ? matchedEngine.cylinders : 'N/A',
    estimated_price_inr: formatINR(priceSource),
    msrp_inr: formatINR(apiMsrp || fallbackLocalMsrp),
    depreciation_pct: 'N/A'
  };
}

async function getLocalPriceData() {
  if (localPriceDataCache) return localPriceDataCache;

  try {
    localPriceDataCache = await fetchLocalJSON('/priceData.json');
    return localPriceDataCache;
  } catch (error) {
    try {
      localPriceDataCache = await fetchLocalJSON('priceData.json');
      return localPriceDataCache;
    } catch (nestedError) {
      localPriceDataCache = null;
      return null;
    }
  }
}

async function getLocalModelsForMake(make) {
  if (!make) return [];
  const priceData = await getLocalPriceData();
  if (!priceData || !priceData[make]) return [];

  return Object.keys(priceData[make]).filter(modelName => !modelName.startsWith('_'));
}

async function getLocalMakes() {
  const priceData = await getLocalPriceData();
  if (!priceData) return [];

  return Object.keys(priceData).filter(makeName => !makeName.startsWith('_'));
}

function formatINR(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';
  const INR_RATE = 85;
  return '₹' + Math.round(Number(value) * INR_RATE).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function setStatus(slotIndex, message, isError = false) {
  const status = document.getElementById(`slotStatus${slotIndex}`);
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function createSlotCard(slotIndex) {
  const card = document.createElement('div');
  card.className = 'compare-card';
  card.innerHTML = `
    <h3>Car ${slotIndex + 1}</h3>

    <div class="compare-field">
      <label for="make${slotIndex}">Make</label>
      <select id="make${slotIndex}">
        <option value="">Select Make</option>
      </select>
    </div>

    <div class="compare-field">
      <label for="model${slotIndex}">Model</label>
      <select id="model${slotIndex}" disabled>
        <option value="">Select Model</option>
      </select>
    </div>

    <div class="compare-field">
      <label for="year${slotIndex}">Year (Optional)</label>
      <select id="year${slotIndex}">
        <option value="">All Years</option>
      </select>
    </div>

    <div id="slotStatus${slotIndex}" class="compare-status"></div>
  `;

  return card;
}

async function initSlots() {
  const selectors = document.getElementById('compareSelectors');
  selectors.innerHTML = '';

  for (let index = 0; index < SLOT_COUNT; index += 1) {
    selectors.appendChild(createSlotCard(index));
    attachSlotEvents(index);
  }

  await Promise.all([populateMakes(), populateYears()]);
}

async function populateMakes() {
  let makes = [];

  try {
    const data = await fetchLocalJSON('/api/makes');
    if (data.success && Array.isArray(data.makes) && data.makes.length > 0) {
      makes = data.makes.map(m => m.name);
    }
  } catch (error) {
    makes = [];
  }

  if (makes.length === 0) {
    try {
      makes = await fetchMakesFromDirectApi();
    } catch (error) {
      makes = [];
    }
  }

  if (makes.length === 0) {
    makes = await getLocalMakes();
  }

  if (makes.length === 0) {
    makes = [...POPULAR_MAKES];
  }

  for (let index = 0; index < SLOT_COUNT; index += 1) {
    const makeSelect = document.getElementById(`make${index}`);
    makes.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      makeSelect.appendChild(option);
    });
  }
}

async function populateYears() {
  let years = [];

  try {
    const data = await fetchLocalJSON('/api/years');
    if (data.success && Array.isArray(data.years) && data.years.length > 0) {
      years = data.years;
    }
  } catch (error) {
    years = [];
  }

  if (years.length === 0) {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear + 1; year >= 1995; year -= 1) {
      years.push(year);
    }
  }

  for (let index = 0; index < SLOT_COUNT; index += 1) {
    const yearSelect = document.getElementById(`year${index}`);
    years.forEach(year => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });
  }
}

function attachSlotEvents(slotIndex) {
  const makeSelect = document.getElementById(`make${slotIndex}`);
  const modelSelect = document.getElementById(`model${slotIndex}`);
  const yearSelect = document.getElementById(`year${slotIndex}`);

  makeSelect.addEventListener('change', async () => {
    compareState[slotIndex].make = makeSelect.value;
    compareState[slotIndex].model = '';
    compareState[slotIndex].vehicle = null;

    modelSelect.innerHTML = '<option value="">Select Model</option>';

    if (!makeSelect.value) {
      modelSelect.disabled = true;
      setStatus(slotIndex, '');
      renderComparisonTable();
      return;
    }

    modelSelect.disabled = false;
    setStatus(slotIndex, 'Loading models...');

    try {
      const response = await fetchLocalJSON(`/api/models?make=${encodeURIComponent(makeSelect.value)}`);
      const models = response.success && Array.isArray(response.models)
        ? [...new Set(response.models.map(m => m.name))]
        : [];

      modelSelect.innerHTML = '<option value="">Select Model</option>';
      models.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        modelSelect.appendChild(option);
      });

      setStatus(slotIndex, models.length ? 'Select a model to compare.' : 'No models found for this make.', models.length === 0);
    } catch (error) {
      try {
        const directModels = await fetchModelsFromDirectApi(makeSelect.value);
        modelSelect.innerHTML = '<option value="">Select Model</option>';

        directModels.forEach(name => {
          const option = document.createElement('option');
          option.value = name;
          option.textContent = name;
          modelSelect.appendChild(option);
        });

        if (directModels.length > 0) {
          setStatus(slotIndex, 'Loaded models from direct API.');
        } else {
          const localModels = await getLocalModelsForMake(makeSelect.value);
          modelSelect.innerHTML = '<option value="">Select Model</option>';

          if (localModels.length > 0) {
            localModels.forEach(name => {
              const option = document.createElement('option');
              option.value = name;
              option.textContent = name;
              modelSelect.appendChild(option);
            });
            setStatus(slotIndex, 'Loaded models from local data.');
          } else {
            setStatus(slotIndex, 'Could not load models. Please try another make.', true);
          }
        }
      } catch (nestedError) {
        const localModels = await getLocalModelsForMake(makeSelect.value);
        modelSelect.innerHTML = '<option value="">Select Model</option>';

        if (localModels.length > 0) {
          localModels.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            modelSelect.appendChild(option);
          });
          setStatus(slotIndex, 'Loaded models from local data.');
        } else {
          setStatus(slotIndex, 'Could not load models. Please try another make.', true);
        }
      }
    }

    renderComparisonTable();
  });

  modelSelect.addEventListener('change', async () => {
    compareState[slotIndex].model = modelSelect.value;
    await fetchVehicleForSlot(slotIndex);
  });

  yearSelect.addEventListener('change', async () => {
    compareState[slotIndex].year = yearSelect.value;
    if (compareState[slotIndex].make && compareState[slotIndex].model) {
      await fetchVehicleForSlot(slotIndex);
    }
  });
}

async function fetchVehicleForSlot(slotIndex) {
  const slot = compareState[slotIndex];
  const { make, model, year } = slot;

  if (!make || !model) {
    slot.vehicle = null;
    setStatus(slotIndex, '');
    renderComparisonTable();
    return;
  }

  const yearParam = year ? `&year=${encodeURIComponent(year)}` : '';
  setStatus(slotIndex, 'Fetching from database...');

  try {
    const data = await fetchLocalJSON(`/api/car?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${yearParam}`);
    const normalizedVehicle = normalizeVehicleFromApiResponse(data);
    if (!normalizedVehicle) throw new Error('Database returned incomplete data');
    slot.vehicle = normalizedVehicle;
    setStatus(slotIndex, `Loaded from ${slot.vehicle.source}.`);
  } catch (error) {
    try {
      setStatus(slotIndex, 'Database unavailable, trying direct API...');
      const directVehicle = await fetchVehicleFromDirectApi(make, model, year);
      if (directVehicle) {
        slot.vehicle = directVehicle;
        setStatus(slotIndex, 'Loaded detailed data from direct API.');
      } else {
        throw new Error('Direct API returned no data');
      }
    } catch (nestedError) {
      const priceData = await getLocalPriceData();
      const localMakeData = priceData && priceData[make] ? priceData[make] : null;
      const localModelData = localMakeData && localMakeData[model] ? localMakeData[model] : null;

      if (localModelData) {
        slot.vehicle = {
          year: year || 'All Years',
          make,
          model,
          source: 'Local Database',
          trim_name: 'Base',
          engine: 'N/A',
          horsepower: 'N/A',
          torque: 'N/A',
          fuel_type: 'N/A',
          transmission: 'N/A',
          drive_type: 'N/A',
          cylinders: 'N/A',
          estimated_price_inr: formatINR(localModelData.base_msrp || null),
          msrp_inr: formatINR(localModelData.base_msrp || null),
          depreciation_pct: 'N/A'
        };
        setStatus(slotIndex, 'Loaded basic data from local database.');
      } else {
        slot.vehicle = null;
        setStatus(slotIndex, 'Unable to load specs for this selection.', true);
      }
    }
  }

  renderComparisonTable();
}

function getSelectedVehicles() {
  return compareState
    .map((slot, idx) => ({ ...slot, idx }))
    .filter(slot => slot.vehicle);
}

function valueKey(value) {
  return String(value || 'N/A').trim().toLowerCase();
}

function renderComparisonTable() {
  const placeholder = document.getElementById('comparePlaceholder');
  const tableWrapper = document.getElementById('compareTableWrapper');
  const selected = getSelectedVehicles();

  if (selected.length === 0) {
    placeholder.style.display = 'block';
    tableWrapper.style.display = 'none';
    tableWrapper.innerHTML = '';
    return;
  }

  placeholder.style.display = 'none';

  const rowDiffMap = {};
  SPEC_ROWS.forEach(row => {
    const values = selected.map(item => valueKey(item.vehicle[row.key]));
    rowDiffMap[row.key] = new Set(values).size > 1;
  });

  const headersHTML = selected.map(item => `
    <th class="car-col">
      <span class="car-title">${item.vehicle.make} ${item.vehicle.model}</span>
      <span class="car-subtitle">${item.vehicle.year} • Slot ${item.idx + 1}</span>
    </th>
  `).join('');

  const rowsHTML = SPEC_ROWS.map(row => {
    const rowIsDifferent = rowDiffMap[row.key];

    const cells = selected.map(item => {
      const value = item.vehicle[row.key] || 'N/A';
      return `<td class="${rowIsDifferent ? 'compare-cell-diff' : ''}">${value}</td>`;
    }).join('');

    return `
      <tr>
        <th class="spec-col ${rowIsDifferent ? 'compare-spec-diff' : ''}">${row.label}</th>
        ${cells}
      </tr>
    `;
  }).join('');

  tableWrapper.innerHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th class="spec-col">Specification</th>
          ${headersHTML}
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
    </table>
  `;

  tableWrapper.style.display = 'block';
}

function resetComparison() {
  for (let index = 0; index < SLOT_COUNT; index += 1) {
    compareState[index] = { make: '', model: '', year: '', vehicle: null };

    const make = document.getElementById(`make${index}`);
    const model = document.getElementById(`model${index}`);
    const year = document.getElementById(`year${index}`);

    if (make) make.value = '';
    if (year) year.value = '';
    if (model) {
      model.value = '';
      model.disabled = true;
      model.innerHTML = '<option value="">Select Model</option>';
    }

    setStatus(index, '');
  }

  renderComparisonTable();
}

document.addEventListener('keydown', (event) => {
  if (event.altKey && event.key.toLowerCase() === 't') {
    event.preventDefault();
    toggleTheme();
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  setGlobalLoader(true, 'Preparing comparison tools...');
  await initSlots();
  document.getElementById('resetComparison').addEventListener('click', resetComparison);
  setGlobalLoader(false);
});
