# Pollen Tracker 🌿

A modern, responsive web application that provides real-time pollen information based on your location. Built with vanilla JavaScript, the app displays current pollen levels, health recommendations, weather information, and human-friendly location names to help allergy sufferers plan their day.

## Features ✨

- **Real-time Pollen Data**: Get current pollen levels for your location using Google Pollen API
- **Human-Friendly Location Names**: Automatic reverse geocoding using free OpenStreetMap API
- **Multi-language Support**: Available in English and Russian
- **Weather Integration**: Current weather conditions with temperature and weather icons
- **Health Recommendations**: Personalized advice based on pollen levels
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, glassmorphism-inspired design with smooth animations
- **Geolocation**: Automatic location detection with manual refresh option
- **Smart Fallbacks**: Graceful error handling and fallback systems

## Demo 📱

The app displays pollen information for different plant types including:
- Trees (Oak, Birch, Pine, etc.)
- Grasses
- Weeds (Ragweed, Mugwort, etc.)

Each pollen card shows:
- Pollen level (Very Low to Very High)
- Numerical index value
- Health impact description
- Specific recommendations for managing exposure

The location card displays:
- Human-readable place names (e.g., "Budapest, Hungary" instead of coordinates)
- Current weather conditions with temperature
- Weather icons and descriptions

## File Structure 📁

```
pollen-tracker/
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── script.js           # JavaScript functionality with geocoding
├── README.md           # This documentation
└── google_pollen.json  # Sample API response data
```

## Setup Instructions 🚀

### Prerequisites
- A modern web browser
- Google API key with Pollen API access
- (Optional) OpenWeatherMap API key for weather data
- Internet connection for geocoding services

### Installation

1. **Clone or download** the project files to your local machine

2. **Get API Keys**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Pollen API
   - Create an API key
   - (Optional) Get a weather API key from [OpenWeatherMap](https://openweathermap.org/api)

3. **Configure API Keys**:
   Open `script.js` and replace the placeholder API keys:
   ```javascript
   this.apiKey = 'YOUR_GOOGLE_API_KEY'; // Replace with your Google API key
   
   // In loadWeatherData method:
   const weatherApiKey = 'YOUR_WEATHER_API_KEY'; // Replace with your weather API key
   ```

4. **Run the Application**:
   - Open `index.html` in a web browser, or
   - Serve the files using a local web server (recommended for full functionality)

### Using a Local Server

For the best experience and to avoid CORS issues, run a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Usage 💡

1. **Allow Location Access**: The app will request permission to access your location
2. **View Location**: See your current location displayed as a human-readable place name
3. **Check Weather**: View current temperature and weather conditions
4. **View Pollen Data**: See current pollen levels for your area
5. **Read Recommendations**: Follow health advice based on pollen levels
6. **Switch Languages**: Use the language selector to toggle between English and Russian
7. **Refresh Data**: Click the refresh button to get updated information

## API Configuration 🔧

### Google Pollen API (Required)
- **Endpoint**: `https://pollen.googleapis.com/v1/forecast:lookup`
- **Required Parameters**: API key, latitude, longitude
- **Optional Parameters**: days (forecast period), languageCode
- **Cost**: Paid service with generous free tier

### OpenStreetMap Nominatim API (Free - Used for Location Names)
- **Endpoint**: `https://nominatim.openstreetmap.org/reverse`
- **Parameters**: lat, lng, format=json, accept-language
- **Cost**: Completely free
- **Rate Limits**: 1 request per second (reasonable usage)
- **No API key required**

### Weather API (Optional)
- **Default**: OpenWeatherMap API
- **Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
- **Note**: Weather functionality will be disabled if no API key is provided

## Location Services 🗺️

The app includes intelligent location handling:

### Geocoding Features
- **Automatic reverse geocoding**: Converts GPS coordinates to readable place names
- **Multi-language support**: Location names in English or Russian
- **Smart location parsing**: Prioritizes city > town > village > county > state
- **Graceful fallbacks**: Shows coordinates if place name lookup fails

### Location Display Priority
1. City name + Country (e.g., "Budapest, Hungary")
2. Town/Village + Country (e.g., "Szentendre, Hungary")
3. State/Region + Country (e.g., "California, United States")
4. GPS coordinates as fallback (e.g., "47.4979, 19.0402")

## Customization 🎨

### Styling
- Modify `styles.css` to change colors, fonts, or layout
- The design uses CSS custom properties for easy theme customization
- Responsive breakpoints can be adjusted in the media queries

### Language Support
- Add new languages by extending the `translations` object in `script.js`
- Update the language selector in `index.html`
- OpenStreetMap geocoding will automatically use the selected language

### Location Services
- The app uses free OpenStreetMap geocoding by default
- Can be upgraded to Google Geocoding API for higher accuracy
- Location name format can be customized in the `loadLocationNameFree()` method

### Default Images
- The app uses a fallback image from Columbia University for pollen items without pictures
- Change the default image URL in the `createPollenCard` method

## Browser Support 🌐

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

**Required Features**:
- ES6+ JavaScript support
- Geolocation API
- Fetch API
- CSS Grid and Flexbox

## Troubleshooting 🔍

### Common Issues

1. **"API key required" error**:
   - Ensure you've replaced `YOUR_GOOGLE_API_KEY` with your actual API key
   - Verify the API key has Pollen API access enabled

2. **Location access denied**:
   - Check browser location permissions
   - Ensure you're accessing the app via HTTPS or localhost

3. **No pollen data displayed**:
   - Check browser console for API errors
   - Verify your API key quota and billing settings
   - Ensure your location has available pollen data

4. **CORS errors**:
   - Use a local web server instead of opening the HTML file directly
   - Ensure your domain is authorized in the Google Cloud Console

5. **Location shows coordinates instead of place name**:
   - Check browser console for geocoding errors
   - Verify internet connection
   - OpenStreetMap service may be temporarily unavailable

6. **Location name in wrong language**:
   - The geocoding service respects the language setting
   - Some locations may not have translations available

### Performance Notes

- **Geocoding calls**: Made only when location changes, not on every refresh
- **Rate limiting**: OpenStreetMap allows 1 request per second for reasonable usage
- **Caching**: Browser may cache geocoding results
- **Fallback system**: Always displays something, even if services fail

## API Costs and Limits 💰

### Free Services
- **OpenStreetMap Nominatim**: Completely free, 1 req/sec guideline
- **Google Pollen API**: Generous free tier, then paid

### Paid Services (Optional)
- **OpenWeatherMap**: Free tier available (1000 calls/month)
- **Google Geocoding**: More accurate than OpenStreetMap, paid service

## Contributing 🤝

Contributions are welcome! Areas for improvement:
- Additional language support for both UI and geocoding
- More weather data sources
- Historical pollen data charts
- Push notifications for high pollen days
- PWA functionality
- Caching for geocoding results
- Alternative geocoding providers

## Privacy & Data 🔒

- **Location data**: Used only for API calls, not stored
- **No tracking**: No analytics or user tracking
- **Third-party APIs**: Data sent to Google (pollen), OpenStreetMap (geocoding), and optionally OpenWeatherMap (weather)
- **No personal data**: App doesn't collect or store personal information

## License 📄

This project is open source and available under the [MIT License](LICENSE).

## Credits 🙏

- **Pollen Data**: Powered by Google Pollen API
- **Geocoding**: Free OpenStreetMap Nominatim service
- **Weather Data**: OpenWeatherMap API (optional)
- **Default Image**: Columbia University Magazine
- **Icons**: Unicode emoji characters
- **Design**: Modern glassmorphism and gradient design trends

## Changelog 📝

### Version 1.1 (Latest)
- ✅ Added free reverse geocoding using OpenStreetMap
- ✅ Human-friendly location names instead of coordinates
- ✅ Multi-language geocoding support
- ✅ Smart fallback system for location display
- ✅ Improved error handling

### Version 1.0
- ✅ Initial release with pollen tracking
- ✅ Weather integration
- ✅ Multi-language support
- ✅ Responsive design

## Support 💬

For questions or issues:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all API keys are correctly configured
4. Verify that required APIs are enabled in your Google Cloud Console
5. Check internet connection for geocoding services

## Roadmap 🛣️

**Planned Features**:
- [ ] Historical pollen data visualization
- [ ] 7-day pollen forecast
- [ ] Push notifications for high pollen alerts
- [ ] PWA support with offline mode
- [ ] User preferences and favorites
- [ ] Export data functionality

---

**Happy allergy-free days!** 🌞