# Pollen Tracker - Vercel Deployment 🌿

A modern, responsive web application that provides detailed 3-day pollen forecasts based on your location. Built with vanilla JavaScript and deployed on Vercel with serverless API functions for secure API key management.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/obodnikov/pollen-web-application/tree/main/vercel)

## ✨ Features

### Core Functionality
- **3-Day Pollen Forecast**: Detailed forecasts for today and next 2 days using Google Pollen API
- **Visual Forecast Charts**: Interactive bar charts showing individual pollen types with color coding
- **Individual Pollen Tracking**: Track specific pollens (Oak, Birch, Ragweed, Grasses, etc.) with custom colors
- **Smart Pollen Mapping**: Automatic mapping of API codes to known pollen types with fallbacks
- **Weather Integration**: Current weather conditions with temperature and weather icons
- **Human-Friendly Locations**: Automatic reverse geocoding using free OpenStreetMap API

### User Experience
- **Multi-language Support**: Available in English and Russian (Russian as default)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Local Storage**: Stores forecast data locally with enhanced error handling
- **Modern UI**: Clean, glassmorphism-inspired design with smooth animations
- **Custom Favicon**: Professional app icon for all devices and platforms
- **Interactive Elements**: Tooltips, legends, and detailed pollen information

### Technical Features
- **Serverless Architecture**: Secure API calls via Vercel Functions (no exposed API keys)
- **Enhanced Error Handling**: Robust localStorage management and API error recovery
- **Performance Optimized**: Efficient data processing and caching
- **CORS Enabled**: Cross-origin resource sharing configured for API endpoints

## 🔧 Setup Instructions

### 1. Get Required API Keys

**Google Pollen API (Required):**
- Visit [Google Cloud Console](https://console.cloud.google.com/)
- Enable the Pollen API
- Create an API key
- Note: This is a paid service with generous free tier

**OpenWeatherMap API (Optional but Recommended):**
- Sign up at [OpenWeatherMap](https://openweathermap.org/api)
- Get your free API key (1000 calls/month free tier)
- Weather functionality will be disabled without this key

### 2. Configure Environment Variables in Vercel

In your Vercel dashboard, add these environment variables:

```
GOOGLE_API_KEY=your_google_pollen_api_key_here
WEATHER_API_KEY=your_openweathermap_api_key_here
```

**Important**: Never commit API keys to your repository. Always use environment variables.

### 3. Deploy Options

**Option A: One-Click Deploy**
1. Click the "Deploy with Vercel" button above
2. Fork the repository to your GitHub account
3. Connect the repository to Vercel
4. Add your environment variables in Vercel dashboard
5. Deploy!

**Option B: Manual Deploy**
1. Fork this repository
2. Clone to your local machine
3. Install Vercel CLI: `npm install -g vercel`
4. Run `vercel` in the project directory
5. Follow the prompts and add environment variables

### 4. Verify Deployment

After deployment:
1. Visit your Vercel app URL
2. Allow location access when prompted
3. Verify pollen data loads correctly
4. Check that weather information displays
5. Test the 3-day forecast feature

## 📁 File Structure

```
vercel/
├── index.html                    # Main HTML structure with forecast UI
├── styles.css                    # Main styling and responsive design
├── detailed_history_styles.css   # Forecast chart and history styling
├── script.js                     # Enhanced JavaScript with forecast system
├── vercel.json                   # Vercel deployment configuration
├── manifest.json                 # PWA manifest for mobile support
├── README.md                     # This documentation
├── api/
│   ├── pollen.js                 # Serverless function for pollen data (3-day support)
│   └── weather.js                # Serverless function for weather data
├── favicon.svg                   # Modern SVG favicon (32x32)
├── apple-touch-icon.png          # iOS home screen icon (180x180)
├── favicon.ico                   # Legacy browser support (32x32)
└── 2022_06_allergies.jpg         # Default pollen image
```

## 🌍 API Endpoints

### `/api/pollen`
**Purpose**: Fetch pollen forecast data from Google Pollen API

**Parameters**:
- `lat` or `latitude` (required): Latitude coordinate
- `lng` or `longitude` (required): Longitude coordinate  
- `lang` or `languageCode` (optional): Language code (en/ru), default: 'en'
- `days` (optional): Number of forecast days (1-5), default: 3

**Example**: `/api/pollen?lat=47.5823&lng=19.0978&lang=ru&days=3`

### `/api/weather`
**Purpose**: Fetch current weather data from OpenWeatherMap API

**Parameters**:
- `lat` or `latitude` (required): Latitude coordinate
- `lng` or `longitude` (required): Longitude coordinate
- `lang` (optional): Language code (en/ru), default: 'en'

**Example**: `/api/weather?lat=47.5823&lng=19.0978&lang=ru`

## 🎨 Visual Features

### Forecast Charts
- **Individual pollen type bars** with custom colors for each allergen
- **Height-based visualization** showing pollen concentration levels (1-5 scale)
- **Interactive tooltips** with detailed pollen information
- **Day labels** showing Today, Tomorrow, and future dates
- **Maximum level indicators** for each day
- **Summary statistics** showing total pollen types and severity

### Pollen Type Colors
- **Trees**: Oak (brown), Birch (light green), Pine (dark green), etc.
- **Grasses**: Various shades of green
- **Weeds**: Ragweed (red), Mugwort (purple), etc.
- **Unknown types**: Automatically assigned colors using hash-based algorithm

### Legend System
- **Pollen Types Legend**: Shows all detected allergens with color coding
- **Concentration Levels Legend**: Explains the 1-5 scale (Very Low to Very High)
- **Multi-language Support**: All labels translate based on selected language

## 🌐 Browser Support

**Desktop Browsers**:
- Chrome 60+ ✅
- Firefox 55+ ✅  
- Safari 12+ ✅
- Edge 79+ ✅

**Mobile Browsers**:
- Chrome Mobile 60+ ✅
- Safari iOS 12+ ✅
- Firefox Mobile 55+ ✅
- Samsung Internet 8+ ✅

**Required Features**:
- ES6+ JavaScript support
- Geolocation API
- Fetch API
- CSS Grid and Flexbox
- SVG support (for favicon)
- localStorage support

## 🔒 Security Features

### API Key Protection
- **Server-side API calls**: All API keys stored securely in Vercel environment variables
- **No client-side exposure**: API keys never sent to browser
- **Proxy architecture**: Client communicates only with Vercel functions

### Data Privacy
- **No personal data storage**: App doesn't collect or store personal information
- **Location data**: Used only for API calls, not stored permanently
- **Local storage**: Only stores pollen forecast data temporarily
- **No tracking**: No analytics or user tracking implemented

## 🛠️ Troubleshooting

### Common Issues

**1. "API key not configured" error**
- Ensure `GOOGLE_API_KEY` is set in Vercel environment variables
- Verify the API key has Pollen API access enabled in Google Cloud Console
- Check API key quotas and billing settings

**2. Weather data not loading**
- Verify `WEATHER_API_KEY` is set in Vercel environment variables
- Check OpenWeatherMap API key is valid and active
- Weather will be disabled if API key is missing (app still works)

**3. Location access denied**
- Check browser location permissions
- Ensure app is accessed via HTTPS (Vercel provides this automatically)
- Try refreshing and allowing location access again

**4. Forecast shows "No data"**
- Check browser console for API errors
- Verify location has available pollen data (some remote areas may not be covered)
- Check Google API quotas and billing status

**5. Charts not displaying correctly**
- Ensure `detailed_history_styles.css` is loading properly
- Check browser console for JavaScript errors
- Verify localStorage is enabled in browser settings

### Performance Notes

- **Serverless functions**: Cold starts may cause initial 1-2 second delay
- **Data caching**: Pollen data cached locally to reduce API calls
- **Geocoding**: OpenStreetMap calls are cached and rate-limited
- **Image loading**: Default fallback image ensures cards always display

## 📊 API Costs and Limits

### Google Pollen API
- **Pricing**: Pay-per-request after free tier
- **Free tier**: Generous allowance for personal use
- **Rate limits**: Standard Google API rate limiting applies
- **Billing**: Requires Google Cloud billing account

### OpenWeatherMap API (Optional)
- **Free tier**: 1,000 calls/month
- **Rate limits**: 60 calls/minute
- **Upgrade**: Paid plans available for higher usage

### OpenStreetMap Nominatim (Free)
- **Cost**: Completely free
- **Rate limits**: 1 request per second (reasonable usage)
- **Usage**: Used only for location name display

## 🚀 Performance Optimizations

### Client-Side
- **Local storage caching**: Reduces repeated API calls
- **Efficient data processing**: Optimized pollen type mapping and filtering
- **Lazy loading**: Weather and location data loaded asynchronously
- **Error recovery**: Automatic retry mechanisms and fallback handling

### Server-Side
- **Serverless functions**: Automatic scaling and geographic distribution
- **Edge deployment**: Fast response times worldwide
- **CORS optimization**: Minimal overhead for cross-origin requests
- **Error handling**: Comprehensive error responses with debugging info

## 📱 Mobile Features

### Progressive Web App (PWA) Ready
- **App manifest**: Supports "Add to Home Screen" functionality
- **Touch-optimized**: Proper touch targets and mobile interactions
- **Responsive design**: Adapts to all screen sizes seamlessly
- **Fast loading**: Optimized for mobile networks

### iOS Support
- **Apple Touch Icon**: High-quality 180x180 icon for home screen
- **Safari integration**: Proper meta tags for iOS Safari
- **Touch events**: Optimized for iOS touch interactions

## 🔄 Version Information

### Current Version: 2.0 (Vercel Enhanced)
- ✅ **3-Day Pollen Forecast**: Accurate forecast matching Google API capabilities
- ✅ **Visual Forecast Charts**: Interactive bar charts with individual pollen types
- ✅ **Serverless Architecture**: Secure API handling via Vercel Functions
- ✅ **Enhanced Data Processing**: Better handling of undefined/null values
- ✅ **Smart Pollen Mapping**: Automatic fallback for unknown pollen codes
- ✅ **Improved Error Handling**: Robust localStorage and API error recovery
- ✅ **Performance Optimizations**: Efficient data processing and caching

### Previous Versions
- **v1.2**: Added favicon support and mobile optimizations
- **v1.1**: Free reverse geocoding with OpenStreetMap
- **v1.0**: Initial release with basic pollen tracking

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional language support
- More detailed pollen information
- Historical data visualization
- Push notifications for high pollen alerts
- Dark/light theme toggle
- Additional weather data sources

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Credits

- **Pollen Data**: Powered by Google Pollen API
- **Weather Data**: OpenWeatherMap API
- **Geocoding**: Free OpenStreetMap Nominatim service
- **Hosting**: Vercel serverless platform
- **Icons**: Unicode emoji characters and custom SVG favicon
- **Design**: Modern glassmorphism and gradient design trends

## 📞 Support

For deployment issues:
1. Check Vercel function logs for error details
2. Verify environment variables are set correctly
3. Test API endpoints directly in browser
4. Check browser console for client-side errors
5. Review Google Cloud Console for API key issues

---

**Happy allergy-free days!** 🌞

*Deployed on Vercel with ❤️*