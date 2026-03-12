const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
const revealItems = document.querySelectorAll('.reveal');

const trackGaEvent = (eventName, params = {}) => {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
};

const bindContactClicksTracking = () => {
  const links = document.querySelectorAll('a[href]');
  links.forEach((link) => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (href.includes('wa.me/')) {
      link.addEventListener('click', () => {
        trackGaEvent('click_whatsapp', {
          link_url: link.href,
          page_location: window.location.href
        });
      });
    }
    if (href.includes('t.me/')) {
      link.addEventListener('click', () => {
        trackGaEvent('click_telegram', {
          link_url: link.href,
          page_location: window.location.href
        });
      });
    }
  });
};

bindContactClicksTracking();

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const partnerForm = document.querySelector('.partner-form');

if (partnerForm) {
  const submitButton = partnerForm.querySelector('button[type="submit"]');
  const statusNode = partnerForm.querySelector('.form-status');
  const countryInput = partnerForm.querySelector('input[name="country"]');
  const phoneInput = partnerForm.querySelector('input[name="phone"]');
  const countryDataList = partnerForm.querySelector('#country-options');
  const defaultSubmitText = submitButton ? submitButton.textContent : '';
  const dialCodeCache = new Map();
  const countryCodeCache = new Map();
  let currentPhoneExample = '+1 202 555 0147';
  const COUNTRY_CODES = [
    'AF', 'AL', 'DZ', 'AD', 'AO', 'AG', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB',
    'BY', 'BE', 'BZ', 'BJ', 'BT', 'BO', 'BA', 'BW', 'BR', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH',
    'CM', 'CA', 'CF', 'TD', 'CL', 'CN', 'CO', 'KM', 'CG', 'CD', 'CR', 'CI', 'HR', 'CU', 'CY',
    'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FJ', 'FI',
    'FR', 'GA', 'GM', 'GE', 'DE', 'GH', 'GR', 'GD', 'GT', 'GN', 'GW', 'GY', 'HT', 'HN', 'HU',
    'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT', 'JM', 'JP', 'JO', 'KZ', 'KE', 'KI', 'KP',
    'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MG', 'MW', 'MY',
    'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM',
    'NA', 'NR', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'MK', 'NO', 'OM', 'PK', 'PW', 'PA', 'PG',
    'PY', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RU', 'RW', 'KN', 'LC', 'VC', 'WS', 'SM', 'ST',
    'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'SO', 'ZA', 'SS', 'ES', 'LK', 'SD',
    'SR', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN', 'TR', 'TM',
    'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ', 'VU', 'VA', 'VE', 'VN', 'YE', 'ZM', 'ZW'
  ];

  const phoneExamples = {
    US: '+1 202 555 0147',
    GB: '+44 7700 900123',
    FR: '+33 6 12 34 56 78',
    DE: '+49 1512 3456789',
    ES: '+34 612 34 56 78',
    IT: '+39 312 345 6789',
    TR: '+90 532 123 45 67',
    AE: '+971 50 123 4567',
    EG: '+20 10 1234 5678',
    SA: '+966 55 123 4567',
    IN: '+91 98765 43210',
    BR: '+55 11 91234 5678',
    RU: '+7 912 345 67 89',
    AM: '+374 77 123456',
    CN: '+86 131 2345 6789',
    JP: '+81 90 1234 5678',
    MX: '+52 55 1234 5678',
    CA: '+1 416 555 0100',
    EG: '+20 10 1234 5678'
  };

  const countryAliases = {
    usa: 'US',
    us: 'US',
    america: 'US',
    'united states': 'US',
    uk: 'GB',
    britain: 'GB',
    england: 'GB',
    uae: 'AE',
    emirates: 'AE',
    turkeye: 'TR',
    египет: 'EG',
    россия: 'RU',
    армения: 'AM'
  };

  const normalizeText = (value) =>
    (value || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const displayNames = typeof Intl !== 'undefined' && Intl.DisplayNames
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

  const countryCatalog = COUNTRY_CODES.map((code) => {
    const name = (displayNames && displayNames.of(code)) || code;
    return { code, name, normalized: normalizeText(name) };
  }).sort((a, b) => a.name.localeCompare(b.name));

  if (countryDataList) {
    const fragment = document.createDocumentFragment();
    countryCatalog.forEach((country) => {
      const option = document.createElement('option');
      option.value = country.name;
      fragment.appendChild(option);
    });
    countryDataList.replaceChildren(fragment);
  }

  const getRegionFromBrowser = () => {
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (const lang of langs) {
      if (!lang) continue;
      const parts = lang.split('-');
      if (parts.length > 1 && /^[A-Za-z]{2}$/.test(parts[1])) {
        return parts[1].toUpperCase();
      }
    }
    return 'US';
  };

  const detectCountryCodeSync = (rawCountryValue) => {
    const countryValue = normalizeText(rawCountryValue);
    if (countryValue) {
      if (countryAliases[countryValue]) return countryAliases[countryValue];
      if (/^[a-z]{2}$/.test(countryValue)) return countryValue.toUpperCase();

      const exact = countryCatalog.find((country) => country.normalized === countryValue);
      if (exact) return exact.code;

      const startsWith = countryCatalog.find((country) => country.normalized.startsWith(countryValue));
      if (startsWith) return startsWith.code;
    }
    return '';
  };

  const detectCountryCode = () => {
    const rawValue = countryInput && countryInput.value ? countryInput.value : '';
    const syncCode = detectCountryCodeSync(rawValue);
    if (syncCode) return syncCode;
    return getRegionFromBrowser();
  };

  const resolveCountryCode = async (rawCountryValue) => {
    const syncCode = detectCountryCodeSync(rawCountryValue);
    if (syncCode) return syncCode;

    const normalized = normalizeText(rawCountryValue);
    if (!normalized) return getRegionFromBrowser();
    if (countryCodeCache.has(normalized)) return countryCodeCache.get(normalized);

    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(rawCountryValue)}?fields=cca2`,
        { method: 'GET' }
      );
      if (!response.ok) return getRegionFromBrowser();
      const data = await response.json();
      const code = Array.isArray(data) && data[0] && data[0].cca2 ? String(data[0].cca2).toUpperCase() : getRegionFromBrowser();
      countryCodeCache.set(normalized, code);
      return code;
    } catch (_) {
      return getRegionFromBrowser();
    }
  };

  const getPhoneExample = () => {
    const code = detectCountryCode();
    if (phoneExamples[code]) return phoneExamples[code];
    if (dialCodeCache.has(code)) return `${dialCodeCache.get(code)} 123 456 789`;
    return '+1 202 555 0147';
  };

  const setStatus = (message, state) => {
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.classList.remove('is-loading', 'is-success', 'is-error');
    if (state) statusNode.classList.add(state);
  };

  const setSubmitting = (isSubmitting) => {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? 'Sending...' : defaultSubmitText;
  };

  const fetchDialCode = async (countryCode) => {
    if (!countryCode || dialCodeCache.has(countryCode)) return dialCodeCache.get(countryCode) || null;

    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/alpha/${countryCode}?fields=idd`,
        { method: 'GET' }
      );
      if (!response.ok) return null;
      const data = await response.json();
      const item = Array.isArray(data) ? data[0] : data;
      const root = item && item.idd ? item.idd.root || '' : '';
      const suffixes = item && item.idd && Array.isArray(item.idd.suffixes) ? item.idd.suffixes : [];
      const suffix = suffixes.length ? suffixes[0] : '';
      if (!root) return null;
      const dial = `${root}${suffix}`;
      dialCodeCache.set(countryCode, dial);
      return dial;
    } catch (_) {
      return null;
    }
  };

  const updatePhoneHint = async () => {
    if (!phoneInput) return;
    const rawCountry = countryInput && countryInput.value ? countryInput.value : '';
    const countryCode = await resolveCountryCode(rawCountry);
    let example = phoneExamples[countryCode];
    if (!example) {
      const dial = await fetchDialCode(countryCode);
      if (dial) example = `${dial} 123 456 789`;
    }
    if (!example) example = '+1 202 555 0147';
    currentPhoneExample = example;
    phoneInput.placeholder = example;
    phoneInput.title = `Use digits only, for example ${example}`;
  };

  const validatePayload = (payload) => {
    if (!payload.first_name) return 'Please enter first name.';
    if (!payload.last_name) return 'Please enter last name.';
    if (!payload.email) return 'Please enter email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return 'Please enter a valid email.';
    if (!payload.phone) return 'Please enter phone number.';
    if (!payload.country) return 'Please enter country.';
    if (!payload.program) return 'Please select a partnership program.';
    if (!payload.message) return 'Please enter message.';
    if (!payload.consent) return 'Please accept Terms & Conditions.';

    if (!/^[A-Za-z\u0400-\u04FF' -]{2,50}$/.test(payload.first_name)) {
      return 'Please enter a valid first name.';
    }
    if (!/^[A-Za-z\u0400-\u04FF' -]{2,50}$/.test(payload.last_name)) {
      return 'Please enter a valid last name.';
    }
    if (payload.country.length < 2) return 'Please enter a valid country.';
    if (payload.message.length < 5) return 'Please enter a longer message.';
    const normalizedPhone = payload.phone.replace(/[\s()-]/g, '');
    if (!/^\+?\d{8,15}$/.test(normalizedPhone)) {
      return `Please enter a valid phone number, digits only (example: ${currentPhoneExample || getPhoneExample()}).`;
    }
    return '';
  };

  updatePhoneHint();
  if (countryInput) {
    countryInput.addEventListener('input', updatePhoneHint);
    countryInput.addEventListener('blur', updatePhoneHint);
  }

  partnerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const endpoint = partnerForm.dataset.sheetEndpoint || '';
    if (!endpoint || endpoint.includes('PASTE_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE')) {
      setStatus('Google Sheets endpoint is not configured yet.', 'is-error');
      return;
    }

    const formData = new FormData(partnerForm);
    if ((formData.get('website') || '').toString().trim() !== '') {
      setStatus('Submission ignored.', 'is-success');
      return;
    }

    const payload = {
      submitted_at: new Date().toISOString(),
      page: window.location.href,
      first_name: (formData.get('first_name') || '').toString().trim(),
      last_name: (formData.get('last_name') || '').toString().trim(),
      email: (formData.get('email') || '').toString().trim(),
      phone: (formData.get('phone') || '').toString().trim(),
      country: (formData.get('country') || '').toString().trim(),
      program: (formData.get('program') || '').toString().trim(),
      traffic_source: (formData.get('traffic_source') || '').toString().trim(),
      message: (formData.get('message') || '').toString().trim(),
      consent: Boolean(formData.get('consent')),
      updates_opt_in: Boolean(formData.get('updates_opt_in'))
    };

    const validationError = validatePayload(payload);
    if (validationError) {
      setStatus(validationError, 'is-error');
      if (phoneInput && validationError.toLowerCase().includes('phone')) {
        phoneInput.focus();
      }
      return;
    }

    setSubmitting(true);
    setStatus('Submitting application...', 'is-loading');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      let parsed = null;
      try {
        parsed = await response.json();
      } catch (_) {
        parsed = null;
      }

      if (parsed && parsed.ok === false) {
        throw new Error(parsed.error || 'Sheets endpoint returned an error');
      }

      trackGaEvent('form_sent', {
        form_name: 'partner_form',
        page_location: window.location.href,
        program: payload.program
      });
      setStatus('Your form has been sent. Our manager will contact you soon.', 'is-success');
      partnerForm.reset();
    } catch (error) {
      try {
        // Fallback for Apps Script CORS restrictions from localhost/dev origins.
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(payload)
        });
        trackGaEvent('form_sent', {
          form_name: 'partner_form',
          page_location: window.location.href,
          program: payload.program
        });
        setStatus('Your form has been sent. Our manager will contact you soon.', 'is-success');
        partnerForm.reset();
      } catch (fallbackError) {
        console.error('Form submit error:', error, fallbackError);
        setStatus('Could not send the form. Please try again in a minute.', 'is-error');
      }
    } finally {
      setSubmitting(false);
    }
  });
}
