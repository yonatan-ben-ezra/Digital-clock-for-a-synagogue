diff --git a/config.js b/config.js
index 3e122c705521689e4d41f9f19ee65d93745e623d..9bb7d49e2a71f7703a6b95e901acc682702cf70b 100644
--- a/config.js
+++ b/config.js
@@ -1,9 +1,10 @@
-// Configuration file for the clock app
 const DEFAULT_CONFIG = {
-    timerMinutes: 15,
-    location: 'זאב פלק 18, ירושלים',
-    latitude: 31.7732,
-    longitude: 35.2208,
-    timeFormat: '24h',
-    language: 'he'
-};
\ No newline at end of file
+  minutesBeforeNetz: 15,
+  locationLabel: 'זאב פלק 18, ירושלים',
+  itimUrl: 'https://itimlabina.co.il/schedules/extra/92',
+  fallbackTimes: {
+    sunrise: '06:10:00',
+    sunset: '17:45:00',
+    netz: '06:35:00'
+  }
+};
