diff --git a/script.js b/script.js
index 3e58a4c3041783e91a30e3c60b05e582b4eb4379..fcc09cbf8fd221a2f36c6609203c6a5b6a190b03 100644
--- a/script.js
+++ b/script.js
@@ -1,31 +1,216 @@
-// script.js
-
-// Function to get the current time in a formatted string
-function getCurrentTime() {
-    const now = new Date();
-    return now.toUTCString();
-}
-
-// Function to convert Gregorian date to Hebrew calendar date
-function gregorianToHebrew(year, month, day) {
-    // Simple Hebrew calendar conversion logic (this should be replaced with proper library usage)
-    const hebrewMonths = ["Tishrei", "Cheshvan", "Kislev", "Tevet", "Shevat", "Adar", "Nisan", "Iyar", "Sivan", "Tammuz", "Av", "Elul"];
-    const hebrewYear = year + 5778; // This is a simplification
-    const hebrewMonth = hebrewMonths[month - 1];
-    return `${hebrewDay} ${hebrewMonth} ${hebrewYear}`;
-}
-
-// Function to fetch sunrise and sunset data
-async function fetchSunriseSunset(lat, long) {
-    const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${long}&formatted=0`);
-    const data = await response.json();
-    return {
-        sunrise: data.results.sunrise,
-        sunset: data.results.sunset
+const SETTINGS_KEY = 'synagogueClockSettings-v1';
+
+const el = {
+  clock: document.getElementById('clock'),
+  gregorianDate: document.getElementById('gregorianDate'),
+  hebrewDate: document.getElementById('hebrewDate'),
+  sunrise: document.getElementById('sunrise'),
+  sunset: document.getElementById('sunset'),
+  timerSection: document.getElementById('timerSection'),
+  timerCountdown: document.getElementById('timerCountdown'),
+  netzLabel: document.getElementById('netzLabel'),
+  status: document.getElementById('status'),
+  settingsDialog: document.getElementById('settingsDialog'),
+  openSettings: document.getElementById('openSettings'),
+  settingsForm: document.getElementById('settingsForm'),
+  cancelSettings: document.getElementById('cancelSettings'),
+  resetSettings: document.getElementById('resetSettings'),
+  minutesBeforeNetz: document.getElementById('minutesBeforeNetz')
+};
+
+let settings = loadSettings();
+let todayZmanim = null;
+let zmanimDateKey = '';
+
+function loadSettings() {
+  const stored = localStorage.getItem(SETTINGS_KEY);
+  if (!stored) return { ...DEFAULT_CONFIG };
+  try {
+    const parsed = JSON.parse(stored);
+    return { ...DEFAULT_CONFIG, ...parsed };
+  } catch {
+    return { ...DEFAULT_CONFIG };
+  }
+}
+
+function saveSettings() {
+  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
+}
+
+function fmt2(n) {
+  return String(n).padStart(2, '0');
+}
+
+function toHms(date) {
+  return `${fmt2(date.getHours())}:${fmt2(date.getMinutes())}:${fmt2(date.getSeconds())}`;
+}
+
+function parseTimeToDate(baseDate, hhmmss) {
+  const [h = 0, m = 0, s = 0] = hhmmss.split(':').map(Number);
+  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), h, m, s, 0);
+}
+
+function formatDiff(ms) {
+  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
+  const h = Math.floor(totalSeconds / 3600);
+  const m = Math.floor((totalSeconds % 3600) / 60);
+  const s = totalSeconds % 60;
+  return `${fmt2(h)}:${fmt2(m)}:${fmt2(s)}`;
+}
+
+function dateKey(d) {
+  return `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())}`;
+}
+
+function parseZmanimFromHtml(html) {
+  const clean = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
+  const lines = clean.split(/\n+/).map((line) => line.trim()).filter(Boolean);
+
+  const findTimeInLine = (line) => {
+    const match = line.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
+    if (!match) return null;
+    const parts = match[1].split(':');
+    if (parts.length === 2) parts.push('00');
+    return parts.map((p) => fmt2(Number(p))).join(':');
+  };
+
+  let sunrise;
+  let sunset;
+  let netz;
+
+  for (const line of lines) {
+    if (!sunrise && /זריחה/.test(line)) sunrise = findTimeInLine(line);
+    if (!sunset && /שקיעה/.test(line)) sunset = findTimeInLine(line);
+    if (!netz && /הנץ/.test(line) && /25/.test(line)) netz = findTimeInLine(line);
+  }
+
+  if (!netz) {
+    const bigRegex = /הנץ[^\n]{0,80}?25[^\n]{0,80}?(\d{1,2}:\d{2}(?::\d{2})?)/;
+    const match = clean.match(bigRegex);
+    if (match) {
+      const parts = match[1].split(':');
+      if (parts.length === 2) parts.push('00');
+      netz = parts.map((p) => fmt2(Number(p))).join(':');
+    }
+  }
+
+  return { sunrise, sunset, netz };
+}
+
+async function fetchFromSources() {
+  const target = DEFAULT_CONFIG.itimUrl;
+  const sources = [
+    target,
+    `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
+    `https://r.jina.ai/http://${target.replace(/^https?:\/\//, '')}`
+  ];
+
+  for (const source of sources) {
+    try {
+      const res = await fetch(source, { cache: 'no-store' });
+      if (!res.ok) continue;
+      const text = await res.text();
+      if (!text || text.length < 200) continue;
+      const parsed = parseZmanimFromHtml(text);
+      if (parsed.sunrise && parsed.sunset && parsed.netz) {
+        return { ...parsed, source };
+      }
+    } catch {
+      // continue
+    }
+  }
+  return null;
+}
+
+async function ensureTodayZmanim() {
+  const now = new Date();
+  const key = dateKey(now);
+  if (todayZmanim && zmanimDateKey === key) return;
+
+  const fetched = await fetchFromSources();
+  if (fetched) {
+    todayZmanim = fetched;
+    el.status.textContent = `זמני היום נטענו מ: ${settings.locationLabel}`;
+  } else {
+    todayZmanim = {
+      ...DEFAULT_CONFIG.fallbackTimes,
+      source: 'fallback'
     };
+    el.status.textContent = 'לא ניתן למשוך נתונים מהאתר כרגע, מוצגים זמני גיבוי.';
+  }
+  zmanimDateKey = key;
+}
+
+function render() {
+  const now = new Date();
+  el.clock.textContent = toHms(now);
+
+  el.gregorianDate.textContent = new Intl.DateTimeFormat('he-IL', {
+    weekday: 'long',
+    day: '2-digit',
+    month: '2-digit',
+    year: 'numeric'
+  }).format(now);
+
+  el.hebrewDate.textContent = new Intl.DateTimeFormat('he-u-ca-hebrew', {
+    weekday: 'long',
+    day: 'numeric',
+    month: 'long',
+    year: 'numeric'
+  }).format(now);
+
+  if (!todayZmanim) return;
+
+  const sunriseTime = todayZmanim.sunrise;
+  const sunsetTime = todayZmanim.sunset;
+  const netzTime = todayZmanim.netz;
+
+  el.sunrise.textContent = `זריחה: ${sunriseTime}`;
+
+  const netzDate = parseTimeToDate(now, netzTime);
+  const startTimerAt = new Date(netzDate.getTime() - settings.minutesBeforeNetz * 60 * 1000);
+  const inTimerMode = now >= startTimerAt && now < netzDate;
+
+  if (inTimerMode) {
+    el.timerSection.classList.remove('hidden');
+    el.sunset.classList.add('hidden');
+    el.timerCountdown.textContent = formatDiff(netzDate - now);
+    el.netzLabel.textContent = `הנץ החמה: ${netzTime}`;
+  } else {
+    el.timerSection.classList.add('hidden');
+    el.sunset.classList.remove('hidden');
+    el.sunset.textContent = `שקיעה: ${sunsetTime}`;
+  }
+}
+
+function initSettingsUi() {
+  el.minutesBeforeNetz.value = settings.minutesBeforeNetz;
+
+  el.openSettings.addEventListener('click', () => el.settingsDialog.showModal());
+  el.cancelSettings.addEventListener('click', () => el.settingsDialog.close());
+
+  el.resetSettings.addEventListener('click', () => {
+    settings = { ...DEFAULT_CONFIG };
+    saveSettings();
+    el.minutesBeforeNetz.value = settings.minutesBeforeNetz;
+    el.settingsDialog.close();
+  });
+
+  el.settingsForm.addEventListener('submit', (event) => {
+    event.preventDefault();
+    const val = Number(el.minutesBeforeNetz.value);
+    settings.minutesBeforeNetz = Number.isFinite(val) ? Math.min(120, Math.max(0, val)) : DEFAULT_CONFIG.minutesBeforeNetz;
+    saveSettings();
+    el.settingsDialog.close();
+  });
+}
+
+async function init() {
+  initSettingsUi();
+  await ensureTodayZmanim();
+  render();
+  setInterval(render, 1000);
+  setInterval(ensureTodayZmanim, 60 * 1000);
 }
 
-// Example usage
-console.log(getCurrentTime());
-console.log(gregorianToHebrew(2026, 3, 12)); // Example conversion for March 12, 2026
-fetchSunriseSunset(31.0461, 34.8516).then(data => console.log(data)); // Tel Aviv coordinates
\ No newline at end of file
+init();
