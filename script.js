// script.js

// Function to get the current time in a formatted string
function getCurrentTime() {
    const now = new Date();
    return now.toUTCString();
}

// Function to convert Gregorian date to Hebrew calendar date
function gregorianToHebrew(year, month, day) {
    // Simple Hebrew calendar conversion logic (this should be replaced with proper library usage)
    const hebrewMonths = ["Tishrei", "Cheshvan", "Kislev", "Tevet", "Shevat", "Adar", "Nisan", "Iyar", "Sivan", "Tammuz", "Av", "Elul"];
    const hebrewYear = year + 5778; // This is a simplification
    const hebrewMonth = hebrewMonths[month - 1];
    return `${hebrewDay} ${hebrewMonth} ${hebrewYear}`;
}

// Function to fetch sunrise and sunset data
async function fetchSunriseSunset(lat, long) {
    const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${long}&formatted=0`);
    const data = await response.json();
    return {
        sunrise: data.results.sunrise,
        sunset: data.results.sunset
    };
}

// Example usage
console.log(getCurrentTime());
console.log(gregorianToHebrew(2026, 3, 12)); // Example conversion for March 12, 2026
fetchSunriseSunset(31.0461, 34.8516).then(data => console.log(data)); // Tel Aviv coordinates