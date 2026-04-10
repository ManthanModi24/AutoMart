function initHeroSequence() {
  const heroVideo = document.querySelector('.hero-video');
  const heroText = document.querySelector('.hero-text');
  const heroStats = document.querySelector('.hero-stats');

  const TIMELINE = {
    initialPause: 1000,
    textVisibleDuration: 2000,
    textVanishDuration: 1000
  };

  setTimeout(() => {
    heroVideo.play();
  }, TIMELINE.initialPause);

  setTimeout(() => {
    heroText.classList.add('vanish');
    heroStats.classList.add('vanish');
  }, TIMELINE.initialPause + TIMELINE.textVisibleDuration);
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSequence();
});

function toggleTheme() {
  const html = document.documentElement;
  const themeIcon = document.querySelector('.theme-icon');

  if (html.classList.contains('light-mode')) {
    html.classList.remove('light-mode');
    themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.add('light-mode');
    themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'light');
  }
}

function initTheme() {
  const html = document.documentElement;
  const themeIcon = document.querySelector('.theme-icon');
  const savedTheme = localStorage.getItem('theme') || 'dark';

  if (savedTheme === 'light') {
    html.classList.add('light-mode');
    themeIcon.textContent = '☀️';
  } else {
    html.classList.remove('light-mode');
    themeIcon.textContent = '🌙';
  }
}

function animateCounters() {
  const counters = document.querySelectorAll('.counter-value');

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    let current = 0;
    const increment = target / 50;

    const update = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(update);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };

    update();
  });
}

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';

      if (entry.target.classList.contains('counter-card')) {
        animateCounters();
      }

      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

function smoothScroll(e) {
  if (e.target.tagName === 'A' && e.target.hash) {
    e.preventDefault();
    const target = document.querySelector(e.target.hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
  } else {
    navbar.style.boxShadow = 'none';
  }

  lastScroll = currentScroll;
});

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-primary');
    const originalText = btn.textContent;

    btn.textContent = '✓ Message Sent!';
    btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      contactForm.reset();
    }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  document.querySelectorAll('.showcase-card, .feature-card, .vehicle-card, .counter-card, .value-item, .stat-box').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  document.addEventListener('click', smoothScroll);
});

document.addEventListener('keydown', (e) => {
  if (e.altKey && e.key === 't') {
    toggleTheme();
  }
});

const CAR_API_BASE = 'https://carapi.app/api';

const PRICE_DATA = {
  "Toyota":{"Camry":{"base_msrp":28400,"category":"sedan"},"Corolla":{"base_msrp":22050,"category":"sedan"},"RAV4":{"base_msrp":29790,"category":"suv"},"Highlander":{"base_msrp":39520,"category":"suv"},"Tacoma":{"base_msrp":31500,"category":"truck"},"Tundra":{"base_msrp":39965,"category":"truck"},"Prius":{"base_msrp":28545,"category":"sedan"},"Supra":{"base_msrp":44340,"category":"sports"},"4Runner":{"base_msrp":40770,"category":"suv"},"Avalon":{"base_msrp":38340,"category":"sedan"},"C-HR":{"base_msrp":23505,"category":"suv"},"86":{"base_msrp":29300,"category":"sports"},"Sequoia":{"base_msrp":60900,"category":"suv"},"Sienna":{"base_msrp":36890,"category":"van"},"Venza":{"base_msrp":34790,"category":"suv"}},
  "Honda":{"Civic":{"base_msrp":24650,"category":"sedan"},"Accord":{"base_msrp":28990,"category":"sedan"},"CR-V":{"base_msrp":30750,"category":"suv"},"Pilot":{"base_msrp":39150,"category":"suv"},"HR-V":{"base_msrp":24490,"category":"suv"},"Odyssey":{"base_msrp":38410,"category":"van"},"Ridgeline":{"base_msrp":40450,"category":"truck"},"Passport":{"base_msrp":40370,"category":"suv"},"Fit":{"base_msrp":17120,"category":"sedan"},"Insight":{"base_msrp":26790,"category":"sedan"}},
  "Ford":{"F-150":{"base_msrp":36965,"category":"truck"},"Mustang":{"base_msrp":30920,"category":"sports"},"Explorer":{"base_msrp":38355,"category":"suv"},"Escape":{"base_msrp":29900,"category":"suv"},"Ranger":{"base_msrp":32990,"category":"truck"},"Edge":{"base_msrp":38700,"category":"suv"},"Bronco":{"base_msrp":36895,"category":"suv"},"Maverick":{"base_msrp":24190,"category":"truck"},"Expedition":{"base_msrp":58250,"category":"suv"},"Fusion":{"base_msrp":24325,"category":"sedan"}},
  "Chevrolet":{"Silverado":{"base_msrp":37645,"category":"truck"},"Camaro":{"base_msrp":28400,"category":"sports"},"Corvette":{"base_msrp":65900,"category":"sports"},"Equinox":{"base_msrp":28400,"category":"suv"},"Malibu":{"base_msrp":25100,"category":"sedan"},"Tahoe":{"base_msrp":57200,"category":"suv"},"Traverse":{"base_msrp":36100,"category":"suv"},"Blazer":{"base_msrp":37645,"category":"suv"},"Colorado":{"base_msrp":29200,"category":"truck"},"Suburban":{"base_msrp":59500,"category":"suv"}},
  "BMW":{"3 Series":{"base_msrp":44450,"category":"sedan"},"5 Series":{"base_msrp":57200,"category":"sedan"},"X3":{"base_msrp":48150,"category":"suv"},"X5":{"base_msrp":63200,"category":"suv"},"M4":{"base_msrp":76900,"category":"sports"},"7 Series":{"base_msrp":97700,"category":"sedan"},"X1":{"base_msrp":40200,"category":"suv"},"4 Series":{"base_msrp":50600,"category":"sports"},"M3":{"base_msrp":76400,"category":"sports"},"Z4":{"base_msrp":54600,"category":"sports"}},
  "Mercedes-Benz":{"C-Class":{"base_msrp":47800,"category":"sedan"},"E-Class":{"base_msrp":58050,"category":"sedan"},"S-Class":{"base_msrp":117300,"category":"sedan"},"GLC":{"base_msrp":48950,"category":"suv"},"GLE":{"base_msrp":60850,"category":"suv"},"A-Class":{"base_msrp":35500,"category":"sedan"},"CLA":{"base_msrp":40050,"category":"sedan"},"GLA":{"base_msrp":39900,"category":"suv"},"AMG GT":{"base_msrp":141900,"category":"sports"}},
  "Audi":{"A4":{"base_msrp":42000,"category":"sedan"},"A6":{"base_msrp":58900,"category":"sedan"},"Q5":{"base_msrp":46200,"category":"suv"},"Q7":{"base_msrp":59900,"category":"suv"},"A3":{"base_msrp":37400,"category":"sedan"},"Q3":{"base_msrp":39400,"category":"suv"},"A5":{"base_msrp":45900,"category":"sports"},"A8":{"base_msrp":88900,"category":"sedan"},"e-tron GT":{"base_msrp":106500,"category":"sports"},"R8":{"base_msrp":158600,"category":"sports"}},
  "Tesla":{"Model 3":{"base_msrp":40240,"category":"sedan"},"Model Y":{"base_msrp":44990,"category":"suv"},"Model S":{"base_msrp":79990,"category":"sedan"},"Model X":{"base_msrp":84990,"category":"suv"}},
  "Hyundai":{"Elantra":{"base_msrp":22865,"category":"sedan"},"Tucson":{"base_msrp":30285,"category":"suv"},"Sonata":{"base_msrp":28685,"category":"sedan"},"Santa Fe":{"base_msrp":34345,"category":"suv"},"Kona":{"base_msrp":24700,"category":"suv"},"Palisade":{"base_msrp":37500,"category":"suv"},"Ioniq 5":{"base_msrp":42735,"category":"suv"},"Venue":{"base_msrp":20665,"category":"suv"}},
  "Kia":{"Forte":{"base_msrp":20415,"category":"sedan"},"Seltos":{"base_msrp":24490,"category":"suv"},"Sportage":{"base_msrp":30990,"category":"suv"},"Telluride":{"base_msrp":37090,"category":"suv"},"K5":{"base_msrp":28090,"category":"sedan"},"Sorento":{"base_msrp":32890,"category":"suv"},"Soul":{"base_msrp":20690,"category":"suv"},"EV6":{"base_msrp":43350,"category":"suv"}},
  "Nissan":{"Altima":{"base_msrp":28190,"category":"sedan"},"Rogue":{"base_msrp":30290,"category":"suv"},"Sentra":{"base_msrp":21580,"category":"sedan"},"Pathfinder":{"base_msrp":36310,"category":"suv"},"Frontier":{"base_msrp":31280,"category":"truck"},"Maxima":{"base_msrp":38140,"category":"sedan"},"370Z":{"base_msrp":31090,"category":"sports"},"GT-R":{"base_msrp":118990,"category":"sports"},"Kicks":{"base_msrp":21760,"category":"suv"},"Leaf":{"base_msrp":29160,"category":"sedan"}},
  "Subaru":{"Outback":{"base_msrp":30895,"category":"suv"},"Forester":{"base_msrp":33095,"category":"suv"},"Crosstrek":{"base_msrp":26290,"category":"suv"},"Impreza":{"base_msrp":24295,"category":"sedan"},"WRX":{"base_msrp":31235,"category":"sports"},"Legacy":{"base_msrp":25175,"category":"sedan"},"Ascent":{"base_msrp":36395,"category":"suv"},"BRZ":{"base_msrp":30675,"category":"sports"}},
  "Volkswagen":{"Jetta":{"base_msrp":23420,"category":"sedan"},"Tiguan":{"base_msrp":30435,"category":"suv"},"Atlas":{"base_msrp":38275,"category":"suv"},"Golf":{"base_msrp":31790,"category":"sedan"},"Passat":{"base_msrp":24940,"category":"sedan"},"ID.4":{"base_msrp":39735,"category":"suv"},"Taos":{"base_msrp":24790,"category":"suv"}},
  "Mazda":{"Mazda3":{"base_msrp":24070,"category":"sedan"},"CX-5":{"base_msrp":29930,"category":"suv"},"CX-50":{"base_msrp":31240,"category":"suv"},"CX-9":{"base_msrp":39595,"category":"suv"},"MX-5 Miata":{"base_msrp":28975,"category":"sports"},"CX-30":{"base_msrp":24325,"category":"suv"}},
  "Porsche":{"911":{"base_msrp":115300,"category":"sports"},"Cayenne":{"base_msrp":76850,"category":"suv"},"Macan":{"base_msrp":62950,"category":"suv"},"Panamera":{"base_msrp":99400,"category":"sedan"},"Taycan":{"base_msrp":92150,"category":"sports"},"718 Boxster":{"base_msrp":68400,"category":"sports"},"718 Cayman":{"base_msrp":65400,"category":"sports"}},
  "Jeep":{"Wrangler":{"base_msrp":33890,"category":"suv"},"Grand Cherokee":{"base_msrp":40935,"category":"suv"},"Cherokee":{"base_msrp":36295,"category":"suv"},"Compass":{"base_msrp":30895,"category":"suv"},"Gladiator":{"base_msrp":38690,"category":"truck"},"Renegade":{"base_msrp":25640,"category":"suv"}},
  "Dodge":{"Charger":{"base_msrp":33690,"category":"sedan"},"Challenger":{"base_msrp":33595,"category":"sports"},"Durango":{"base_msrp":40995,"category":"suv"},"Hornet":{"base_msrp":33540,"category":"suv"}},
  "Lexus":{"RX":{"base_msrp":50600,"category":"suv"},"ES":{"base_msrp":42490,"category":"sedan"},"NX":{"base_msrp":42125,"category":"suv"},"IS":{"base_msrp":41450,"category":"sedan"},"GX":{"base_msrp":65415,"category":"suv"},"LC":{"base_msrp":99600,"category":"sports"},"LS":{"base_msrp":80600,"category":"sedan"},"RC":{"base_msrp":45750,"category":"sports"}},
  "Volvo":{"XC90":{"base_msrp":58645,"category":"suv"},"XC60":{"base_msrp":45550,"category":"suv"},"XC40":{"base_msrp":39700,"category":"suv"},"S60":{"base_msrp":42550,"category":"sedan"},"S90":{"base_msrp":56695,"category":"sedan"}},
  "Ferrari":{"812 GTS":{"base_msrp":363730,"category":"sports"},"812 Superfast":{"base_msrp":340000,"category":"sports"},"SF90 Stradale":{"base_msrp":524815,"category":"sports"},"F8 Tributo":{"base_msrp":280000,"category":"sports"},"Roma":{"base_msrp":222620,"category":"sports"},"296 GTB":{"base_msrp":352000,"category":"sports"},"Portofino M":{"base_msrp":245000,"category":"sports"},"488 GTB":{"base_msrp":262647,"category":"sports"},"LaFerrari":{"base_msrp":1416362,"category":"sports"}},
  "Lamborghini":{"Huracán":{"base_msrp":208571,"category":"sports"},"Aventador":{"base_msrp":417826,"category":"sports"},"Urus":{"base_msrp":225000,"category":"suv"},"Revuelto":{"base_msrp":608358,"category":"sports"}},
  "Bugatti":{"Chiron":{"base_msrp":3000000,"category":"sports"},"Divo":{"base_msrp":5800000,"category":"sports"},"Veyron":{"base_msrp":1700000,"category":"sports"},"Centodieci":{"base_msrp":9000000,"category":"sports"},"Bolide":{"base_msrp":4700000,"category":"sports"},"Mistral":{"base_msrp":5000000,"category":"sports"}},
  "McLaren":{"720S":{"base_msrp":299000,"category":"sports"},"765LT":{"base_msrp":382500,"category":"sports"},"Artura":{"base_msrp":237500,"category":"sports"},"GT":{"base_msrp":210000,"category":"sports"}},
  "_defaults":{"sedan":{"base_msrp":30000},"suv":{"base_msrp":38000},"truck":{"base_msrp":35000},"sports":{"base_msrp":50000},"van":{"base_msrp":35000},"luxury_sedan":{"base_msrp":55000},"luxury_suv":{"base_msrp":70000},"unknown":{"base_msrp":32000}},
  "_luxury_brands":["BMW","Mercedes-Benz","Audi","Lexus","Porsche","Volvo","Jaguar","Land Rover","Maserati","Bentley","Rolls-Royce","Ferrari","Lamborghini","McLaren","Aston Martin","Genesis","Infiniti","Acura","Lincoln","Cadillac","Alfa Romeo","Lotus","Bugatti","Pagani","Tesla"]
};

// Hardcoded specs for exotic/hypercar models where the API returns N/A
const KNOWN_SPECS = {
  "Ferrari": {
    "812 GTS":       { engine: "6.5L V12", horsepower: "789 HP", torque: "530 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: "12" },
    "812 Superfast":  { engine: "6.5L V12", horsepower: "789 HP", torque: "530 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: "12" },
    "SF90 Stradale": { engine: "4.0L Twin-Turbo V8 Hybrid", horsepower: "986 HP", torque: "590 lb-ft", fuel_type: "Hybrid", transmission: "8-Speed Dual-Clutch", drive_type: "AWD", cylinders: "8" },
    "F8 Tributo":    { engine: "3.9L Twin-Turbo V8", horsepower: "710 HP", torque: "568 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: "8" },
    "Roma":          { engine: "3.9L Twin-Turbo V8", horsepower: "612 HP", torque: "561 lb-ft", fuel_type: "Gasoline", transmission: "8-Speed Dual-Clutch", drive_type: "RWD", cylinders: "8" },
    "296 GTB":       { engine: "3.0L Twin-Turbo V6 Hybrid", horsepower: "819 HP", torque: "546 lb-ft", fuel_type: "Hybrid", transmission: "8-Speed Dual-Clutch", drive_type: "RWD", cylinders: "6" },
    "Portofino M":   { engine: "3.9L Twin-Turbo V8", horsepower: "612 HP", torque: "561 lb-ft", fuel_type: "Gasoline", transmission: "8-Speed Dual-Clutch", drive_type: "RWD", cylinders: "8" },
    "488 GTB":       { engine: "3.9L Twin-Turbo V8", horsepower: "661 HP", torque: "561 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: "8" },
    "LaFerrari":     { engine: "6.3L V12 Hybrid", horsepower: "950 HP", torque: "664 lb-ft", fuel_type: "Hybrid", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: "12" }
  },
  "Bugatti": {
    "Chiron":        { engine: "8.0L Quad-Turbo W16", horsepower: "1,479 HP", torque: "1,180 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: "16" },
    "Divo":          { engine: "8.0L Quad-Turbo W16", horsepower: "1,500 HP", torque: "1,180 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: "16" },
    "Veyron":        { engine: "8.0L Quad-Turbo W16", horsepower: "1,001 HP", torque: "922 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: "16" },
    "Centodieci":    { engine: "8.0L Quad-Turbo W16", horsepower: "1,577 HP", torque: "1,180 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: "16" },
    "Bolide":        { engine: "8.0L Quad-Turbo W16", horsepower: "1,824 HP", torque: "1,364 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: "16" },
    "Mistral":       { engine: "8.0L Quad-Turbo W16", horsepower: "1,577 HP", torque: "1,180 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: "16" }
  },
  "Lamborghini": {
    "Huracán":       { engine: "5.2L V10", horsepower: "631 HP", torque: "417 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "AWD", cylinders: "10" },
    "Aventador":     { engine: "6.5L V12", horsepower: "769 HP", torque: "531 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed ISR", drive_type: "AWD", cylinders: "12" },
    "Urus":          { engine: "4.0L Twin-Turbo V8", horsepower: "657 HP", torque: "627 lb-ft", fuel_type: "Gasoline", transmission: "8-Speed Automatic", drive_type: "AWD", cylinders: "8" },
    "Revuelto":      { engine: "6.5L V12 Hybrid", horsepower: "1,001 HP", torque: "535 lb-ft", fuel_type: "Hybrid", transmission: "8-Speed Dual-Clutch", drive_type: "AWD", cylinders: "12" }
  },
  "McLaren": {
    "720S":          { engine: "4.0L Twin-Turbo V8", horsepower: "710 HP", torque: "568 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: "8" },
    "765LT":         { engine: "4.0L Twin-Turbo V8", horsepower: "755 HP", torque: "590 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: "8" },
    "Artura":        { engine: "3.0L Twin-Turbo V6 Hybrid", horsepower: "671 HP", torque: "531 lb-ft", fuel_type: "Hybrid", transmission: "8-Speed Dual-Clutch", drive_type: "RWD", cylinders: "6" },
    "GT":            { engine: "4.0L Twin-Turbo V8", horsepower: "612 HP", torque: "465 lb-ft", fuel_type: "Gasoline", transmission: "7-Speed Dual-Clutch", drive_type: "RWD", cylinders: "8" }
  }
};

const CORS_PROXY = 'https://corsproxy.io/?';

async function fetchLocalJSON(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Server returned ${response.status}: ${text}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function getLocalModelsForMake(make) {
  if (!make || !PRICE_DATA[make]) return [];
  return Object.keys(PRICE_DATA[make]).filter(key => !key.startsWith('_'));
}

async function fetchJSON(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const proxiedUrl = CORS_PROXY + encodeURIComponent(url);
    const response = await fetch(proxiedUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`API returned ${response.status}: ${text}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function estimatePrice(make, model, year, apiMsrp, category) {
  const currentYear = new Date().getFullYear();
  const vehicleAge = Math.max(0, currentYear - year);

  let baseMsrp = apiMsrp || null;
  let priceMethod = 'carapi_msrp';

  if (!baseMsrp || baseMsrp <= 0) {
    const makeData = PRICE_DATA[make];
    if (makeData && makeData[model]) {
      baseMsrp = makeData[model].base_msrp;
      category = category || makeData[model].category;
      priceMethod = 'local_msrp';
    }
  }

  if (!baseMsrp || baseMsrp <= 0) {
    const isLuxury = PRICE_DATA._luxury_brands && PRICE_DATA._luxury_brands.includes(make);
    let defaultKey = category || 'unknown';
    if (isLuxury && defaultKey === 'sedan') defaultKey = 'luxury_sedan';
    if (isLuxury && defaultKey === 'suv') defaultKey = 'luxury_suv';

    baseMsrp = (PRICE_DATA._defaults[defaultKey] && PRICE_DATA._defaults[defaultKey].base_msrp) || 32000;
    priceMethod = 'estimated_default';
  }

  let depreciationRate = 0;

  if (vehicleAge === 0) {
    depreciationRate = 0;
  } else if (vehicleAge === 1) {
    depreciationRate = 0.20;
  } else if (vehicleAge === 2) {
    depreciationRate = 0.35;
  } else {
    depreciationRate = 0.35 + ((vehicleAge - 2) * 0.10);
    depreciationRate = Math.min(depreciationRate, 0.90);
  }

  let categoryMultiplier = 1.0;
  const isLuxury = PRICE_DATA._luxury_brands && PRICE_DATA._luxury_brands.includes(make);

  if (category === 'truck') categoryMultiplier = 1.05;
  if (category === 'suv') categoryMultiplier = 1.02;
  if (category === 'sports') categoryMultiplier = 0.92;
  if (isLuxury) categoryMultiplier *= 0.97;

  let estimatedPrice = baseMsrp * (1 - depreciationRate) * categoryMultiplier;
  estimatedPrice = Math.max(estimatedPrice, baseMsrp * 0.10);
  estimatedPrice = Math.round(estimatedPrice / 100) * 100;

  return {
    estimated_price: estimatedPrice,
    msrp: Math.round(baseMsrp),
    depreciation_pct: Math.round(depreciationRate * 100),
    vehicle_age: vehicleAge,
    method: priceMethod
  };
}

const POPULAR_MAKES = [
  'Acura','Alfa Romeo','Aston Martin','Audi','Bentley','BMW','Buick',
  'Cadillac','Chevrolet','Chrysler','Dodge','Ferrari','Fiat','Ford',
  'Genesis','GMC','Honda','Hyundai','Infiniti','Jaguar','Jeep','Kia',
  'Lamborghini','Land Rover','Lexus','Lincoln','Lotus','Maserati','Mazda',
  'McLaren','Mercedes-Benz','Mini','Mitsubishi','Nissan','Porsche','Ram',
  'Rolls-Royce','Subaru','Tesla','Toyota','Volkswagen','Volvo'
];

async function initCarSearch() {
  const makeSelect = document.getElementById('searchMake');
  const modelSelect = document.getElementById('searchModel');
  const yearSelect = document.getElementById('searchYear');
  const form = document.getElementById('carSearchForm');

  if (!makeSelect || !form) return;

  try {
    const data = await fetchLocalJSON('/api/makes');
    if (data.success && Array.isArray(data.makes) && data.makes.length > 0) {
      data.makes.forEach(make => {
        const opt = document.createElement('option');
        opt.value = make.name;
        opt.textContent = make.name;
        makeSelect.appendChild(opt);
      });
    } else {
      throw new Error('Empty response');
    }
  } catch (e) {
    POPULAR_MAKES.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      makeSelect.appendChild(opt);
    });
  }

  try {
    const data = await fetchLocalJSON('/api/years');
    if (data.success && Array.isArray(data.years)) {
      data.years.forEach(year => {
        const opt = document.createElement('option');
        opt.value = year;
        opt.textContent = year;
        yearSelect.appendChild(opt);
      });
    } else {
      throw new Error('Invalid response');
    }
  } catch (e) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear + 1; y >= 1995; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }
  }

  makeSelect.addEventListener('change', async () => {
    const make = makeSelect.value;
    const year = yearSelect.value;

    modelSelect.innerHTML = '<option value="">Select Model</option>';

    if (!make) {
      modelSelect.disabled = true;
      return;
    }

    modelSelect.disabled = false;
    modelSelect.innerHTML = '<option value="">Loading models...</option>';

    try {
      let url = `/api/models?make=${encodeURIComponent(make)}`;
      if (year) url += `&year=${year}`;

      const data = await fetchLocalJSON(url);

      modelSelect.innerHTML = '<option value="">Select Model</option>';
      if (data.success && Array.isArray(data.models) && data.models.length > 0) {
        const unique = [...new Map(data.models.map(m => [m.name, m])).values()];
        unique.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.name;
          opt.textContent = m.name;
          modelSelect.appendChild(opt);
        });
      } else {
        modelSelect.innerHTML = '<option value="">No models found</option>';
      }
    } catch (e) {
      const localModels = getLocalModelsForMake(make);
      if (localModels.length > 0) {
        modelSelect.innerHTML = '<option value="">Select Model</option>';
        localModels.forEach(name => {
          const opt = document.createElement('option');
          opt.value = name;
          opt.textContent = name;
          modelSelect.appendChild(opt);
        });
      } else {
        modelSelect.innerHTML = '<option value="">Error loading models</option>';
      }
    }
  });

  yearSelect.addEventListener('change', () => {
    if (makeSelect.value) {
      makeSelect.dispatchEvent(new Event('change'));
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await searchCar();
  });
}

async function searchCar() {
  const make = document.getElementById('searchMake').value;
  const model = document.getElementById('searchModel').value;
  const year = document.getElementById('searchYear').value;
  const resultsDiv = document.getElementById('searchResults');
  const errorDiv = document.getElementById('searchError');
  const btnText = document.querySelector('.search-btn-text');
  const btnLoader = document.querySelector('.search-btn-loader');
  const searchBtn = document.getElementById('searchBtn');

  resultsDiv.style.display = 'none';
  errorDiv.style.display = 'none';

  if (!make || !model) {
    showSearchError('Missing Fields', 'Please select a make and model before searching.');
    return;
  }

  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-flex';
  searchBtn.disabled = true;

  try {
    let yearNum = null;
    if (year) {
      yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 1995 || yearNum > new Date().getFullYear() + 2) {
        showSearchError('Invalid Year', `Year must be between 1995 and ${new Date().getFullYear() + 2}.`);
        return;
      }
    }

    const yearParam = yearNum ? `&year=${yearNum}` : '';

    const [trimsResult, enginesResult] = await Promise.allSettled([
      fetchJSON(`${CAR_API_BASE}/trims/v2?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${yearParam}&limit=50`),
      fetchJSON(`${CAR_API_BASE}/engines/v2?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}${yearParam}&limit=50`)
    ]);

    const trimsData = trimsResult.status === 'fulfilled' ? trimsResult.value : null;
    const enginesData = enginesResult.status === 'fulfilled' ? enginesResult.value : null;

    const hasTrims = trimsData && trimsData.data && trimsData.data.length > 0;
    const hasEngines = enginesData && enginesData.data && enginesData.data.length > 0;

    if (!hasTrims && !hasEngines) {
      // Fallback: check if we have hardcoded specs for this exotic car
      const fallbackSpec = (KNOWN_SPECS[make] && KNOWN_SPECS[make][model]) || null;
      const fallbackPrice = (PRICE_DATA[make] && PRICE_DATA[make][model]) || null;

      if (fallbackSpec || fallbackPrice) {
        const trimYear = yearNum || new Date().getFullYear();
        const pricing = estimatePrice(make, model, trimYear, null, 'sports');

        const syntheticTrim = {
          trim_name: 'Base',
          submodel: fallbackSpec ? null : null,
          description: 'N/A',
          engine: fallbackSpec ? fallbackSpec.engine : 'N/A',
          fuel_type: fallbackSpec ? fallbackSpec.fuel_type : 'N/A',
          horsepower: fallbackSpec ? fallbackSpec.horsepower : 'N/A',
          torque: fallbackSpec ? fallbackSpec.torque : 'N/A',
          transmission: fallbackSpec ? fallbackSpec.transmission : 'N/A',
          drive_type: fallbackSpec ? fallbackSpec.drive_type : 'N/A',
          cylinders: fallbackSpec ? fallbackSpec.cylinders : 'N/A',
          msrp: pricing ? pricing.msrp : null,
          estimated_price: pricing ? pricing.estimated_price : null,
          depreciation_pct: pricing ? pricing.depreciation_pct : null,
          price_method: pricing ? pricing.method : null
        };

        displayCarResults({
          year: yearNum || 'All Years',
          make: make,
          model: model,
          total_trims: 1,
          trims: [syntheticTrim],
          source: 'AutoMart Database'
        });
        return;
      }

      showSearchError(
        `No Results for ${yearNum ? yearNum + ' ' : ''}${make} ${model}`,
        'No data found for this vehicle.',
        'Check your spelling or try: Toyota Camry 2020'
      );
      return;
    }

    const engineMap = {};
    if (hasEngines) {
      enginesData.data.forEach(eng => {
        engineMap[eng.trim_id] = {
          engine_type: eng.engine_type || 'N/A',
          fuel_type: eng.fuel_type || 'N/A',
          cylinders: eng.cylinders || 'N/A',
          displacement: eng.size ? `${eng.size}L` : 'N/A',
          horsepower: eng.horsepower_hp || null,
          torque: eng.torque_ft_lbs || null,
          drive_type: eng.drive_type || 'N/A',
          transmission: eng.transmission || 'N/A'
        };
      });
    }

    let trims = [];

    // Get fallback specs for exotic cars from KNOWN_SPECS
    const knownSpec = (KNOWN_SPECS[make] && KNOWN_SPECS[make][model]) || null;

    if (hasTrims) {
      trims = trimsData.data.map(trim => {
        const engine = engineMap[trim.id] || {};

        const desc = (trim.description || '').toLowerCase();
        let category = null;
        if (desc.includes('sedan')) category = 'sedan';
        else if (desc.includes('suv')) category = 'suv';
        else if (desc.includes('truck') || desc.includes('cab')) category = 'truck';
        else if (desc.includes('coupe') || desc.includes('convertible')) category = 'sports';
        else if (desc.includes('van')) category = 'van';

        // For exotic cars, use KNOWN_SPECS as category fallback
        if (!category && knownSpec) category = 'sports';

        const hasRealMsrp = trim.msrp && trim.msrp > 0;
        const trimYear = trim.year || yearNum || new Date().getFullYear();
        const pricing = hasRealMsrp
          ? estimatePrice(make, model, trimYear, trim.msrp, category)
          : estimatePrice(make, model, trimYear, null, category);

        // Build engine display — prefer API data, fallback to KNOWN_SPECS
        const rawEngine = engine.displacement && engine.displacement !== 'N/A'
          ? `${engine.displacement} ${engine.cylinders || ''} ${engine.engine_type || ''}`.trim()
          : (engine.engine_type && engine.engine_type !== 'N/A' ? engine.engine_type : null);

        return {
          trim_name: trim.trim || 'Base',
          submodel: trim.submodel || null,
          description: trim.description || 'N/A',
          engine: rawEngine || (knownSpec ? knownSpec.engine : 'N/A'),
          fuel_type: (engine.fuel_type && engine.fuel_type !== 'N/A') ? engine.fuel_type : (knownSpec ? knownSpec.fuel_type : 'N/A'),
          horsepower: engine.horsepower ? `${engine.horsepower} HP` : (knownSpec ? knownSpec.horsepower : 'N/A'),
          torque: engine.torque ? `${engine.torque} lb-ft` : (knownSpec ? knownSpec.torque : 'N/A'),
          transmission: (engine.transmission && engine.transmission !== 'N/A') ? engine.transmission : (knownSpec ? knownSpec.transmission : 'N/A'),
          drive_type: (engine.drive_type && engine.drive_type !== 'N/A') ? engine.drive_type : (knownSpec ? knownSpec.drive_type : 'N/A'),
          cylinders: (engine.cylinders && engine.cylinders !== 'N/A') ? engine.cylinders : (knownSpec ? knownSpec.cylinders : 'N/A'),
          msrp: pricing ? pricing.msrp : null,
          estimated_price: pricing ? pricing.estimated_price : null,
          depreciation_pct: pricing ? pricing.depreciation_pct : null,
          price_method: pricing ? pricing.method : null
        };
      });
    } else if (hasEngines) {
      trims = enginesData.data.map(eng => ({
        trim_name: eng.trim || 'Base',
        submodel: eng.submodel || null,
        description: eng.trim_description || 'N/A',
        engine: eng.size ? `${eng.size}L ${eng.cylinders || ''} ${eng.engine_type || ''}`.trim() : 'N/A',
        fuel_type: eng.fuel_type || 'N/A',
        horsepower: eng.horsepower_hp ? `${eng.horsepower_hp} HP` : 'N/A',
        torque: eng.torque_ft_lbs ? `${eng.torque_ft_lbs} lb-ft` : 'N/A',
        transmission: eng.transmission || 'N/A',
        drive_type: eng.drive_type || 'N/A',
        cylinders: eng.cylinders || 'N/A',
        msrp: null,
        estimated_price: null,
        depreciation_pct: null,
        price_method: null
      }));
    }

    const seen = new Set();
    trims = trims.filter(t => {
      const key = `${t.trim_name}|${t.description}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    displayCarResults({
      year: yearNum || 'All Years',
      make: make,
      model: model,
      total_trims: trims.length,
      trims: trims,
      source: 'CarAPI.app'
    });

  } catch (e) {
    showSearchError(
      'Connection Error',
      'Failed to connect to CarAPI. The service may be temporarily unavailable.',
      'Try again in a moment or check your internet connection.'
    );
  } finally {
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    searchBtn.disabled = false;
  }
}

function displayCarResults(vehicle) {
  const resultsDiv = document.getElementById('searchResults');
  const errorDiv = document.getElementById('searchError');
  errorDiv.style.display = 'none';

  let trimsHTML = '';

  if (vehicle.trims && vehicle.trims.length > 0) {
    trimsHTML = vehicle.trims.map((trim, i) => {
      const USD_TO_INR = 85;
      const fmtUSD = (v) => v ? '$' + Number(v).toLocaleString('en-US') : null;
      const fmtINR = (v) => v ? '₹' + Math.round(Number(v) * USD_TO_INR).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : null;

      const hasPrice = trim.estimated_price && trim.msrp;
      let priceSectionHTML = '';
      if (hasPrice) {
        const methodLabels = {
          carapi_msrp: '✓ MSRP Verified',
          local_msrp: '≈ Estimated (Local)',
          estimated_default: '≈ Rough Estimate'
        };
        const methodLabel = methodLabels[trim.price_method] || 'Estimated';
        const methodClass = trim.price_method === 'carapi_msrp' ? 'badge-verified' : 'badge-unverified';
        priceSectionHTML = `
          <div class="trim-price-section">
            <div class="estimated-price">${fmtUSD(trim.estimated_price)}</div>
            <div class="estimated-price-inr">${fmtINR(trim.estimated_price)}</div>
            <div class="price-details">
              <span class="msrp-label">MSRP: ${fmtUSD(trim.msrp)} / ${fmtINR(trim.msrp)}</span>
            </div>
            <span class="results-badge ${methodClass}">${methodLabel}</span>
          </div>`;
      }

      return `
      <div class="trim-card" style="animation-delay: ${i * 0.08}s">
        <div class="trim-card-header">
          <h4>${trim.trim_name || 'Standard'}</h4>
          <span class="trim-number">Trim ${i + 1}</span>
        </div>

        ${priceSectionHTML}

        <div class="spec-grid">
          <div class="spec-item">
            <span class="spec-label">Engine</span>
            <span class="spec-value highlight">${trim.engine || 'N/A'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Horsepower</span>
            <span class="spec-value highlight">${trim.horsepower || 'N/A'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Torque</span>
            <span class="spec-value">${trim.torque || 'N/A'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Fuel Type</span>
            <span class="spec-value">${trim.fuel_type || 'N/A'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Transmission</span>
            <span class="spec-value">${trim.transmission || 'N/A'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Drive Type</span>
            <span class="spec-value">${trim.drive_type || 'N/A'}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Cylinders</span>
            <span class="spec-value">${trim.cylinders || 'N/A'}</span>
          </div>
          ${trim.submodel ? `
          <div class="spec-item">
            <span class="spec-label">Submodel</span>
            <span class="spec-value">${trim.submodel}</span>
          </div>` : ''}
        </div>

        ${trim.description && trim.description !== 'N/A' ? `
        <div class="trim-description">${trim.description}</div>` : ''}
      </div>
    `}).join('');
  } else {
    trimsHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>Limited Data Available</h3>
        <p>The vehicle was found but detailed trim/spec data is not available for this combination.</p>
      </div>
    `;
  }

  resultsDiv.innerHTML = `
    <div class="results-header">
      <h3>
        <span>${vehicle.year} ${vehicle.make} ${vehicle.model}</span>
      </h3>
      <div class="results-meta">
        ${vehicle.total_trims > 0 ? vehicle.total_trims + ' trim(s) found' : 'Model verified'} &bull; Source: ${vehicle.source}
      </div>
    </div>
    <div class="trims-grid">
      ${trimsHTML}
    </div>
  `;

  resultsDiv.style.display = 'block';
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showSearchError(title, message, suggestion) {
  const errorDiv = document.getElementById('searchError');
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.style.display = 'none';

  errorDiv.innerHTML = `
    <div class="error-title">⚠ ${title}</div>
    <div class="error-message">${message}</div>
    ${suggestion ? `<div class="error-suggestion">💡 ${suggestion}</div>` : ''}
  `;
  errorDiv.style.display = 'block';
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.addEventListener('DOMContentLoaded', () => {
  initCarSearch();
});
