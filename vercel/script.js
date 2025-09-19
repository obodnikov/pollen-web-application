// Enhanced Vercel PollenTracker with Individual Pollen Type History
class DetailedPollenHistoryManager {
    constructor() {
        this.storageKey = 'detailed-pollen-history';
        this.maxHistoryDays = 30;
        
        // Use localStorage for persistence (fallback to memory for demo)
        this.useLocalStorage = typeof(Storage) !== "undefined";
        this.memoryStorage = new Map();
        
        // Initialize storage wrapper to prevent extension conflicts
        this.initializeStorage();
        
        // Pollen type configuration with colors and names
        this.pollenTypes = {
            'TREE_OAK': { 
                name: { en: 'Oak', ru: 'Дуб' }, 
                shortName: { en: 'Oak', ru: 'Дуб' },
                color: 'pollen-oak',
                category: 'tree'
            },
            'TREE_BIRCH': { 
                name: { en: 'Birch', ru: 'Береза' }, 
                shortName: { en: 'Bir', ru: 'Бер' },
                color: 'pollen-birch',
                category: 'tree'
            },
            'TREE_MAPLE': { 
                name: { en: 'Maple', ru: 'Клен' }, 
                shortName: { en: 'Map', ru: 'Кле' },
                color: 'pollen-maple',
                category: 'tree'
            },
            'TREE_ASH': { 
                name: { en: 'Ash', ru: 'Ясень' }, 
                shortName: { en: 'Ash', ru: 'Яс' },
                color: 'pollen-ash',
                category: 'tree'
            },
            'TREE_PINE': { 
                name: { en: 'Pine', ru: 'Сосна' }, 
                shortName: { en: 'Pin', ru: 'Сос' },
                color: 'pollen-pine',
                category: 'tree'
            },
            'TREE_ALDER': { 
                name: { en: 'Alder', ru: 'Ольха' }, 
                shortName: { en: 'Ald', ru: 'Оль' },
                color: 'pollen-alder',
                category: 'tree'
            },
            'GRASS': { 
                name: { en: 'Grass', ru: 'Травы' }, 
                shortName: { en: 'Gra', ru: 'Тра' },
                color: 'pollen-grass',
                category: 'grass'
            },
            'WEED_RAGWEED': { 
                name: { en: 'Ragweed', ru: 'Амброзия' }, 
                shortName: { en: 'Rag', ru: 'Амб' },
                color: 'pollen-ragweed',
                category: 'weed'
            },
            'WEED_MUGWORT': { 
                name: { en: 'Mugwort', ru: 'Полынь' }, 
                shortName: { en: 'Mug', ru: 'Пол' },
                color: 'pollen-mugwort',
                category: 'weed'
            },
            'WEED': { 
                name: { en: 'Weed', ru: 'Сорные травы' }, 
                shortName: { en: 'Wed', ru: 'Сор' },
                color: 'pollen-weed',
                category: 'weed'
            }
        };
    }

    // Initialize storage and clear any corrupted data
    initializeStorage() {
        if (this.useLocalStorage) {
            try {
                // Test if storage is working and clear any corrupted data
                const testKey = this.storageKey + '_test';
                const testData = { test: 'value' };
                localStorage.setItem(testKey, JSON.stringify(testData));
                const retrieved = JSON.parse(localStorage.getItem(testKey));
                localStorage.removeItem(testKey);
                
                // Check existing data
                const existing = localStorage.getItem(this.storageKey);
                if (existing && (existing === '[object Object]' || existing === 'undefined' || existing === 'null')) {
                    console.warn('Clearing corrupted localStorage data');
                    localStorage.removeItem(this.storageKey);
                }
            } catch (e) {
                console.warn('localStorage initialization failed:', e);
                this.useLocalStorage = false;
            }
        }
    }

    // Store detailed pollen data with individual types for all forecast days
    storeDetailedPollenData(latitude, longitude, pollenData) {
        const locationKey = this.getLocationKey(latitude, longitude);
        
        let history = this.getHistory();
        
        if (!history[locationKey]) {
            history[locationKey] = {};
        }
        
        // Process all days from the API response (forecast data)
        if (pollenData?.dailyInfo) {
            pollenData.dailyInfo.forEach((dayData, index) => {
                // Calculate the date for this day (today + index days)
                const date = new Date();
                date.setDate(date.getDate() + index);
                const dateKey = date.toISOString().split('T')[0];
                
                const processedData = this.processDetailedPollenData({ dailyInfo: [dayData] });
                
                history[locationKey][dateKey] = {
                    timestamp: Date.now(),
                    rawData: { dailyInfo: [dayData] },
                    processed: processedData
                };
            });
        }
        
        this.cleanOldData(history[locationKey]);
        this.saveHistory(history);
    }

    getLocationKey(latitude, longitude) {
        return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    }

    // Get all history from storage
    getHistory() {
        if (this.useLocalStorage) {
            try {
                const storedData = localStorage.getItem(this.storageKey);
                
                // Check if data exists and is valid
                if (!storedData || storedData === 'undefined' || storedData === 'null') {
                    return {};
                }
                
                // Additional validation to ensure it's valid JSON
                if (typeof storedData !== 'string' || storedData === '[object Object]') {
                    console.warn('Invalid localStorage data detected, clearing storage');
                    localStorage.removeItem(this.storageKey);
                    return {};
                }
                
                const parsed = JSON.parse(storedData);
                
                // Ensure parsed data is an object
                if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                    console.warn('Invalid data structure in localStorage, clearing storage');
                    localStorage.removeItem(this.storageKey);
                    return {};
                }
                
                // Handle new wrapper format vs old direct format
                if (parsed.version && parsed.data) {
                    // New wrapper format
                    return parsed.data;
                } else {
                    // Legacy direct format - migrate to new format
                    this.saveHistory(parsed);
                    return parsed;
                }
                
            } catch (e) {
                console.warn('Failed to load history from localStorage:', e);
                // Clear corrupted data
                localStorage.removeItem(this.storageKey);
                return {};
            }
        } else {
            // Fallback to memory storage
            const result = {};
            this.memoryStorage.forEach((value, key) => {
                result[key] = value;
            });
            return result;
        }
    }

    // Save history to storage with extension-safe wrapper
    saveHistory(history) {
        if (this.useLocalStorage) {
            try {
                // Validate data before saving
                if (typeof history !== 'object' || history === null || Array.isArray(history)) {
                    console.warn('Invalid history data, skipping save');
                    return;
                }
                
                // Create a wrapper object to prevent extension conflicts
                const safeWrapper = {
                    version: '1.0',
                    timestamp: Date.now(),
                    data: history
                };
                
                const serialized = JSON.stringify(safeWrapper);
                
                // Additional check to ensure serialization worked correctly
                if (serialized === '[object Object]' || serialized === 'undefined') {
                    console.warn('Serialization failed, skipping save');
                    return;
                }
                
                // Use a temporary key first to test if save will work
                const tempKey = this.storageKey + '_temp';
                localStorage.setItem(tempKey, serialized);
                
                // If temp save worked, move to real key
                localStorage.setItem(this.storageKey, serialized);
                localStorage.removeItem(tempKey);
                
            } catch (e) {
                console.warn('Failed to save history to localStorage:', e);
                // If saving fails, try to clear potentially corrupted data
                try {
                    localStorage.removeItem(this.storageKey);
                    localStorage.removeItem(this.storageKey + '_temp');
                } catch (clearError) {
                    console.warn('Failed to clear localStorage:', clearError);
                }
            }
        } else {
            // Fallback to memory storage
            Object.keys(history).forEach(key => {
                this.memoryStorage.set(key, history[key]);
            });
        }
    }

    // Process pollen data into individual types with levels
    processDetailedPollenData(pollenData) {
        const result = {
            types: {},
            maxLevel: 0,
            maxCategory: 'Very Low',
            totalTypes: 0,
            summary: ''
        };

        if (!pollenData?.dailyInfo?.[0]) {
            return result;
        }

        const dayData = pollenData.dailyInfo[0];
        
        // Process plant info
        if (dayData.plantInfo) {
            dayData.plantInfo.forEach(plant => {
                if (plant.indexInfo && (plant.indexInfo.value >= 0 || plant.indexInfo.value === undefined)) {
                    // Treat undefined values as 0
                    const pollenValue = plant.indexInfo.value ?? 0;
                    const typeConfig = this.getPollenTypeConfig(plant.code, plant.displayName);
                    
                    result.types[plant.code] = {
                        code: plant.code,
                        name: plant.displayName,
                        shortName: typeConfig.shortName,
                        value: pollenValue,
                        category: plant.indexInfo.category || 'Very Low',
                        color: typeConfig.color,
                        typeCategory: typeConfig.category
                    };

                    if (pollenValue > result.maxLevel) {
                        result.maxLevel = pollenValue;
                        result.maxCategory = plant.indexInfo.category || 'Very Low';
                    }
                }
            });
        }

        // Process pollen type info
        if (dayData.pollenTypeInfo) {
            dayData.pollenTypeInfo.forEach(pollen => {
                if (pollen.indexInfo && (pollen.indexInfo.value >= 0 || pollen.indexInfo.value === undefined)) {
                    // Don't overwrite if we already have this from plantInfo
                    if (!result.types[pollen.code]) {
                        // Treat undefined values as 0
                        const pollenValue = pollen.indexInfo.value ?? 0;
                        const typeConfig = this.getPollenTypeConfig(pollen.code, pollen.displayName);
                        
                        result.types[pollen.code] = {
                            code: pollen.code,
                            name: pollen.displayName,
                            shortName: typeConfig.shortName,
                            value: pollenValue,
                            category: pollen.indexInfo.category || 'Very Low',
                            color: typeConfig.color,
                            typeCategory: typeConfig.category
                        };

                        if (pollenValue > result.maxLevel) {
                            result.maxLevel = pollenValue;
                            result.maxCategory = pollen.indexInfo.category || 'Very Low';
                        }
                    }
                }
            });
        }

        result.totalTypes = Object.keys(result.types).length;
        result.summary = `${result.totalTypes} ${result.totalTypes === 1 ? 'type' : 'types'}`;

        return result;
    }

    // Get pollen type configuration or create default
    getPollenTypeConfig(code, displayName) {
        if (this.pollenTypes[code]) {
            return this.pollenTypes[code];
        }

        // Try fallback mappings for common API codes
        const fallbackMappings = {
            'RAGWEED': 'WEED_RAGWEED',
            'MUGWORT': 'WEED_MUGWORT',
            'GRAMINALES': 'GRASS',
            'GRAMINEAE': 'GRASS',
            'POACEAE': 'GRASS',
            'OAK': 'TREE_OAK',
            'BIRCH': 'TREE_BIRCH',
            'MAPLE': 'TREE_MAPLE',
            'ASH': 'TREE_ASH',
            'PINE': 'TREE_PINE',
            'ALDER': 'TREE_ALDER'
        };

        if (fallbackMappings[code] && this.pollenTypes[fallbackMappings[code]]) {
            return this.pollenTypes[fallbackMappings[code]];
        }

        // Create default config for unknown types
        const defaultColors = ['pollen-oak', 'pollen-grass', 'pollen-birch', 'pollen-ragweed', 'pollen-pine'];
        const colorIndex = Math.abs(code.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % defaultColors.length;

        return {
            name: { en: displayName, ru: displayName },
            shortName: { en: displayName.substring(0, 3), ru: displayName.substring(0, 3) },
            color: defaultColors[colorIndex],
            category: 'unknown'
        };
    }

    // Get history for specific location
    getLocationHistory(latitude, longitude) {
        const locationKey = this.getLocationKey(latitude, longitude);
        const history = this.getHistory();
        return history[locationKey] || {};
    }

    cleanOldData(locationHistory) {
        const dates = Object.keys(locationHistory).sort();
        if (dates.length > this.maxHistoryDays) {
            const toDelete = dates.slice(0, dates.length - this.maxHistoryDays);
            toDelete.forEach(date => {
                delete locationHistory[date];
            });
        }
    }

    getDateRange(days = 3) {
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                date: date.toISOString().split('T')[0],
                dateObj: new Date(date),
                isToday: i === 0,
                isFuture: i > 0
            });
        }
        
        return dates;
    }

    // Generate detailed history chart HTML
    generateDetailedHistoryChart(dateRange, locationHistory, currentLang) {
        return dateRange.map(dateInfo => {
            const dayData = locationHistory[dateInfo.date];
            
            let dayName;
            if (dateInfo.isToday) {
                dayName = currentLang === 'ru' ? 'Сегодня' : 'Today';
            } else if (dateInfo.dateObj.getDate() === new Date().getDate() + 1) {
                dayName = currentLang === 'ru' ? 'Завтра' : 'Tomorrow';
            } else {
                dayName = dateInfo.dateObj.toLocaleDateString(
                    currentLang === 'ru' ? 'ru-RU' : 'en-US',
                    { weekday: 'short', day: 'numeric', month: 'short' }
                );
            }
            
            if (!dayData || !dayData.processed.types || Object.keys(dayData.processed.types).length === 0) {
                return `
                    <div class="history-day no-data">
                        <div class="day-label">${dayName}</div>
                        <div class="day-bars-container">
                            <div class="pollen-type-bar">
                                <div class="pollen-bar no-data-bar" style="height: 10px;">
                                    <div class="tooltip">${currentLang === 'ru' ? 'Нет данных' : 'No data'}</div>
                                </div>
                            </div>
                        </div>
                        <div class="day-max-value">--</div>
                        <div class="day-summary">${currentLang === 'ru' ? 'Нет данных' : 'No data'}</div>
                    </div>
                `;
            }

            const processed = dayData.processed;
            const types = Object.values(processed.types);
            
            // Sort by value (highest first) and limit to top 6 for display
            const displayTypes = types
                .filter(type => type.value >= 0)
                .sort((a, b) => b.value - a.value)
                .slice(0, 6);

            const barsHTML = displayTypes.map(type => {
                const barHeight = Math.max(10, Math.min(80, (type.value / 5) * 80));
                const shortName = this.getTypeShortName(type.code, type.name, currentLang);
                const levelText = this.translateLevel(type.category, currentLang);
                
                return `
                    <div class="pollen-type-bar">
                        <div class="pollen-bar ${type.color}" style="height: ${barHeight}px;">
                            <div class="tooltip">${type.name}: ${type.value} (${levelText})</div>
                        </div>
                        <div class="bar-label">${shortName}</div>
                    </div>
                `;
            }).join('');

            return `
                <div class="history-day ${dateInfo.isToday ? 'today' : ''}">
                    <div class="day-label">${dayName}</div>
                    <div class="day-bars-container">
                        ${barsHTML}
                    </div>
                    <div class="day-max-value">${currentLang === 'ru' ? 'Макс' : 'Max'}: ${processed.maxLevel}</div>
                    <div class="day-summary">
                        ${processed.totalTypes} ${currentLang === 'ru' ? 
                            (processed.totalTypes === 1 ? 'тип' : processed.totalTypes < 5 ? 'типа' : 'типов') : 
                            (processed.totalTypes === 1 ? 'type' : 'types')}<br/>
                        ${this.translateLevel(processed.maxCategory, currentLang)}
                    </div>
                </div>
            `;
        }).join('');
    }

    getTypeShortName(code, fullName, lang) {
        if (this.pollenTypes[code]) {
            return this.pollenTypes[code].shortName[lang] || this.pollenTypes[code].shortName.en;
        }
        return fullName.substring(0, 3);
    }

    translateLevel(category, lang) {
        const translations = {
            'Very Low': { en: 'Very Low', ru: 'Очень низкий' },
            'Low': { en: 'Low', ru: 'Низкий' },
            'Moderate': { en: 'Moderate', ru: 'Умеренный' },
            'High': { en: 'High', ru: 'Высокий' },
            'Very High': { en: 'Very High', ru: 'Очень высокий' },
            'Очень низкий': { en: 'Very Low', ru: 'Очень низкий' },
            'Низкий': { en: 'Low', ru: 'Низкий' },
            'Умеренный': { en: 'Moderate', ru: 'Умеренный' },
            'Высокий': { en: 'High', ru: 'Высокий' },
            'Очень высокий': { en: 'Very High', ru: 'Очень высокий' }
        };
        
        return translations[category]?.[lang] || category;
    }

    // Generate legend for pollen types
    generatePollenTypesLegend(locationHistory, currentLang) {
        const allTypes = new Set();
        
        // Collect all pollen types from history
        Object.values(locationHistory).forEach(dayData => {
            if (dayData.processed && dayData.processed.types) {
                Object.keys(dayData.processed.types).forEach(code => {
                    allTypes.add(code);
                });
            }
        });

        const legendItems = Array.from(allTypes).map(code => {
            const typeConfig = this.pollenTypes[code] || this.getPollenTypeConfig(code, code);
            const name = typeConfig.name[currentLang] || typeConfig.name.en || code;
            
            return `
                <div class="legend-item">
                    <div class="legend-color ${typeConfig.color}"></div>
                    <span>${name}</span>
                </div>
            `;
        }).join('');

        return legendItems;
    }
}

// Enhanced PollenTracker - VERCEL VERSION (Server-side API calls)
class PollenTracker {
    constructor() {
        // No API key needed - handled server-side
        this.currentLang = 'ru';
        this.historyManager = new DetailedPollenHistoryManager();
        this.showHistory = false;
        this.currentLocation = null;
        
        this.translations = {
            en: {
                'Pollen Tracker': 'Pollen Tracker',
                'Current Location': 'Current Location',
                'Loading pollen data...': 'Loading pollen data...',
                'Loading weather...': 'Loading weather...',
                'Refresh': 'Refresh',
                'Forecast': 'Forecast',
                'Detailed Forecast': 'Detailed Forecast',
                'Hide Forecast': 'Hide Forecast',
                'Show Forecast': 'Show Forecast',
                'Error': 'Error',
                'Try Again': 'Try Again',
                'Data provided by Google Pollen API': 'Data provided by Google Pollen API',
                'Recommendations': 'Recommendations',
                'Very Low': 'Very Low',
                'Low': 'Low',
                'Moderate': 'Moderate',
                'High': 'High',
                'Very High': 'Very High',
                'Location access denied': 'Location access denied. Please allow location access and try again.',
                'Location not available': 'Location services are not available on this device.',
                'Location timeout': 'Location request timed out. Please try again.',
                'Failed to load pollen data': 'Failed to load pollen data. Please check your internet connection.',
                'Failed to load weather data': 'Failed to load weather data.',
                'API key required': 'Google API key is required. Please add your API key to the script.',
                'No pollen data': 'No significant pollen data found for your location today.',
                '3-Day Pollen Forecast': '3-Day Pollen Forecast',
                'Detailed Pollen Forecast by Types (3 days)': 'Detailed Pollen Forecast by Types (3 days)',
                'Today': 'Today',
                'Tomorrow': 'Tomorrow',
                'No data': 'No data',
                'Pollen Types': 'Pollen Types',
                'Concentration Levels': 'Concentration Levels'
            },
            ru: {
                'Pollen Tracker': 'Трекер Пыльцы',
                'Current Location': 'Текущее местоположение',
                'Loading pollen data...': 'Загрузка данных о пыльце...',
                'Loading weather...': 'Загрузка погоды...',
                'Refresh': 'Обновить',
                'Forecast': 'Прогноз',
                'Detailed Forecast': 'Подробный прогноз',
                'Hide Forecast': 'Скрыть прогноз',
                'Show Forecast': 'Показать прогноз',
                'Error': 'Ошибка',
                'Try Again': 'Попробовать снова',
                'Data provided by Google Pollen API': 'Данные предоставлены Google Pollen API',
                'Recommendations': 'Рекомендации',
                'Very Low': 'Очень низкий',
                'Low': 'Низкий',
                'Moderate': 'Умеренный',
                'High': 'Высокий',
                'Very High': 'Очень высокий',
                'Location access denied': 'Доступ к местоположению запрещен. Разрешите доступ к местоположению и попробуйте снова.',
                'Location not available': 'Службы определения местоположения недоступны на этом устройстве.',
                'Location timeout': 'Время запроса местоположения истекло. Попробуйте снова.',
                'Failed to load pollen data': 'Не удалось загрузить данные о пыльце. Проверьте подключение к интернету.',
                'Failed to load weather data': 'Не удалось загрузить данные о погоде.',
                'API key required': 'Требуется ключ Google API. Добавьте ваш ключ API в скрипт.',
                'No pollen data': 'Значимых данных о пыльце для вашего местоположения сегодня не найдено.',
                '3-Day Pollen Forecast': '3-дневный прогноз пыльцы',
                'Detailed Pollen Forecast by Types (3 days)': 'Подробный прогноз пыльцы по типам (3 дней)',
                'Today': 'Сегодня',
                'Tomorrow': 'Завтра',
                'No data': 'Нет данных',
                'Pollen Types': 'Типы пыльцы',
                'Concentration Levels': 'Уровни концентрации'
            }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.getCurrentLocation();
    }

    setupEventListeners() {
        const languageSelect = document.getElementById('languageSelect');
        const refreshBtn = document.getElementById('refreshBtn');
        const retryBtn = document.getElementById('retryBtn');
        const historyToggle = document.getElementById('historyToggle');

        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.currentLang = e.target.value;
                this.updateLanguage();
                
                // Refresh history display with new language
                if (this.showHistory && this.currentLocation) {
                    this.displayDetailedPollenHistory(this.currentLocation.latitude, this.currentLocation.longitude);
                }
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.getCurrentLocation();
            });
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.getCurrentLocation();
            });
        }

        if (historyToggle) {
            historyToggle.addEventListener('click', () => {
                this.toggleHistory();
            });
        }
    }

    toggleHistory() {
        this.showHistory = !this.showHistory;
        const historyToggle = document.getElementById('historyToggle');
        const historyContainer = document.getElementById('pollenHistory');
        
        if (this.showHistory) {
            historyToggle.textContent = this.translate('Hide Forecast');
            historyToggle.classList.add('active');
            
            if (this.currentLocation) {
                this.displayDetailedPollenHistory(this.currentLocation.latitude, this.currentLocation.longitude);
            }
            
            if (historyContainer) {
                historyContainer.style.display = 'block';
            }
        } else {
            historyToggle.textContent = this.translate('Detailed Forecast');
            historyToggle.classList.remove('active');
            if (historyContainer) {
                historyContainer.style.display = 'none';
            }
        }
    }

    updateLanguage() {
        document.querySelectorAll('[data-en]').forEach(element => {
            const key = element.getAttribute('data-en');
            if (this.translations[this.currentLang][key]) {
                element.textContent = this.translations[this.currentLang][key];
            }
        });
        
        // Update history toggle button
        const historyToggle = document.getElementById('historyToggle');
        if (historyToggle) {
            historyToggle.textContent = this.showHistory ? 
                this.translate('Hide Forecast') : this.translate('Detailed Forecast');
        }
    }

    translate(key) {
        return this.translations[this.currentLang][key] || key;
    }

    getCurrentLocation() {
        this.showLoading();
        this.hideError();

        if (!navigator.geolocation) {
            this.showError(this.translate('Location not available'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.currentLocation = { latitude, longitude };
                this.updateLocationCard(latitude, longitude);
                this.loadPollenData(latitude, longitude);
                this.loadWeatherData(latitude, longitude);
            },
            (error) => {
                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = this.translate('Location access denied');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = this.translate('Location not available');
                        break;
                    case error.TIMEOUT:
                        errorMessage = this.translate('Location timeout');
                        break;
                    default:
                        errorMessage = this.translate('Location not available');
                        break;
                }
                this.showError(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }

    // VERCEL VERSION: Server-side API calls
    async loadPollenData(latitude, longitude) {
        try {
            const languageCode = this.currentLang;
            const response = await fetch(`/api/pollen?lat=${latitude}&lng=${longitude}&lang=${languageCode}&days=3`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Store in detailed history
            this.historyManager.storeDetailedPollenData(latitude, longitude, data);
            
            // Display current data
            this.displayPollenData(data);
            
            // Display history if enabled
            if (this.showHistory) {
                this.displayDetailedPollenHistory(latitude, longitude);
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading pollen data:', error);
            this.showError(this.translate('Failed to load pollen data'));
        }
    }

    // VERCEL VERSION: Server-side Weather API calls
    async loadWeatherData(latitude, longitude) {
        try {
            const response = await fetch(`/api/weather?lat=${latitude}&lng=${longitude}&lang=${this.currentLang}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayWeatherData(data);
        } catch (error) {
            console.error('Error loading weather data:', error);
            document.getElementById('weatherDesc').textContent = this.translate('Failed to load weather data');
        }
    }

    displayWeatherData(data) {
        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        
        document.getElementById('temperature').textContent = `${temperature}°C`;
        document.getElementById('weatherDesc').textContent = description;
        
        // Weather icon mapping
        const iconMap = {
            '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '⛅',
            '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
            '09d': '🌦️', '09n': '🌦️', '10d': '🌧️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️', '13d': '🌨️', '13n': '🌨️',
            '50d': '🌫️', '50n': '🌫️'
        };
        
        document.getElementById('weatherIcon').textContent = iconMap[iconCode] || '🌤️';
    }

    updateLocationCard(latitude, longitude) {
        // Show coordinates temporarily while loading location name
        document.getElementById('coordinates').textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        document.getElementById('locationCard').style.display = 'flex';
        
        // Load human-friendly location name and replace coordinates
        this.loadLocationNameFree(latitude, longitude);
    }

    // Free OpenStreetMap geocoding to show place name instead of coordinates
    async loadLocationNameFree(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=${this.currentLang}&addressdetails=1`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.address) {
                const city = data.address.city || 
                            data.address.town || 
                            data.address.village || 
                            data.address.county ||
                            data.address.state;
                const country = data.address.country;
                
                const locationName = city ? `${city}, ${country}` : country || data.display_name.split(',')[0];
                
                // Update the coordinates element to show place name instead
                document.getElementById('coordinates').textContent = locationName;
            } else {
                // Keep coordinates if geocoding fails
                document.getElementById('coordinates').textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            }
            
        } catch (error) {
            console.error('Error loading location name:', error);
            // Keep coordinates as fallback
            document.getElementById('coordinates').textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
    }

    displayDetailedPollenHistory(latitude, longitude) {
        const historyContainer = this.createHistoryContainer();
        const locationHistory = this.historyManager.getLocationHistory(latitude, longitude);
        const dateRange = this.historyManager.getDateRange(3);
        
        const pollenTypesLegend = this.historyManager.generatePollenTypesLegend(locationHistory, this.currentLang);
        
        const historyHTML = `
            <h2 class="history-title">${this.translate('Detailed Pollen Forecast by Types (3 days)')}</h2>
            <div class="history-chart">
                ${this.historyManager.generateDetailedHistoryChart(dateRange, locationHistory, this.currentLang)}
            </div>
            <div class="history-legend">
                <div class="legend-group">
                    <div class="legend-title">${this.translate('Pollen Types')}</div>
                    <div class="legend-items">
                        ${pollenTypesLegend}
                    </div>
                </div>
                
                <div class="legend-group">
                    <div class="legend-title">${this.translate('Concentration Levels')}</div>
                    <div class="legend-items">
                        <div class="legend-item">1 - ${this.translate('Very Low')}</div>
                        <div class="legend-item">2 - ${this.translate('Low')}</div>
                        <div class="legend-item">3 - ${this.translate('Moderate')}</div>
                        <div class="legend-item">4 - ${this.translate('High')}</div>
                        <div class="legend-item">5 - ${this.translate('Very High')}</div>
                    </div>
                </div>
            </div>
        `;
        
        historyContainer.innerHTML = historyHTML;
        historyContainer.style.display = this.showHistory ? 'block' : 'none';
    }

    createHistoryContainer() {
        let historyContainer = document.getElementById('pollenHistory');
        
        if (!historyContainer) {
            historyContainer = document.createElement('div');
            historyContainer.id = 'pollenHistory';
            historyContainer.className = 'pollen-history-container';
            
            const locationCard = document.getElementById('locationCard');
            if (locationCard && locationCard.nextSibling) {
                locationCard.parentNode.insertBefore(historyContainer, locationCard.nextSibling);
            } else if (locationCard) {
                locationCard.parentNode.appendChild(historyContainer);
            }
        }
        
        return historyContainer;
    }

    displayPollenData(data) {
        const container = document.getElementById('pollenContainer');
        container.innerHTML = '';

        if (!data.dailyInfo || !data.dailyInfo[0] || !data.dailyInfo[0].plantInfo) {
            this.showError(this.translate('No pollen data'));
            return;
        }

        const plantInfo = data.dailyInfo[0].plantInfo;
        const pollenTypeInfo = data.dailyInfo[0].pollenTypeInfo || [];

        // Filter plants with index value > 1
        const significantPollens = plantInfo.filter(plant => 
            plant.indexInfo && plant.indexInfo.value > 1
        );

        // Also check pollen type info for additional data
        pollenTypeInfo.forEach(pollenType => {
            if (pollenType.indexInfo && pollenType.indexInfo.value > 1) {
                // Check if this pollen type is not already in plantInfo
                const exists = significantPollens.some(plant => 
                    plant.code === pollenType.code
                );
                if (!exists) {
                    significantPollens.push({
                        ...pollenType,
                        picture: `2022_06_allergies.jpg`
                    });
                }
            }
        });

        if (significantPollens.length === 0) {
            this.showError(this.translate('No pollen data'));
            return;
        }

        significantPollens.forEach(plant => {
            const card = this.createPollenCard(plant);
            container.appendChild(card);
        });
    }

    createPollenCard(plant) {
        const card = document.createElement('div');
        card.className = 'pollen-card';

        const levelClass = this.getLevelClass(plant.indexInfo.category);
        const levelText = this.translateLevel(plant.indexInfo.category);

        card.innerHTML = `
            <img src="${plant.picture || plant.plantDescription?.picture || '2022_06_allergies.jpg'}" 
                 alt="${plant.displayName}" 
                 class="pollen-image" 
                 onerror="this.src='2022_06_allergies.jpg'">
            <div class="pollen-content">
                <div class="pollen-header">
                    <h3 class="pollen-name">${plant.displayName}</h3>
                    <span class="pollen-level ${levelClass}">${levelText}</span>
                </div>
                <div class="pollen-index">${plant.indexInfo.value}</div>
                <p class="pollen-description">${plant.indexInfo.indexDescription}</p>
                ${plant.healthRecommendations && plant.healthRecommendations.length > 0 ? `
                    <div class="pollen-recommendations">
                        <h4>${this.translate('Recommendations')}</h4>
                        <ul>
                            ${plant.healthRecommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;

        return card;
    }

    getLevelClass(category) {
        const categoryMap = {
            'Очень низкий': 'level-very-low',
            'Низкий': 'level-low',
            'Умеренный': 'level-moderate',
            'Высокий': 'level-high',
            'Очень высокий': 'level-very-high',
            'Very Low': 'level-very-low',
            'Low': 'level-low',
            'Moderate': 'level-moderate',
            'High': 'level-high',
            'Very High': 'level-very-high'
        };
        return categoryMap[category] || 'level-moderate';
    }

    translateLevel(category) {
        const levelMap = {
            'Очень низкий': this.translate('Very Low'),
            'Низкий': this.translate('Low'),
            'Умеренный': this.translate('Moderate'),
            'Высокий': this.translate('High'),
            'Очень высокий': this.translate('Very High')
        };
        return levelMap[category] || category;
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('locationCard').style.display = 'none';
        document.getElementById('pollenContainer').innerHTML = '';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('locationCard').style.display = 'flex';
    }

    showError(message) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorText').textContent = message;
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }
}

// Initialize the enhanced app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PollenTracker();
});