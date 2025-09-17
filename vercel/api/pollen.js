// api/pollen.js - Vercel serverless function to proxy API calls
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { latitude, longitude, languageCode = 'en' } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const apiUrl = `https://pollen.googleapis.com/v1/forecast:lookup?key=${apiKey}&location.longitude=${longitude}&location.latitude=${latitude}&days=1&languageCode=${languageCode}`;

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Google API error: ${response.status}`);
        }

        const data = await response.json();
        
        res.status(200).json(data);
    } catch (error) {
        console.error('Pollen API error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch pollen data',
            details: error.message 
        });
    }
}
