const dailyCache = new Map();

const INTERNAL_API_ENDPOINT = '/api/zmanim';

function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function normalizeToHms(rawValue) {
  if (!rawValue) {
    return null;
  }

  if (rawValue instanceof Date && !Number.isNaN(rawValue.getTime())) {
    return `${pad2(rawValue.getHours())}:${pad2(rawValue.getMinutes())}:${pad2(rawValue.getSeconds())}`;
  }

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    const totalSeconds = Math.floor(rawValue);
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }

  const value = String(rawValue).trim();

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    const [h, m, s = '00'] = value.split(':');
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return `${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}:${pad2(parsed.getSeconds())}`;
  }

  return null;
}

function extractCandidateValue(source, possibleKeys) {
  if (!source || typeof source !== 'object') {
    return null;
  }

  for (const key of possibleKeys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key]) {
      return source[key];
    }
  }

  for (const value of Object.values(source)) {
    if (value && typeof value === 'object') {
      const nested = extractCandidateValue(value, possibleKeys);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function normalizeZmanimPayload(payload) {
  const sunriseRaw = extractCandidateValue(payload, ['sunrise', 'זריחה']);
  const sunsetRaw = extractCandidateValue(payload, ['sunset', 'שקיעה']);
  const netzClean25Raw = extractCandidateValue(payload, [
    'netz_clean_25km',
    'netzClean25km',
    'הנץ בניקוי 25 ק"מ',
    'הנץ בניקוי 25 קמ',
    'הנץ_בניקוי_25_קמ'
  ]);

  return {
    sunrise: normalizeToHms(sunriseRaw),
    sunset: normalizeToHms(sunsetRaw),
    netzClean25km: normalizeToHms(netzClean25Raw)
  };
}

export async function getDailyZmanim(date = new Date()) {
  const dateKey = toDateKey(date);

  if (dailyCache.has(dateKey)) {
    return dailyCache.get(dateKey);
  }

  const response = await fetch(`${INTERNAL_API_ENDPOINT}?date=${encodeURIComponent(dateKey)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch zmanim: ${response.status}`);
  }

  const payload = await response.json();
  const normalized = normalizeZmanimPayload(payload);

  if (!normalized.sunrise || !normalized.sunset || !normalized.netzClean25km) {
    throw new Error('Missing expected zmanim fields in source payload');
  }

  dailyCache.set(dateKey, normalized);
  return normalized;
}

export function clearZmanimCache() {
  dailyCache.clear();
}
