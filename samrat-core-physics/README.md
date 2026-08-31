# Samrat Core Physics - Premium Educational Website

A complete, modern, responsive website for **Samrat Core Physics** - a premium Physics tuition institute.

## 🚀 Features

### Public Website
- **Modern Hero Section** with video background, particles, and animated stats
- **About Section** with institute information and key features
- **Batch Information** with class tabs and detailed batch cards
- **Student Testimonials** with star ratings
- **Admission Form** with WhatsApp integration
- **Attendance Viewing** (read-only public access)
- **Gallery** with image overlay effects
- **Notice Board** for announcements
- **FAQ Section** with accordion toggle
- **Contact Form** with WhatsApp integration
- **Google Maps** location embed
- **Dark Mode / Light Mode** toggle
- **Floating WhatsApp Button**
- **Scroll-to-Top Button**
- **Smooth Animations** (AOS)
- **Fully Responsive** (Desktop, Tablet, Mobile)

### Admin Panel (Firebase Auth Protected)
- **Secure Login** with Firebase Authentication
- **Dashboard** with animated statistics
- **Student Management** (Add, Edit, Delete)
- **Attendance Management** (Mark Present/Absent, Edit, Delete)
- **Batch Management** (Create, Archive)
- **Attendance History** with date filtering
- **Student Search** and filtering
- **Export Attendance** as CSV/Excel
- **Reports & Analytics**

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, Animations
- **JavaScript (ES6+)** - Modular code, Async/Await
- **Firebase v10+** - Authentication, Firestore, Storage
- **Font Awesome 6** - Icons
- **AOS Library** - Scroll animations

## 📁 Project Structure

```
samrat-core-physics/
├── index.html              # Main website
├── pages/
│   └── admin.html          # Admin panel
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   ├── main.js             # Core JavaScript
│   ├── app.js              # Public app module
│   ├── admin.js            # Admin panel logic
│   ├── batches.js          # Batch data configuration
│   └── firebase/
│       └── firebase-config.js  # Firebase config
├── assets/
│   ├── images/
│   │   ├── logo.jpeg       # Institute logo
│   │   └── faculty.jpg     # Faculty photo
│   ├── videos/
│   │   └── hero.mp4        # Hero background video
│   └── icons/              # Additional icons
├── firestore.rules         # Firebase security rules
└── README.md               # This file
```

## 🔥 Firebase Setup

1. **Create a Firebase Project** at [console.firebase.google.com](https://console.firebase.google.com)
2. **Enable Authentication** (Email/Password)
3. **Create Firestore Database** in production mode
4. **Deploy Security Rules** from `firestore.rules`
5. **Add Admin User** in Firebase Authentication
6. **Update Config** in `js/firebase/firebase-config.js` if needed

## 🚦 Getting Started

1. Clone or download the project
2. Open `index.html` in a browser (no server required for public pages)
3. For admin panel, navigate to `pages/admin.html`
4. Login with admin credentials created in Firebase

## 📱 WhatsApp Integration

- Admission form submissions are sent via WhatsApp to +91 89816 38647
- Contact form messages are sent via WhatsApp
- No backend server required!

## 🎨 Color Palette

- **Primary Blue**: #1a237e
- **Secondary Orange**: #ff6f00
- **Accent Cyan**: #00bcd4
- **Dark Mode**: #0a0a1a

## 📄 License

© 2025 Samrat Core Physics. All rights reserved.

## 👨‍🏫 Contact

- **Phone**: +91 89816 38647
- **WhatsApp**: +91 89816 38647
- **Location**: Kestopur, Kolkata
