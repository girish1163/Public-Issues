class IssueReporter {
    constructor() {
        this.stream = null;
        this.capturedImage = null;
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
    }

    bindEvents() {
        this.captureBtn.addEventListener('click', () => this.startCamera());
        this.retakeBtn.addEventListener('click', () => this.retakePhoto());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
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
            timestamp: new Date().toISOString()
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
