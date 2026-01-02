# Branding Customization Guide

This guide explains how to customize the portal to match your organization's branding.

## Color Scheme

Edit `src/styles/index.css` to change the color scheme:

```css
:root {
  /* Primary Brand Colors - Update these */
  --primary-color: #2563eb;      /* Main brand color */
  --primary-dark: #1e40af;       /* Darker shade for hover states */
  --primary-light: #3b82f6;      /* Lighter shade for backgrounds */
  
  /* Secondary Colors */
  --secondary-color: #10b981;    /* Success/positive actions */
  --accent-color: #f59e0b;       /* Highlights and accents */
}
```

### Example Color Schemes

#### Green/Sustainable Theme
```css
--primary-color: #059669;       /* Emerald green */
--primary-dark: #047857;
--primary-light: #10b981;
--secondary-color: #84cc16;     /* Lime green */
--accent-color: #f59e0b;        /* Amber */
```

#### Blue/Professional Theme
```css
--primary-color: #0284c7;       /* Sky blue */
--primary-dark: #0369a1;
--primary-light: #0ea5e9;
--secondary-color: #6366f1;     /* Indigo */
--accent-color: #ec4899;        /* Pink */
```

#### Orange/Warm Theme
```css
--primary-color: #ea580c;       /* Orange */
--primary-dark: #c2410c;
--primary-light: #f97316;
--secondary-color: #eab308;     /* Yellow */
--accent-color: #dc2626;        /* Red */
```

## Logo

### Add Your Logo

1. Place your logo file in `public/logo.png`
2. Update `public/index.html`:

```html
<link rel="icon" href="%PUBLIC_URL%/logo.png" />
<link rel="apple-touch-icon" href="%PUBLIC_URL%/logo.png" />
```

3. Update the manifest in `public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "logo.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "logo-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Add Logo to Login Page

Edit `src/components/Login.tsx`:

```tsx
<div className="login-header">
  <img src="/logo.png" alt="Organization Logo" className="login-logo" />
  <h1>Supplier Impact Portal</h1>
  <p>View the impact of your food donations</p>
</div>
```

Add to `src/styles/Login.css`:

```css
.login-logo {
  width: 120px;
  height: auto;
  margin-bottom: var(--spacing-lg);
}
```

### Add Logo to Dashboard Header

Edit `src/components/Dashboard.tsx`:

```tsx
<header className="dashboard-header">
  <div className="header-left">
    <img src="/logo.png" alt="Logo" className="dashboard-logo" />
    <div>
      <h1>Welcome, {data?.supplierName}</h1>
      <p className="user-email">{email}</p>
    </div>
  </div>
  <button onClick={handleLogout} className="btn-logout">Logout</button>
</header>
```

Add to `src/styles/Dashboard.css`:

```css
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.dashboard-logo {
  width: 60px;
  height: auto;
}
```

## Typography

### Change Font Family

1. Import Google Font in `public/index.html`:

```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
```

2. Update `src/styles/index.css`:

```css
:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Popular Font Combinations

#### Modern/Tech
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```
```css
--font-family: 'Inter', sans-serif;
```

#### Professional/Corporate
```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
```
```css
--font-family: 'Roboto', sans-serif;
```

#### Friendly/Approachable
```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
```
```css
--font-family: 'Nunito', sans-serif;
```

## Custom Text and Labels

### Update Page Titles

Edit `src/components/Login.tsx`:

```tsx
<h1>Your Organization Name</h1>
<p>Custom tagline about your food donation program</p>
```

Edit `public/index.html`:

```html
<title>Your Organization - Supplier Portal</title>
<meta name="description" content="Custom description" />
```

### Update Dashboard Headings

Edit `src/components/Dashboard.tsx`:

```tsx
<h2>Your Impact This Year</h2>
<h2>Latest Contributions</h2>
<h2>Detailed Impact Analytics</h2>
```

### Update Stat Labels

```tsx
<div className="stat-label">Total Contributions</div>
<div className="stat-label">People Fed</div>
<div className="stat-label">Carbon Impact</div>
```

## Background and Layout

### Add Background Image to Login

Add to `src/styles/Login.css`:

```css
.login-container {
  background-image: url('/images/food-background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(37, 99, 235, 0.9) 0%, 
    rgba(30, 64, 175, 0.9) 100%
  );
}

.login-card {
  position: relative;
  z-index: 1;
}
```

### Add Pattern Background

```css
.dashboard-container {
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 35px, 
    rgba(0,0,0,.02) 35px, rgba(0,0,0,.02) 70px);
}
```

## Icons and Emojis

### Replace Stat Icons

Edit `src/components/Dashboard.tsx`:

```tsx
{/* Using custom icons */}
<div className="stat-icon">
  <img src="/icons/donations.svg" alt="" />
</div>

{/* Using FontAwesome (add to package.json) */}
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faUtensils, faLeaf } from '@fortawesome/free-solid-svg-icons';

<div className="stat-icon">
  <FontAwesomeIcon icon={faBox} />
</div>
```

## Email Template Customization

Edit `api/sendOTP/index.ts` to customize the OTP email:

```typescript
const emailMessage = {
  senderAddress: "supplier-portal@yourdomain.com",
  content: {
    subject: "🔐 Your Supplier Portal Access Code",
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; padding: 30px; text-align: center;">
            <img src="https://yourdomain.com/logo-white.png" alt="Logo" style="width: 150px;" />
          </div>
          
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h1 style="color: #1e293b; margin-bottom: 20px;">Welcome Back!</h1>
            <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
              You're one step away from viewing your impact dashboard.
            </p>
            
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); 
                        padding: 30px; text-align: center; border-radius: 12px; margin: 30px 0;">
              <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px;">Your verification code is:</p>
              <div style="font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">
                ${otpCode}
              </div>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
              This code expires in <strong>10 minutes</strong>.
            </p>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                If you didn't request this code, please ignore this email or contact support.
              </p>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © 2026 Your Organization Name. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `
  },
  recipients: {
    to: [{ address: email }]
  }
};
```

## Responsive Design

All styles are already responsive, but you can customize breakpoints:

```css
/* Tablet */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .login-card {
    padding: var(--spacing-lg);
  }
}
```

## Quick Branding Checklist

- [ ] Update primary colors in `src/styles/index.css`
- [ ] Add organization logo to `public/logo.png`
- [ ] Update page title in `public/index.html`
- [ ] Customize login header text
- [ ] Customize dashboard welcome message
- [ ] Update stat card labels
- [ ] Customize email template
- [ ] Add background image (optional)
- [ ] Change font family (optional)
- [ ] Update favicon
- [ ] Test on mobile devices
- [ ] Update README with organization info

## Example: Complete Rebrand

Here's a complete example for a fictional "FoodShare" organization:

1. Colors: Green theme (sustainable/food-focused)
2. Logo: Add `public/foodshare-logo.png`
3. Font: Nunito (friendly/approachable)
4. Tagline: "Together, we're ending food waste"

This creates a cohesive, professional appearance that matches your organization's identity.
