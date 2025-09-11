class PollenTracker {
    constructor() {
        this.apiKey = 'YOUR_GOOGLE_API_KEY'; // You need to replace this with your actual API key
        this.currentLang = 'en';
        this.translations = {
            en: {
                'Pollen Tracker': 'Pollen Tracker',
                'Current Location': 'Current Location',
                'Loading pollen data...': 'Loading pollen data...',
                'Loading weather...': 'Loading weather...',
                'Refresh': 'Refresh',
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
                'No pollen data': 'No significant pollen data found for your location today.'
            },
            ru: {
                'Pollen Tracker': 'Трекер Пыльцы',
                'Current Location': 'Текущее местоположение',
                'Loading pollen data...': 'Загрузка данных о пыльце...',
                'Loading weather...': 'Загрузка погоды...',
                'Refresh': 'Обновить',
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
                'No pollen data': 'Значимых данных о пыльце для вашего местоположения сегодня не найдено.'
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

        languageSelect.addEventListener('change', (e) => {
            this.currentLang = e.target.value;
            this.updateLanguage();
        });

        refreshBtn.addEventListener('click', () => {
            this.getCurrentLocation();
        });

        retryBtn.addEventListener('click', () => {
            this.getCurrentLocation();
        });
    }

    updateLanguage() {
        document.querySelectorAll('[data-en]').forEach(element => {
            const key = element.getAttribute('data-en');
            if (this.translations[this.currentLang][key]) {
                element.textContent = this.translations[this.currentLang][key];
            }
        });
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

    async loadPollenData(latitude, longitude) {
        if (this.apiKey === 'YOUR_GOOGLE_API_KEY') {
            this.showError(this.translate('API key required'));
            return;
        }

        try {
            const languageCode = this.currentLang;
            const response = await fetch(`https://pollen.googleapis.com/v1/forecast:lookup?key=${this.apiKey}&location.longitude=${longitude}&location.latitude=${latitude}&days=1&languageCode=${languageCode}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayPollenData(data);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading pollen data:', error);
            this.showError(this.translate('Failed to load pollen data'));
        }
    }

    async loadWeatherData(latitude, longitude) {
        try {
            // Using OpenWeatherMap API as an example (free tier available)
            // You'll need to get an API key from openweathermap.org
            const weatherApiKey = 'YOUR_WEATHER_API_KEY'; // Replace with your weather API key
            
            if (weatherApiKey === 'YOUR_WEATHER_API_KEY') {
                document.getElementById('weatherDesc').textContent = this.translate('Failed to load weather data');
                return;
            }

            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric&lang=${this.currentLang}`);
            
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
        this.loadLocationNameGoogle(latitude, longitude);
    }

// Google Geocoding API function for getting place names
async loadLocationNameGoogle(latitude, longitude) {
    try {
        // Use the same API key as pollen data (or create a separate one)
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}&language=${this.currentLang}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0];
            
            // Extract city and country from address components
            let city = '';
            let country = '';
            let state = '';
            
            result.address_components.forEach(component => {
                const types = component.types;
                
                if (types.includes('locality')) {
                    // City/town
                    city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    // State/province/region
                    state = component.long_name;
                } else if (types.includes('country')) {
                    // Country
                    country = component.long_name;
                }
            });
            
            // Build location name with priority: City, Country > State, Country > Country only
            let locationName = '';
            if (city && country) {
                locationName = `${city}, ${country}`;
            } else if (state && country) {
                locationName = `${state}, ${country}`;
            } else if (country) {
                locationName = country;
            } else {
                // Fallback to formatted address
                locationName = result.formatted_address.split(',').slice(0, 2).join(',').trim();
            }
            
            // Update the coordinates element to show place name instead
            document.getElementById('coordinates').textContent = locationName;
            
        } else {
            // Handle API errors
            console.warn('Google Geocoding API error:', data.status, data.error_message);
            
            // Fallback to OpenStreetMap if Google fails
            await this.loadLocationNameFree(latitude, longitude);
        }
        
    } catch (error) {
        console.error('Error loading location name from Google:', error);
        
        // Fallback to OpenStreetMap if Google fails
        try {
            await this.loadLocationNameFree(latitude, longitude);
        } catch (fallbackError) {
            console.error('Fallback geocoding also failed:', fallbackError);
            // Keep coordinates as final fallback
            document.getElementById('coordinates').textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
    }
}

// Alternative Google function with more detailed location parsing
async loadLocationNameGoogleDetailed(latitude, longitude) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}&language=${this.currentLang}&result_type=locality|administrative_area_level_1|country`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
            // Try to find the most specific location
            let bestResult = null;
            let bestScore = 0;
            
            data.results.forEach(result => {
                let score = 0;
                const hasLocality = result.address_components.some(comp => 
                    comp.types.includes('locality')
                );
                const hasAdmin1 = result.address_components.some(comp => 
                    comp.types.includes('administrative_area_level_1')
                );
                const hasCountry = result.address_components.some(comp => 
                    comp.types.includes('country')
                );
                
                // Scoring system: locality (city) > admin1 (state) > country
                if (hasLocality) score += 3;
                if (hasAdmin1) score += 2;
                if (hasCountry) score += 1;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestResult = result;
                }
            });
            
            if (bestResult) {
                let city = '';
                let state = '';
                let country = '';
                
                bestResult.address_components.forEach(component => {
                    const types = component.types;
                    
                    if (types.includes('locality')) {
                        city = component.long_name;
                    } else if (types.includes('administrative_area_level_1')) {
                        state = component.short_name; // Use short name for states (e.g., "CA" instead of "California")
                    } else if (types.includes('country')) {
                        country = component.long_name;
                    }
                });
                
                // Build location string
                let locationName = '';
                if (city && state && country) {
                    locationName = `${city}, ${state}, ${country}`;
                } else if (city && country) {
                    locationName = `${city}, ${country}`;
                } else if (state && country) {
                    locationName = `${state}, ${country}`;
                } else if (country) {
                    locationName = country;
                } else {
                    locationName = bestResult.formatted_address.split(',')[0];
                }
                
                document.getElementById('coordinates').textContent = locationName;
            }
            
        } else {
            // Fallback to OpenStreetMap
            await this.loadLocationNameFree(latitude, longitude);
        }
        
    } catch (error) {
        console.error('Error with Google Geocoding API:', error);
        await this.loadLocationNameFree(latitude, longitude);
    }
}

// Hybrid function that tries Google first, then falls back to OpenStreetMap
async loadLocationNameHybrid(latitude, longitude) {
    // Only use Google if we have a valid API key
    if (this.apiKey && this.apiKey !== 'YOUR_GOOGLE_API_KEY') {
        try {
            await this.loadLocationNameGoogle(latitude, longitude);
            return; // Success, no need for fallback
        } catch (error) {
            console.warn('Google geocoding failed, falling back to OpenStreetMap:', error);
        }
    }
    
    // Fallback to free OpenStreetMap
    await this.loadLocationNameFree(latitude, longitude);
}

// To use these functions, update your updateLocationCard method:
// Replace the existing loadLocationNameFree call with one of these options:

// Option 1: Google only (requires valid API key)
// this.loadLocationNameGoogle(latitude, longitude);

// Option 2: Google with detailed parsing (best accuracy)
// this.loadLocationNameGoogleDetailed(latitude, longitude);

// Option 3: Hybrid approach (Google first, OpenStreetMap fallback)
// this.loadLocationNameHybrid(latitude, longitude);

// Example updateLocationCard method using hybrid approach:
/*
updateLocationCard(latitude, longitude) {
    // Show coordinates temporarily while loading location name
    document.getElementById('coordinates').textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    document.getElementById('locationCard').style.display = 'flex';
    
    // Use hybrid geocoding (Google first, then OpenStreetMap fallback)
    this.loadLocationNameHybrid(latitude, longitude);
}
*/
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
                        picture: `https://via.placeholder.com/400x200/667eea/ffffff?text=${pollenType.displayName}`
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
            <img src="${plant.picture || plant.plantDescription?.picture || 'https://magazine.columbia.edu/sites/default/files/styles/wysiwyg_full_width_image/public/2022-06/2022_06_allergies.jpg?itok=W4HZD84K'}" 
                 alt="${plant.displayName}" 
                 class="pollen-image" 
                 onerror="this.src='https://magazine.columbia.edu/sites/default/files/styles/wysiwyg_full_width_image/public/2022-06/2022_06_allergies.jpg?itok=W4HZD84K'">
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PollenTracker();
});