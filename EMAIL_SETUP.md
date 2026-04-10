# 📧 Email Configuration Guide

## 🎯 Email Addresses Configured

Your Public Issue Reporter is now configured to send emails to:

### 🏛️ Government Email
- **Recipient**: Telangana CM Office
- **Email**: `cmo@telangana.gov.in`
- **Purpose**: Receive all public issue reports

### 👤 Personal Email  
- **Recipient**: Admin - Public Issues
- **Email**: `gomitechnology@gmail.com`
- **Purpose**: Receive copy of all reports for tracking

## 🔧 EmailJS Setup Required

To activate email sending, you need to configure EmailJS:

### 1. Sign up for EmailJS
- Go to [EmailJS.com](https://www.emailjs.com/)
- Create free account

### 2. Create Email Service
- Add your email provider (Gmail recommended)
- Configure SMTP settings

### 3. Create Email Templates

#### Template 1: Government Report
```
To: cmo@telangana.gov.in
Subject: New Public Issue Report - {{area}}, {{city}}

Content:
New issue reported by: {{from_name}}
Location: {{area}}, {{city}}
Problem: {{problem}}
Time: {{timestamp}}
Coordinates: {{latitude}}, {{longitude}}
Full Address: {{full_address}}

Image attached: {{image_url}}
```

#### Template 2: Admin Copy
```
To: gomitechnology@gmail.com
Subject: {{report_type}} - {{area}}, {{city}}

Content:
Report received from: {{from_name}}
Location: {{area}}, {{city}}
Problem: {{problem}}
Time: {{timestamp}}
Coordinates: {{latitude}}, {{longitude}}
Full Address: {{full_address}}

Image: {{image_url}}
```

### 4. Update JavaScript Configuration

In `script.js`, replace these values:
```javascript
const emailData = {
    service_id: 'YOUR_SERVICE_ID',     // From EmailJS dashboard
    template_id: 'YOUR_TEMPLATE_ID',   // From EmailJS dashboard  
    user_id: 'YOUR_USER_ID',         // From EmailJS dashboard
    // ... rest of code
};
```

## 📋 What Gets Sent

### 🏛️ To Telangana CM Office
- Reporter name (or "Anonymous")
- Issue location (Area, City, Full Address)
- GPS coordinates
- Problem description
- Captured image
- Timestamp

### 👤 To Your Email
- All the above information
- Admin notification subject
- For your records and tracking

## 🚀 Quick Setup Steps

1. **Sign up** at EmailJS.com
2. **Create email service** with Gmail
3. **Create 2 email templates** (as shown above)
4. **Get your IDs** from EmailJS dashboard
5. **Update script.js** with your IDs
6. **Test** by submitting a report

## ✅ After Setup

Once configured:
- ✅ Every report goes to Telangana CM office
- ✅ You receive a copy for tracking
- ✅ Professional email delivery
- ✅ Image attachments included
- ✅ Location data preserved

## 📞 Support

- **EmailJS Documentation**: [docs.emailjs.com](https://docs.emailjs.com/)
- **GitHub Issues**: Report any technical problems
- **Test Emails**: Send test reports to verify setup

Your Public Issue Reporter will be fully functional with email delivery! 🎉
