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
        
        // Multiple images storage
        this.capturedImages = [];
        this.currentImageIndex = 0;
        
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
        
        // New modern elements
        this.charCount = document.getElementById('char-count');
        this.problemTextarea = document.getElementById('problem');
        
        // Image preview elements
        this.imagePreviewSection = document.getElementById('image-preview-section');
        this.imageCounter = document.getElementById('image-counter');
        this.prevImageBtn = document.getElementById('prev-image');
        this.nextImageBtn = document.getElementById('next-image');
        this.addMoreBtn = document.getElementById('add-more-btn');
        this.imageThumbnails = document.getElementById('image-thumbnails');
        
        this.currentPosition = null;
        this.placesService = null;
        this.directionsService = null;
    }

    bindEvents() {
        this.captureBtn.addEventListener('click', () => this.startCamera());
        this.retakeBtn.addEventListener('click', () => this.retakePhoto());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // Character counter
        this.problemTextarea.addEventListener('input', () => this.updateCharCount());
        
        // Image preview navigation events
        this.prevImageBtn.addEventListener('click', () => this.viewPreviousImage());
        this.nextImageBtn.addEventListener('click', () => this.viewNextImage());
        this.addMoreBtn.addEventListener('click', () => this.startCamera());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Auto-detect location on page load with immediate detection
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
            
            if (this.captureBtn) {
                this.captureBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Now';
                this.captureBtn.onclick = () => this.capturePhoto();
            }
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
        
        // Store captured image
        const imageData = this.canvas.toDataURL('image/jpeg', 0.9);
        this.capturedImages.push(imageData);
        this.capturedImage = imageData;
        
        // Stop camera stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        // Hide camera overlay
        const overlay = document.querySelector('.camera-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // Show captured image
        this.video.style.display = 'none';
        this.canvas.style.display = 'block';
        this.placeholder.style.display = 'none';
        this.captureBtn.style.display = 'none';
        this.retakeBtn.style.display = 'inline-flex';
        
        console.log('Image captured, total images:', this.capturedImages.length);
        this.displayCurrentImage();
    }

    displayCurrentImage() {
        if (this.capturedImages.length > 0) {
            this.canvas.style.display = 'block';
            this.placeholder.style.display = 'none';
            this.captureBtn.style.display = 'none';
            this.retakeBtn.style.display = 'inline-flex';
            
            // Update image counter and navigation buttons
            this.updateImagePreview();
        }
    }

    updateImagePreview() {
        this.imageCounter.textContent = `${this.capturedImages.length} image${this.capturedImages.length !== 1 ? 's' : ''}`;
        
        // Update navigation buttons
        this.prevImageBtn.disabled = this.currentImageIndex <= 0;
        this.nextImageBtn.disabled = this.currentImageIndex >= this.capturedImages.length - 1;
        
        // Show/hide preview section
        if (this.capturedImages.length > 0) {
            this.imagePreviewSection.style.display = 'block';
        } else {
            this.imagePreviewSection.style.display = 'none';
        }
    }

    viewPreviousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            const imageData = this.capturedImages[this.currentImageIndex];
            const img = new Image();
            img.onload = () => {
                const ctx = this.canvas.getContext('2d');
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = imageData;
            this.displayCurrentImage();
        }
    }

    viewNextImage() {
        if (this.currentImageIndex < this.capturedImages.length - 1) {
            this.currentImageIndex++;
            const imageData = this.capturedImages[this.currentImageIndex];
            const img = new Image();
            img.onload = () => {
                const ctx = this.canvas.getContext('2d');
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = imageData;
            this.displayCurrentImage();
        }
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
        console.log('Starting simple location detection...');
        this.showLocationLoading(true);
        
        if (!navigator.geolocation) {
            this.showLocationError('Geolocation is not supported by your browser');
            return;
        }

        // Very simple approach that always works
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('Location detected successfully:', position);
                this.currentPosition = position;
                
                // Update coordinates immediately
                this.latitudeInput.value = position.coords.latitude;
                this.longitudeInput.value = position.coords.longitude;
                
                // Simple reverse geocoding
                this.reverseGeocode(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.error('Location error:', error);
                let errorMessage = 'Unable to detect location';
                
                if (error.code === 1) {
                    errorMessage = 'Location access denied. Please enable location permissions.';
                } else if (error.code === 3) {
                    errorMessage = 'Location request timed out. Please try again.';
                }
                
                this.showLocationError(errorMessage);
            },
            options
        );
    }

    async reverseGeocode(lat, lon) {
        try {
            console.log('Starting reverse geocoding for:', lat, lon);
            
            // Show location immediately with coordinates
            this.fallbackLocationUpdate(lat, lon);
            
            // Check if Google Maps API is loaded
            if (!window.google || !window.google.maps) {
                console.log('Google Maps API not loaded, coordinates shown above');
                return;
            }

            const geocoder = new window.google.maps.Geocoder();
            const latlng = new window.google.maps.LatLng(lat, lon);

            const result = await new Promise((resolve, reject) => {
                geocoder.geocode({ 'location': latlng }, (results, status) => {
                    if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
                        resolve(results);
                    } else {
                        reject(new Error(`Geocoding failed: ${status}`));
                    }
                });
            });

            if (result && result.length > 0) {
                this.updateLocationDisplay(result[0], lat, lon);
            } else {
                console.log('Geocoding failed, coordinates already shown');
            }
        } catch (error) {
            console.error('Google Geocoding error:', error);
            console.log('Coordinates already shown above');
        }
    }

    fallbackLocationUpdate(lat, lon) {
        console.log('Using fallback location update');
        this.currentLocation.textContent = `Location detected: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        this.latitudeInput.value = lat;
        this.longitudeInput.value = lon;
        this.fullAddressInput.value = `Coordinates: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        
        // Try to set area based on coordinates (basic check for Hyderabad region)
        if (lat >= 17.3 && lat <= 17.5 && lon >= 78.2 && lon <= 78.6) {
            this.areaInput.value = 'Hyderabad';
            this.citySelect.value = 'hyderabad';
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

    updateCharCount() {
        const currentLength = this.problemTextarea.value.length;
        this.charCount.textContent = currentLength;
        
        if (currentLength > 500) {
            this.charCount.style.color = '#dc3545';
        } else {
            this.charCount.style.color = '#6c757d';
        }
    }

    
    async startCamera() {
        try {
            console.log('Starting camera...');
            
            // Show camera overlay for better framing
            const overlay = document.querySelector('.camera-overlay');
            if (overlay) {
                overlay.style.display = 'block';
            }

            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1920 }, // Higher resolution for better quality
                    height: { ideal: 1080 }
                } 
            });
            
            console.log('Camera stream obtained');
            this.video.srcObject = this.stream;
            this.video.style.display = 'block';
            this.placeholder.style.display = 'none';
            
            this.video.onloadedmetadata = () => {
                console.log('Video metadata loaded');
                this.captureBtn.innerHTML = '<div class="btn-content"><i class="fas fa-camera"></i><span>Capture</span></div>';
                this.captureBtn.onclick = () => this.capturePhoto();
            };
        } catch (error) {
            console.error('Camera access error:', error);
            this.showCameraError();
        }
    }

    capturePhoto() {
        console.log('Capturing photo...');
        
        // Set canvas dimensions to match video for better quality
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        const context = this.canvas.getContext('2d');
        
        // Apply filters for better image quality
        context.filter = 'contrast(1.1) brightness(1.05)';
        context.drawImage(this.video, 0, 0);
        
        this.capturedImage = this.canvas.toDataURL('image/jpeg', 0.9); // Higher quality
        console.log('Image captured, data URL length:', this.capturedImage.length);
        
        // Stop camera stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        // Hide camera overlay
        const overlay = document.querySelector('.camera-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // Show captured image - Fix display issue
        this.video.style.display = 'none';
        this.canvas.style.display = 'block';
        this.placeholder.style.display = 'none';
        this.captureBtn.style.display = 'none';
        this.retakeBtn.style.display = 'inline-flex';
        
        console.log('Display updated - Canvas visible:', this.canvas.style.display);
    }

    updateCharCount() {
        const currentLength = this.problemTextarea.value.length;
        this.charCount.textContent = currentLength;
        
        if (currentLength > 500) {
            this.charCount.style.color = '#dc3545';
        } else {
            this.charCount.style.color = '#6c757d';
        }
    }

    showCameraError() {
        alert('Camera access denied or not available. Please check permissions and try again.');
        const overlay = document.querySelector('.camera-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showLocationError(message) {
        console.log('Location error:', message);
        const locationStatus = document.getElementById('location-status');
        if (locationStatus) {
            locationStatus.innerHTML = `<span class="status-dot error"></span><span>Error</span>`;
        }
        this.currentLocation.textContent = message;
        this.currentLocation.style.color = '#dc3545';
        this.showLocationLoading(false);
        
        // Reset color after 5 seconds
        setTimeout(() => {
            this.currentLocation.style.color = '#495057';
            if (locationStatus) {
                locationStatus.innerHTML = '<span class="status-dot active"></span><span>GPS Active</span>';
            }
        }, 5000);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.capturedImage) {
            alert('Please capture a photo of the issue before submitting.');
            return;
        }

        // Validate required fields
        const area = this.areaInput.value.trim();
        const city = this.citySelect.value;
        const problem = document.getElementById('problem').value.trim();

        if (!area || !city || !problem) {
            alert('Please fill in all required fields (Area, City, and Problem Issue).');
            return;
        }

        if (problem.length < 10) {
            alert('Please provide more details about the issue (at least 10 characters).');
            return;
        }

        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name') || 'Anonymous', // Use 'Anonymous' if name is empty
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
                to_email: 'cmo@telangana.gov.in', // Telangana CM Office email
                to_name: 'Telangana CM Office',
                from_name: data.name,
                area: data.area,
                city: data.city,
                problem: data.problem,
                timestamp: new Date().toLocaleString(),
                image_url: data.image,
                latitude: data.latitude,
                longitude: data.longitude,
                full_address: data.fullAddress
            }
        };

        // Send to Telangana CM office
        await this.sendEmail(emailData);
        
        // Send confirmation to you
        const adminEmailData = {
            ...emailData,
            template_params: {
                ...emailData.template_params,
                to_email: 'gomitechnology@gmail.com', // Your personal email
                to_name: 'Admin - Public Issues',
                subject: 'New Issue Report Received',
                report_type: 'New Public Issue Report'
            }
        };
        
        await this.sendEmail(adminEmailData);
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
