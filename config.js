// Google Maps API Configuration
const GOOGLE_MAPS_API_KEY = 'AIzaSyCX8Wc6fPDlfRVV1_O7vT_KB9mZLdgWD1A';

// API key validation
function validateApiKey() {
    if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
        console.warn('Please replace YOUR_GOOGLE_API_KEY_HERE with your actual Google Maps API key');
        return false;
    }
    return true;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GOOGLE_MAPS_API_KEY, validateApiKey };
}
