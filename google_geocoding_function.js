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