// Global variable for Google Maps initialization
let googleMapsLoaded = false;

function initGoogleMaps() {
    googleMapsLoaded = true;
    console.log('Google Maps API loaded successfully');
}

class IssueReporter {
    constructor() {
        this.stream = null;
        this.capturedImage = null;
        this.googleApiKey = typeof GOOGLE_MAPS_API_KEY !== 'undefined' ? GOOGLE_MAPS_API_KEY : 'YOUR_GOOGLE_API_KEY';
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.video = document.getElementById('camera-preview');
        this.canvas = document.getElementById('image-canvas');
        this.placeholder = document.getElementById('placeholder');
        this.captureBtn = document.getElementById('capture-btn');
        this.retakeBtn = document.getElementById('retake-btn');
        this.form = document.getElementById('issue-form');
        this.modal = document.getElementById('success-modal');
        this.closeModalBtn = document.getElementById('close-modal');
        
        // Location elements
        this.locationLoading = document.getElementById('location-loading');
        this.currentLocation = document.getElementById('current-location');
        this.refreshLocationBtn = document.getElementById('refresh-location');
        this.areaInput = document.getElementById('area');
        this.citySelect = document.getElementById('city');
        this.latitudeInput = document.getElementById('latitude');
        this.longitudeInput = document.getElementById('longitude');
        this.fullAddressInput = document.getElementById('full-address');
        
        // Map elements
        this.toggleMapBtn = document.getElementById('toggle-map');
        this.mapContainer = document.getElementById('map-container');
        this.map = null;
        this.marker = null;
        
        // Nearby search elements
        this.getDirectionsBtn = document.getElementById('get-directions');
        this.findNearbyBtn = document.getElementById('find-nearby');
        this.nearbySearch = document.getElementById('nearby-search');
        this.closeNearbyBtn = document.getElementById('close-nearby');
        this.placeTypeSelect = document.getElementById('place-type');
        this.searchPlacesBtn = document.getElementById('search-places');
        this.placesResults = document.getElementById('places-results');
        
        this.currentPosition = null;
        this.placesService = null;
        this.directionsService = null;
    }

    bindEvents() {
        this.captureBtn.addEventListener('click', () => this.startCamera());
        this.retakeBtn.addEventListener('click', () => this.retakePhoto());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.refreshLocationBtn.addEventListener('click', () => this.detectLocation());
        
        // Map events
        this.toggleMapBtn.addEventListener('click', () => this.toggleMap());
        this.getDirectionsBtn.addEventListener('click', () => this.getDirections());
        this.findNearbyBtn.addEventListener('click', () => this.showNearbySearch());
        
        // Nearby search events
        this.closeNearbyBtn.addEventListener('click', () => this.hideNearbySearch());
        this.searchPlacesBtn.addEventListener('click', () => this.searchNearbyPlaces());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Auto-detect location on page load
        this.detectLocation();
    }

    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            this.video.srcObject = this.stream;
            this.video.style.display = 'block';
            this.placeholder.style.display = 'none';
            
            this.video.onloadedmetadata = () => {
                this.captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Now';
                this.captureBtn.onclick = () => this.capturePhoto();
            };
        } catch (error) {
            console.error('Camera access error:', error);
            this.showCameraError();
        }
    }

    capturePhoto() {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        const context = this.canvas.getContext('2d');
        context.drawImage(this.video, 0, 0);
        
        this.capturedImage = this.canvas.toDataURL('image/jpeg', 0.8);
        
        // Stop camera stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        // Show captured image
        this.video.style.display = 'none';
        this.canvas.style.display = 'block';
        this.captureBtn.style.display = 'none';
        this.retakeBtn.style.display = 'inline-block';
    }

    retakePhoto() {
        this.canvas.style.display = 'none';
        this.retakeBtn.style.display = 'none';
        this.captureBtn.style.display = 'inline-block';
        this.captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Photo';
        this.captureBtn.onclick = () => this.startCamera();
        this.capturedImage = null;
    }

    showCameraError() {
        alert('Camera access denied or not available. Please check your browser permissions and try again.');
    }

    async detectLocation() {
        this.showLocationLoading(true);
        
        if (!navigator.geolocation) {
            this.showLocationError('Geolocation is not supported by your browser');
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });

            this.currentPosition = position;
            await this.reverseGeocode(position.coords.latitude, position.coords.longitude);
            
        } catch (error) {
            console.error('Location detection error:', error);
            let errorMessage = 'Unable to detect your location';
            
            if (error.code === 1) {
                errorMessage = 'Location access denied. Please enable location permissions.';
            } else if (error.code === 3) {
                errorMessage = 'Location request timed out. Please try again.';
            }
            
            this.showLocationError(errorMessage);
        }
    }

    async reverseGeocode(lat, lon) {
        try {
            // Check if Google Maps API is loaded
            if (!googleMapsLoaded || !window.google || !window.google.maps) {
                this.showLocationError('Google Maps API not loaded. Please check your API key.');
                return;
            }

            const geocoder = new window.google.maps.Geocoder();
            const latlng = new window.google.maps.LatLng(lat, lon);

            const result = await new Promise((resolve, reject) => {
                geocoder.geocode({ 'location': latlng }, (results, status) => {
                    if (status === window.google.maps.GeocoderStatus.OK) {
                        resolve(results);
                    } else {
                        reject(new Error(`Geocoding failed: ${status}`));
                    }
                });
            });

            if (result && result.length > 0) {
                this.updateLocationDisplay(result[0], lat, lon);
            } else {
                this.showLocationError('Unable to get address from coordinates');
            }
        } catch (error) {
            console.error('Google Geocoding error:', error);
            this.showLocationError('Failed to get address details: ' + error.message);
        }
    }

    updateLocationDisplay(result, lat, lon) {
        const addressComponents = result.address_components || [];
        const formattedAddress = result.formatted_address || '';
        
        // Extract address components
        let area = '';
        let city = '';
        let locality = '';
        
        addressComponents.forEach(component => {
            const types = component.types;
            
            if (types.includes('sublocality') || types.includes('neighborhood')) {
                area = component.long_name;
            } else if (types.includes('locality')) {
                city = component.long_name;
                locality = component.long_name;
            } else if (types.includes('administrative_area_level_2')) {
                if (!city) city = component.long_name;
            }
        });

        // Update location display
        this.currentLocation.textContent = formattedAddress;
        
        // Auto-fill form fields
        if (area) {
            this.areaInput.value = area;
        } else if (locality) {
            this.areaInput.value = locality;
        }
        
        // Auto-select city if it matches Hyderabad or Secunderabad
        if (city.toLowerCase().includes('hyderabad')) {
            this.citySelect.value = 'hyderabad';
        } else if (city.toLowerCase().includes('secunderabad')) {
            this.citySelect.value = 'secunderabad';
        }

        // Update hidden fields
        this.latitudeInput.value = lat;
        this.longitudeInput.value = lon;
        this.fullAddressInput.value = formattedAddress;

        // Update map if it's already initialized
        if (this.map) {
            this.updateMap(lat, lon);
        }

        this.showLocationLoading(false);
    }

    toggleMap() {
        if (this.mapContainer.style.display === 'none') {
            this.showMap();
        } else {
            this.hideMap();
        }
    }

    showMap() {
        this.mapContainer.style.display = 'block';
        if (!this.map) {
            this.initializeMap();
        } else if (this.currentPosition) {
            this.updateMap(this.currentPosition.coords.latitude, this.currentPosition.coords.longitude);
        }
    }

    hideMap() {
        this.mapContainer.style.display = 'none';
    }

    initializeMap() {
        if (!this.currentPosition) {
            this.showLocationError('Please detect location first');
            return;
        }

        const lat = this.currentPosition.coords.latitude;
        const lng = this.currentPosition.coords.longitude;

        this.map = new window.google.maps.Map(document.getElementById('map'), {
            center: { lat, lng },
            zoom: 15,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true
        });

        this.marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: this.map,
            title: 'Your Location',
            animation: window.google.maps.Animation.DROP
        });

        // Initialize Places service
        this.placesService = new window.google.maps.places.PlacesService(this.map);
        this.directionsService = new window.google.maps.DirectionsService();
    }

    updateMap(lat, lng) {
        if (!this.map) return;

        const center = new window.google.maps.LatLng(lat, lng);
        this.map.setCenter(center);
        
        if (this.marker) {
            this.marker.setPosition(center);
        } else {
            this.marker = new window.google.maps.Marker({
                position: center,
                map: this.map,
                title: 'Your Location',
                animation: window.google.maps.Animation.DROP
            });
        }
    }

    showNearbySearch() {
        this.nearbySearch.style.display = 'block';
    }

    hideNearbySearch() {
        this.nearbySearch.style.display = 'none';
        this.placesResults.innerHTML = '';
    }

    async searchNearbyPlaces() {
        const placeType = this.placeTypeSelect.value;
        if (!placeType) {
            alert('Please select a place type');
            return;
        }

        if (!this.placesService) {
            alert('Please enable map first');
            return;
        }

        if (!this.currentPosition) {
            alert('Please detect location first');
            return;
        }

        const location = new window.google.maps.LatLng(
            this.currentPosition.coords.latitude,
            this.currentPosition.coords.longitude
        );

        const request = {
            location: location,
            radius: 2000, // 2km radius
            type: placeType
        };

        this.placesService.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                this.displayPlacesResults(results);
            } else {
                alert('No nearby places found');
            }
        });
    }

    displayPlacesResults(places) {
        this.placesResults.innerHTML = '';
        
        places.forEach(place => {
            const placeItem = document.createElement('div');
            placeItem.className = 'place-item';
            
            const name = document.createElement('div');
            name.className = 'place-name';
            name.textContent = place.name;
            
            const address = document.createElement('div');
            address.className = 'place-address';
            address.textContent = place.vicinity || 'Address not available';
            
            const distance = this.calculateDistance(
                this.currentPosition.coords.latitude,
                this.currentPosition.coords.longitude,
                place.geometry.location.lat(),
                place.geometry.location.lng()
            );
            
            const distanceDiv = document.createElement('div');
            distanceDiv.className = 'place-distance';
            distanceDiv.textContent = `${distance.toFixed(1)} km away`;
            
            const rating = place.rating ? document.createElement('div') : null;
            if (rating) {
                rating.className = 'place-rating';
                rating.textContent = `Rating: ${place.rating} stars`;
            }
            
            placeItem.appendChild(name);
            placeItem.appendChild(address);
            placeItem.appendChild(distanceDiv);
            if (rating) placeItem.appendChild(rating);
            
            this.placesResults.appendChild(placeItem);
        });
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    getDirections() {
        if (!this.currentPosition) {
            alert('Please detect location first');
            return;
        }

        const destination = 'Telangana Secretariat, Hyderabad, Telangana, India';
        const origin = `${this.currentPosition.coords.latitude},${this.currentPosition.coords.longitude}`;
        
        // Open Google Maps with directions
        window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, '_blank');
    }

    showLocationLoading(show) {
        if (show) {
            this.locationLoading.style.display = 'flex';
            this.currentLocation.textContent = 'Detecting location...';
        } else {
            this.locationLoading.style.display = 'none';
        }
    }

    showLocationError(message) {
        this.currentLocation.textContent = message;
        this.currentLocation.style.color = '#dc3545';
        this.showLocationLoading(false);
        
        // Reset color after 3 seconds
        setTimeout(() => {
            this.currentLocation.style.color = '#495057';
        }, 3000);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.capturedImage) {
            alert('Please capture a photo of the issue before submitting.');
            return;
        }

        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            area: formData.get('area'),
            city: formData.get('city'),
            problem: formData.get('problem'),
            image: this.capturedImage,
            timestamp: new Date().toISOString(),
            latitude: formData.get('latitude'),
            longitude: formData.get('longitude'),
            fullAddress: formData.get('full-address')
        };

        // Show loading state
        const submitBtn = this.form.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Sending...';
        submitBtn.disabled = true;

        try {
            await this.sendReport(data);
            this.showSuccessModal();
            this.resetForm();
        } catch (error) {
            console.error('Error sending report:', error);
            alert('Failed to send report. Please try again later.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async sendReport(data) {
        // Using EmailJS for email functionality
        // You need to sign up for EmailJS and configure these values
        const emailData = {
            service_id: 'your_service_id', // Replace with your EmailJS service ID
            template_id: 'your_template_id', // Replace with your EmailJS template ID
            user_id: 'your_user_id', // Replace with your EmailJS user ID
            template_params: {
                to_name: 'Telangana CM Office',
                from_name: data.name,
                area: data.area,
                city: data.city,
                problem: data.problem,
                timestamp: new Date().toLocaleString(),
                image_url: data.image
            }
        };

        // Send to Telangana CM office
        await this.sendEmail(emailData);
        
        // Send confirmation to user
        const userEmailData = {
            ...emailData,
            template_params: {
                ...emailData.template_params,
                to_email: 'user-email@example.com', // You'll need to collect user email
                to_name: data.name,
                subject: 'Issue Report Confirmation'
            }
        };
        
        await this.sendEmail(userEmailData);
    }

    async sendEmail(emailData) {
        // For production, use EmailJS or other email service
        // For now, we'll simulate the email sending
        return new Promise((resolve) => {
            console.log('Sending email:', emailData);
            
            // Simulate API call delay
            setTimeout(() => {
                // In production, this would be:
                // emailjs.send(emailData.service_id, emailData.template_id, emailData.template_params, emailData.user_id)
                resolve({ success: true });
            }, 2000);
        });
    }

    showSuccessModal() {
        this.modal.style.display = 'flex';
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    resetForm() {
        this.form.reset();
        this.retakePhoto(); // Reset photo section
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IssueReporter();
});

// Additional utility functions
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const area = document.getElementById('area').value.trim();
    const city = document.getElementById('city').value;
    const problem = document.getElementById('problem').value.trim();

    if (!name || !area || !city || !problem) {
        alert('Please fill in all required fields.');
        return false;
    }

    if (name.length < 3) {
        alert('Name must be at least 3 characters long.');
        return false;
    }

    if (problem.length < 10) {
        alert('Please provide more details about the issue (at least 10 characters).');
        return false;
    }

    return true;
}

// Geolocation functionality (optional enhancement)
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log('Current location:', latitude, longitude);
                // You could use this to auto-fill area or include coordinates
            },
            (error) => {
                console.error('Geolocation error:', error);
            }
        );
    }
}
