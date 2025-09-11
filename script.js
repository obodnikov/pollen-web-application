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
        document.getElementById('coordinates').textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        document.getElementById('locationCard').style.display = 'flex';
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