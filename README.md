# Public Issue Reporter - Telangana

A web application that allows citizens to report public issues in Telangana by capturing photos and submitting detailed information directly to the Chief Minister's office.

## Features

- **Image Capture**: Take photos of issues using device camera
- **Form Submission**: Fill in details including name, area, city (Hyderabad/Secunderabad), and problem description
- **Email Integration**: Automatically sends reports to Telangana CM office and confirmation to user
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, user-friendly interface with smooth animations

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with Font Awesome icons
- **Camera API**: WebRTC getUserMedia API
- **Email Service**: EmailJS (to be configured)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd public-issue-reporter
```

### 2. Configure Email Service

The application uses EmailJS for sending emails. Follow these steps:

1. **Sign up for EmailJS**: Go to [emailjs.com](https://www.emailjs.com/) and create an account
2. **Create Email Service**: Set up an email service provider (Gmail, Outlook, etc.)
3. **Create Email Template**: Design an email template with the following variables:
   - `{{to_name}}` - Recipient name
   - `{{from_name}}` - Sender name
   - `{{area}}` - Area/Location
   - `{{city}}` - City
   - `{{problem}}` - Problem description
   - `{{timestamp}}` - Report timestamp
   - `{{image_url}}` - Captured image (base64)

4. **Update Configuration**: In `script.js`, replace the placeholder values:
   ```javascript
   const emailData = {
       service_id: 'your_service_id',        // Your EmailJS service ID
       template_id: 'your_template_id',      // Your EmailJS template ID
       user_id: 'your_user_id'               // Your EmailJS public key
   };
   ```

### 3. Update Email Recipients

In the `sendReport()` method in `script.js`, update the email addresses:

```javascript
// Telangana CM Office email
template_params: {
    to_email: 'cm.telangana@gov.in',        // Official CM office email
    // ... other parameters
}

// User confirmation email (you may want to collect user email)
template_params: {
    to_email: 'your-email@example.com',     // Your email for data collection
    // ... other parameters
}
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings (if needed)
   - Click "Deploy"

3. **Environment Variables** (Optional):
   For better security, you can set EmailJS credentials as environment variables in Vercel:
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_USER_ID`

## Usage

1. **Open the Website**: Navigate to your deployed Vercel URL
2. **Capture Photo**: Click the camera icon to take a photo of the issue
3. **Fill Form**: Enter your name, area, select city, and describe the problem
4. **Submit**: Click "Submit Report" to send the information
5. **Confirmation**: You'll see a success message and receive email confirmation

## File Structure

```
public-issue-reporter/
|
|-- index.html          # Main HTML file
|-- styles.css          # Styling and responsive design
|-- script.js           # JavaScript functionality
|-- README.md           # This file
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Security Considerations

- Camera permissions are requested from user
- Email data is transmitted securely via EmailJS
- No sensitive data is stored locally
- Images are converted to base64 and sent via email

## Customization

### Adding More Cities
To add more cities, update the select element in `index.html`:
```html
<select id="city" name="city" required>
    <option value="">Select City</option>
    <option value="hyderabad">Hyderabad</option>
    <option value="secunderabad">Secunderabad</option>
    <option value="karimnagar">Karimnagar</option>
    <!-- Add more cities as needed -->
</select>
```

### Changing Theme Colors
Modify the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #28a745;
    --danger-color: #dc3545;
}
```

## Troubleshooting

### Camera Not Working
- Check browser permissions for camera access
- Ensure using HTTPS (required for camera API)
- Try refreshing the page

### Email Not Sending
- Verify EmailJS configuration
- Check email template variables
- Ensure EmailJS service is properly configured

### Mobile Issues
- Test on different mobile browsers
- Ensure responsive design is working
- Check camera permissions on mobile devices

## Support

For issues or questions, please create an issue in the GitHub repository or contact the development team.

## License

This project is open source and available under the [MIT License](LICENSE).
# publicises
# Public-Issues
