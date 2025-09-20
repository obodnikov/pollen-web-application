# Script.js vs Vercel/Script.js Function Differences

## Overview
The main difference between the two versions is **API call architecture**:
- **script.js**: Direct client-side API calls to Google/Weather APIs (requires exposed API keys)
- **vercel/script.js**: Server-side API calls through Vercel Functions (secure API key handling)

## Function-by-Function Comparison

### 1. **PollenTracker Constructor**
**Local Version (script.js):**
```javascript
constructor() {
    this.apiKey = 'YOUR_GOOGLE_API_KEY'; // API key stored client-side
    this.currentLang = 'ru';
    // ... rest of constructor
}
```

**Vercel Version (vercel/script.js):**
```javascript
constructor() {
    // No API key needed - handled server-side
    this.currentLang = 'ru';
    // ... rest of constructor (identical)
}
```

**Key Difference:** Vercel version removes client-side API key storage.

---

### 2. **loadPollenData() Function**
**Local Version (script.js):**
```javascript
async loadPollenData(latitude, longitude) {
    if (this.apiKey === 'YOUR_GOOGLE_API_KEY') {
        this.showError(this.translate('API key required'));
        return;
    }

    try {
        const languageCode = this.currentLang;
        const apiUrl = `https://pollen.googleapis.com/v1/forecast:lookup?key=${this.apiKey}&location.longitude=${longitude}&location.latitude=${latitude}&days=3&languageCode=${languageCode}`;
        
        const response = await fetch(apiUrl);
        // ... rest of function
    }
}
```

**Vercel Version (vercel/script.js):**
```javascript
async loadPollenData(latitude, longitude) {
    try {
        const languageCode = this.currentLang;
        const response = await fetch(`/api/pollen?lat=${latitude}&lng=${longitude}&lang=${languageCode}&days=3`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // ... rest of function (identical)
    }
}
```

**Key Differences:**
- **Local**: Direct Google API call with exposed API key
- **Vercel**: Call to `/api/pollen` serverless function
- **Security**: Vercel version never exposes API keys to client

---

### 3. **loadWeatherData() Function**
**Local Version (script.js):**
```javascript
async loadWeatherData(latitude, longitude) {
    try {
        const weatherApiKey = 'YOUR_WEATHER_API_KEY'; // Hardcoded API key
        
        if (weatherApiKey === 'YOUR_WEATHER_API_KEY') {
            document.getElementById('weatherDesc').textContent = this.translate('Failed to load weather data');
            return;
        }

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric&lang=${this.currentLang}`);
        // ... rest of function
    }
}
```

**Vercel Version (vercel/script.js):**
```javascript
async loadWeatherData(latitude, longitude) {
    try {
        const response = await fetch(`/api/weather?lat=${latitude}&lng=${longitude}&lang=${this.currentLang}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // ... rest of function (identical)
    }
}
```

**Key Differences:**
- **Local**: Direct OpenWeatherMap API call with exposed API key
- **Vercel**: Call to `/api/weather` serverless function
- **Flexibility**: Vercel version gracefully handles missing weather API keys server-side

---

### 4. **generateDetailedHistoryChart() Function**
**Both Versions Have Enhancement:**
```javascript
generateDetailedHistoryChart(dateRange, locationHistory, currentLang) {
    // NEW: Calculate global maximum value across all days
    let globalMaxValue = 0;
    dateRange.forEach(dateInfo => {
        const dayData = locationHistory[dateInfo.date];
        if (dayData && dayData.processed && dayData.processed.types) {
            const types = Object.values(dayData.processed.types);
            const dayMaxValue = Math.max(...types.map(type => type.value || 0));
            globalMaxValue = Math.max(globalMaxValue, dayMaxValue);
        }
    });

    // NEW: Calculate dynamic container height
    const baseHeight = 60;
    const maxHeight = 120;
    const dynamicHeight = Math.max(baseHeight, Math.min(maxHeight, baseHeight + (globalMaxValue / 5) * 40));
    
    // Enhanced bar height calculation
    const barsHTML = displayTypes.map(type => {
        const heightRatio = globalMaxValue > 0 ? type.value / globalMaxValue : 0;
        const barHeight = Math.max(10, heightRatio * (dynamicHeight - 20));
        // ... rest of mapping
    });
}
```

**Key Enhancement:** Both versions now include dynamic height calculation for better chart scaling.

---

### 5. **Identical Functions**
These functions are **100% identical** in both versions:

#### Core Functionality:
- `init()`
- `setupEventListeners()`
- `toggleHistory()`
- `updateLanguage()`
- `translate()`
- `getCurrentLocation()`

#### Data Processing:
- `displayWeatherData()`
- `updateLocationCard()`
- `loadLocationNameFree()`
- `displayDetailedPollenHistory()`
- `createHistoryContainer()`
- `displayPollenData()`
- `createPollenCard()`

#### Utility Functions:
- `getLevelClass()`
- `translateLevel()`
- `showLoading()`
- `hideLoading()`
- `showError()`
- `hideError()`

#### History Manager Class:
- **Entire `DetailedPollenHistoryManager` class is identical**
- All storage, processing, and data management functions unchanged

---

## Architecture Summary

### Local Version (script.js)
```
Browser → Direct API Calls → Google/Weather APIs
         ↑ (API keys exposed)
```

**Pros:**
- Simpler deployment (static files only)
- No server infrastructure needed

**Cons:**
- API keys visible in client code
- CORS limitations
- Security vulnerabilities

### Vercel Version (vercel/script.js)
```
Browser → Vercel Functions → Google/Weather APIs
         ↑ (no API keys)    ↑ (secure server-side)
```

**Pros:**
- Secure API key management
- No CORS issues
- Production-ready security
- Automatic scaling

**Cons:**
- Requires server infrastructure
- Slightly more complex deployment

---

## Key Takeaways

1. **Security**: Vercel version is production-ready with secure API handling
2. **Functionality**: Core app logic is 99% identical between versions
3. **Architecture**: Only API call methods changed, not business logic
4. **Maintenance**: Easy to sync features between both versions
5. **Performance**: Both versions include the same dynamic chart enhancements

The Vercel version is essentially a **secure wrapper** around the original code, maintaining all functionality while adding enterprise-grade security.