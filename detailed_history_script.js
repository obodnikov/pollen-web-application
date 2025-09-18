// Enhanced PollenHistoryManager with individual pollen type tracking
class DetailedPollenHistoryManager {
    constructor() {
        this.storageKey = 'detailed-pollen-history';
        this.maxHistoryDays = 30;
        this.historyData = new Map();
        
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
            'TREE_ALDER': { 
                name: { en: 'Alder', ru: 'Ольха' }, 
                shortName: { en: 'Ald', ru: 'Оль' },
                color: 'pollen-alder',
                category: 'tree'
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

    // Store detailed pollen data with individual types
    storeDetailedPollenData(latitude, longitude, date, pollenData) {
        const locationKey = this.getLocationKey(latitude, longitude);
        const dateKey = date || new Date().toISOString().split('T')[0];
        
        if (!this.historyData.has(locationKey)) {
            this.historyData.set(locationKey, new Map());
        }
        
        const locationData = this.historyData.get(locationKey);
        const processedData = this.processDetailedPollenData(pollenData);
        
        locationData.set(dateKey, {
            timestamp: Date.now(),
            rawData: pollenData,
            processed: processedData
        });
        
        this.cleanOldData(locationData);
    }

    getLocationKey(latitude, longitude) {
        return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
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
                if (plant.indexInfo && plant.indexInfo.value > 0) {
                    const typeConfig = this.getPollenTypeConfig(plant.code, plant.displayName);
                    
                    result.types[plant.code] = {
                        code: plant.code,
                        name: plant.displayName,
                        shortName: typeConfig.shortName,
                        value: plant.indexInfo.value,
                        category: plant.indexInfo.category,
                        color: typeConfig.color,
                        typeCategory: typeConfig.category
                    };

                    if (plant.indexInfo.value > result.maxLevel) {
                        result.maxLevel = plant.indexInfo.value;
                        result.maxCategory = plant.indexInfo.category;
                    }
                }
            });
        }

        // Process pollen type info
        if (dayData.pollenTypeInfo) {
            dayData.pollenTypeInfo.forEach(pollen => {
                if (pollen.indexInfo && pollen.indexInfo.value > 0) {
                    // Don't overwrite if we already have this from plantInfo
                    if (!result.types[pollen.code]) {
                        const typeConfig = this.getPollenTypeConfig(pollen.code, pollen.displayName);
                        
                        result.types[pollen.code] = {
                            code: pollen.code,
                            name: pollen.displayName,
                            shortName: typeConfig.shortName,
                            value: pollen.indexInfo.value,
                            category: pollen.indexInfo.category,
                            color: typeConfig.color,
                            typeCategory: typeConfig.category
                        };

                        if (pollen.indexInfo.value > result.maxLevel) {
                            result.maxLevel = pollen.indexInfo.value;
                            result.maxCategory = pollen.indexInfo.category;
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

    // Generate detailed history chart HTML
    generateDetailedHistoryChart(dateRange, locationHistory, currentLang) {
        return dateRange.map(dateInfo => {
            const dayData = locationHistory.get(dateInfo.date);
            
            let dayName;
            if (dateInfo.isToday) {
                dayName = currentLang === 'ru' ? 'Сегодня' : 'Today';
            } else if (dateInfo.dateObj.getDate() === new Date().getDate() - 1) {
                dayName = currentLang === 'ru' ? 'Вчера' : 'Yesterday';
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
                .filter(type => type.value > 0)
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
        locationHistory.forEach(dayData => {
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

    cleanOldData(locationData) {
        const dates = Array.from(locationData.keys()).sort();
        if (dates.length > this.maxHistoryDays) {
            const toDelete = dates.slice(0, dates.length - this.maxHistoryDays);
            toDelete.forEach(date => locationData.delete(date));
        }
    }

    getDateRange(days = 5) {
        const dates = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push({
                date: date.toISOString().split('T')[0],
                dateObj: new Date(date),
                isToday: i === 0,
                isPast: i > 0
            });
        }
        
        return dates;
    }

    getLocationHistory(latitude, longitude) {
        const locationKey = this.getLocationKey(latitude, longitude);
        return this.historyData.get(locationKey) || new Map();
    }
}

// Enhanced PollenTracker with detailed history
class EnhancedPollenTracker {
    constructor() {
        this.currentLang = 'ru';
        this.historyManager = new DetailedPollenHistoryManager();
        this.showHistory = false;
        this.historyMode = 'detailed'; // 'simple' or 'detailed'
        
        this.translations = {
            en: {
                'Pollen Tracker': 'Pollen Tracker',
                'Current Location': 'Current Location',
                'Loading pollen data...': 'Loading pollen data...',
                'Refresh': 'Refresh',
                'History': 'History',
                'Detailed History': 'Detailed History',
                'Simple History': 'Simple History',
                'Hide History': 'Hide History',
                'Show History': 'Show History',
                '5-Day Pollen History': '5-Day Pollen History',
                'Detailed Pollen History by Types (5 days)': 'Detailed Pollen History by Types (5 days)',
                'Today': 'Today',
                'Yesterday': 'Yesterday',
                'No data': 'No data',
                'Pollen Types': 'Pollen Types',
                'Concentration Levels': 'Concentration Levels',
                'Very Low': 'Very Low',
                'Low': 'Low',
                'Moderate': 'Moderate',
                'High': 'High',
                'Very High': 'Very High'
            },
            ru: {
                'Pollen Tracker': 'Трекер Пыльцы',
                'Current Location': 'Текущее местоположение',
                'Loading pollen data...': 'Загрузка данных о пыльце...',
                'Refresh': 'Обновить',
                'History': 'История',
                'Detailed History': 'Подробная история',
                'Simple History': 'Простая история',
                'Hide History': 'Скрыть историю',
                'Show History': 'Показать историю',
                '5-Day Pollen History': '5-дневная история пыльцы',
                'Detailed Pollen History by Types (5 days)': 'Подробная история пыльцы по типам (5 дней)',
                'Today': 'Сегодня',
                'Yesterday': 'Вчера',
                'No data': 'Нет данных',
                'Pollen Types': 'Типы пыльцы',
                'Concentration Levels': 'Уровни концентрации',
                'Very Low': 'Очень низкий',
                'Low': 'Низкий',
                'Moderate': 'Умеренный',
                'High': 'Высокий',
                'Very High': 'Очень высокий'
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
            historyToggle.textContent = this.translate('Hide History');
            historyToggle.classList.add('active');
            
            if (this.currentLocation) {
                this.displayDetailedPollenHistory(this.currentLocation.latitude, this.currentLocation.longitude);
            }
            
            if (historyContainer) {
                historyContainer.style.display = 'block';
            }
        } else {
            historyToggle.textContent = this.translate('Detailed History');
            historyToggle.classList.remove('active');
            if (historyContainer) {
                historyContainer.style.display = 'none';
            }
        }
    }

    translate(key) {
        return this.translations[this.currentLang][key] || key;
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
                this.translate('Hide History') : this.translate('Detailed History');
        }
    }

    getCurrentLocation() {
        this.showLoading();
        this.hideError();

        if (!navigator.geolocation) {
            this.showError('Location services not available');
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
                this.showError('Failed to get location');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }

    async loadPollenData(latitude, longitude) {
        try {
            const languageCode = this.currentLang;
            const response = await fetch(`/api/pollen?latitude=${latitude}&longitude=${longitude}&languageCode=${languageCode}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Store in detailed history
            this.historyManager.storeDetailedPollenData(latitude, longitude, null, data);
            
            // Display current data
            this.displayPollenData(data);
            
            // Display history if enabled
            if (this.showHistory) {
                this.displayDetailedPollenHistory(latitude, longitude);
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading pollen data:', error);
            this.showError('Failed to load pollen data: ' + error.message);
        }
    }

    displayDetailedPollenHistory(latitude, longitude) {
        const historyContainer = this.createHistoryContainer();
        const locationHistory = this.historyManager.getLocationHistory(latitude, longitude);
        const dateRange = this.historyManager.getDateRange(5);
        
        const pollenTypesLegend = this.historyManager.generatePollenTypesLegend(locationHistory, this.currentLang);
        
        const historyHTML = `
            <h2 class="history-title">${this.translate('Detailed Pollen History by Types (5 days)')}</h2>
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
            if (locationCard) {
                locationCard.parentNode.insertBefore(historyContainer, locationCard.nextSibling);
            }
        }
        
        return historyContainer;
    }

    // Placeholder methods for completeness (would need full implementation)
    async loadWeatherData(latitude, longitude) {
        // Weather loading implementation
        console.log('Loading weather data...');
    }

    updateLocationCard(latitude, longitude) {
        const locationCard = document.getElementById('locationCard');
        if (locationCard) {
            locationCard.style.display = 'flex';
        }
        console.log('Updating location card...');
    }

    displayPollenData(data) {
        console.log('Displaying pollen data...');
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'block';
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    showError(message) {
        console.error('Error:', message);
    }

    hideError() {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) errorMessage.style.display = 'none';
    }
}

// Initialize the enhanced app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedPollenTracker();
});