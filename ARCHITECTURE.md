# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Supplier Browser                          │
│                     (React Single Page App)                      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                   Azure Static Web Apps                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Static Content (HTML, CSS, JS, Images)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Azure Functions (API)                                    │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │  │
│  │  │  sendOTP    │  │  verifyOTP   │  │ getSupplierData│ │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘ │  │
│  │  ┌─────────────┐                                          │  │
│  │  │getPowerBI   │                                          │  │
│  │  │   Token     │                                          │  │
│  │  └─────────────┘                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────┬───────────────────┬───────────────────┬──────────────┘
          │                   │                   │
          │                   │                   │
    ┌─────▼─────┐      ┌─────▼──────┐     ┌─────▼──────┐
    │  Azure    │      │  Supplier  │     │  PowerBI   │
    │Communication│     │  Database  │     │  Service   │
    │  Services │      │  (SQL)     │     │  (Reports) │
    └───────────┘      └────────────┘     └────────────┘
         │                   │                   │
         │                   │                   │
    ┌────▼──────┐      ┌────▼────────┐    ┌────▼────────┐
    │   Email   │      │ Suppliers   │    │ Row-Level   │
    │  Delivery │      │ Donations   │    │  Security   │
    └───────────┘      └─────────────┘    └─────────────┘
```

## Authentication Flow

```
┌─────────┐                              ┌──────────┐
│Supplier │                              │   API    │
└────┬────┘                              └─────┬────┘
     │                                         │
     │  1. Enter Email                        │
     ├────────────────────────────────────────►
     │                                         │
     │                                    2. Validate
     │                                    3. Generate OTP
     │                                    4. Store OTP
     │                                         │
     │                                    ┌────▼────┐
     │                                    │  Azure  │
     │                                    │Comm Svc │
     │                                    └────┬────┘
     │                                         │
     │  5. OTP Sent (200 OK)                  │
     ◄────────────────────────────────────────┤
     │                                         │
     │  ┌─────────┐                           │
     │  │  Email  │◄──────────────────────────┘
     │  │ 123456  │
     │  └─────────┘
     │
     │  6. Enter OTP Code (123456)
     ├────────────────────────────────────────►
     │                                         │
     │                                    7. Verify OTP
     │                                    8. Delete OTP
     │                                    9. Generate JWT
     │                                         │
     │  10. JWT Token + AccountId             │
     ◄────────────────────────────────────────┤
     │                                         │
     │  11. Navigate to Dashboard             │
     │                                         │
```

## Data Access Flow (Row-Level Security)

```
┌─────────┐                 ┌──────────┐              ┌──────────┐
│Dashboard│                 │   API    │              │ Database │
└────┬────┘                 └─────┬────┘              └─────┬────┘
     │                            │                         │
     │  1. Request Data           │                         │
     │     (with JWT token)       │                         │
     ├───────────────────────────►│                         │
     │                            │                         │
     │                       2. Verify JWT                  │
     │                       3. Extract AccountId           │
     │                            │                         │
     │                            │  4. Query with Filter   │
     │                            │     WHERE AccountId=X   │
     │                            ├────────────────────────►│
     │                            │                         │
     │                            │                    5. Filter Data
     │                            │                    (RLS Applied)
     │                            │                         │
     │                            │  6. Return Filtered Data│
     │                            │◄────────────────────────┤
     │                            │                         │
     │  7. Supplier-Specific Data │                         │
     │◄───────────────────────────┤                         │
     │                            │                         │
```

## PowerBI Embedding Flow

```
┌──────────┐              ┌──────────┐              ┌──────────┐
│Dashboard │              │   API    │              │ PowerBI  │
└─────┬────┘              └─────┬────┘              └─────┬────┘
      │                         │                         │
      │  1. Request PowerBI     │                         │
      │     Token (JWT)         │                         │
      ├────────────────────────►│                         │
      │                         │                         │
      │                    2. Verify JWT                  │
      │                    3. Extract AccountId           │
      │                         │                         │
      │                         │  4. Request Embed Token │
      │                         │     + RLS Identity      │
      │                         │     (AccountId)         │
      │                         ├────────────────────────►│
      │                         │                         │
      │                         │                    5. Generate
      │                         │                    Embed Token
      │                         │                    with RLS
      │                         │                         │
      │                         │  6. Embed Token         │
      │                         │◄────────────────────────┤
      │                         │                         │
      │  7. Token + Embed URL   │                         │
      │◄────────────────────────┤                         │
      │                         │                         │
      │  8. Load Report (token) │                         │
      ├─────────────────────────┼────────────────────────►│
      │                         │                         │
      │                         │                    9. Apply RLS
      │                         │                    Filter by
      │                         │                    AccountId
      │                         │                         │
      │  10. Filtered Report    │                         │
      │◄────────────────────────┼─────────────────────────┤
      │                         │                         │
```

## Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Login Page
│       │   ├── Email Input Form
│       │   └── OTP Verification Form
│       │
│       └── Dashboard Page (Protected)
│           ├── Header
│           │   ├── Logo
│           │   ├── Welcome Message
│           │   └── Logout Button
│           │
│           ├── Impact Summary
│           │   └── Stats Cards (3)
│           │       ├── Total Donations
│           │       ├── Meals Provided
│           │       └── CO₂ Saved
│           │
│           ├── Recent Donations Table
│           │   └── Donation Rows
│           │
│           └── PowerBI Section
│               ├── Toggle Button
│               └── PowerBI Embed Component
│                   └── Embedded Report
```

## Security Layers

```
┌────────────────────────────────────────────────────────────┐
│  Layer 1: Email Verification                               │
│  - OTP sent to registered email only                       │
│  - Verifies supplier identity                              │
└────────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────────┐
│  Layer 2: JWT Authentication                               │
│  - Session token with expiration                           │
│  - Contains AccountId claim                                │
│  - Required for all data access                            │
└────────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────────┐
│  Layer 3: API Authorization                                │
│  - Token verification on every request                     │
│  - AccountId extraction and validation                     │
└────────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────────┐
│  Layer 4: Database Row-Level Security                      │
│  - All queries filter by AccountId                         │
│  - No cross-supplier data leakage                          │
└────────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────────┐
│  Layer 5: PowerBI Row-Level Security                       │
│  - Embed tokens include RLS identity                       │
│  - DAX filters by AccountId                                │
│  - Enforced at dataset level                               │
└────────────────────────────────────────────────────────────┘
```

## Data Model

```
┌─────────────────────┐
│     Suppliers       │
├─────────────────────┤
│ AccountId (PK)      │
│ SupplierName        │
│ Email               │
│ Phone               │
│ Address             │
│ Status              │
│ CreatedDate         │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│     Donations       │
├─────────────────────┤
│ DonationId (PK)     │
│ AccountId (FK)      │
│ DonationDate        │
│ Items               │
│ WeightKg            │
│ MealsProvided       │
│ CO2SavedKg          │
│ Category            │
│ Notes               │
└─────────────────────┘
```

## File Structure

```
supplier-impact-portal/
│
├── public/                      # Static assets
│   ├── index.html              # HTML template
│   ├── manifest.json           # PWA manifest
│   └── logo.png                # Organization logo
│
├── src/                        # React application
│   ├── components/             # React components
│   │   ├── Login.tsx          # Authentication UI
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   └── PowerBIEmbed.tsx   # PowerBI integration
│   │
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx    # Auth state management
│   │
│   ├── services/               # API clients
│   │   └── api.ts             # API service layer
│   │
│   ├── styles/                 # CSS styling
│   │   ├── index.css          # Global styles + variables
│   │   ├── Login.css          # Login page styles
│   │   ├── Dashboard.css      # Dashboard styles
│   │   └── PowerBIEmbed.css   # PowerBI styles
│   │
│   ├── types/                  # TypeScript types
│   │   └── index.ts           # Type definitions
│   │
│   ├── App.tsx                 # Root component
│   └── index.tsx               # Entry point
│
├── api/                        # Azure Functions
│   ├── sendOTP/               # Send OTP email
│   │   └── index.ts
│   │
│   ├── verifyOTP/             # Verify OTP code
│   │   └── index.ts
│   │
│   ├── getSupplierData/       # Get supplier data
│   │   └── index.ts
│   │
│   ├── getPowerBIToken/       # Generate PowerBI token
│   │   └── index.ts
│   │
│   ├── host.json              # Functions configuration
│   ├── package.json           # API dependencies
│   └── tsconfig.json          # TypeScript config
│
├── .github/                    # GitHub workflows
│   └── workflows/
│       └── azure-static-web-apps.yml
│
├── package.json                # Frontend dependencies
├── tsconfig.json               # TypeScript config
├── staticwebapp.config.json    # Azure SWA config
│
└── Documentation/
    ├── README.md               # Overview
    ├── QUICKSTART.md           # Quick start guide
    ├── DEPLOYMENT.md           # Deployment guide
    ├── DATABASE-INTEGRATION.md # Database setup
    ├── POWERBI-RLS-SETUP.md    # PowerBI config
    ├── BRANDING-GUIDE.md       # Customization
    ├── SECURITY.md             # Security info
    └── ARCHITECTURE.md         # This file
```

## Technology Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **PowerBI**: powerbi-client-react
- **Styling**: CSS (Custom variables)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Azure Functions v4
- **Language**: TypeScript
- **Authentication**: JWT (jsonwebtoken)
- **Email**: Azure Communication Services

### Infrastructure
- **Hosting**: Azure Static Web Apps
- **API**: Azure Functions (integrated)
- **Database**: SQL Server / Azure SQL
- **Reporting**: PowerBI Embedded
- **Email**: Azure Communication Services

### DevOps
- **CI/CD**: GitHub Actions
- **CLI**: Azure Static Web Apps CLI
- **Package Manager**: npm

## Environment Variables

```
Frontend (Build-time):
- None required (all dynamic)

Backend (Runtime):
- COMMUNICATION_SERVICES_CONNECTION_STRING
- SENDER_EMAIL
- POWERBI_CLIENT_ID
- POWERBI_CLIENT_SECRET
- POWERBI_TENANT_ID
- POWERBI_WORKSPACE_ID
- POWERBI_REPORT_ID
- POWERBI_DATASET_ID
- SESSION_SECRET
- DATABASE_CONNECTION_STRING (or DB_*)
```

## API Endpoints

```
POST /api/sendOTP
  Request:  { email: string }
  Response: { message: string }

POST /api/verifyOTP
  Request:  { email: string, code: string }
  Response: { token: string, accountId: string, email: string }

GET /api/getSupplierData
  Headers:  Authorization: Bearer <token>
  Response: { accountId, supplierName, totalDonations, ... }

GET /api/getPowerBIToken
  Headers:  Authorization: Bearer <token>
  Response: { token, embedUrl, reportId, expiration }
```

## Deployment Environments

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Development  │      │   Staging    │      │  Production  │
├──────────────┤      ├──────────────┤      ├──────────────┤
│ localhost    │      │ Azure SWA    │      │ Azure SWA    │
│              │      │ (preview)    │      │ (custom URL) │
│ Mock data    │      │ Test DB      │      │ Prod DB      │
│ Dev OTP      │      │ Real emails  │      │ Real emails  │
│ No auth      │      │ Basic auth   │      │ Full auth    │
└──────────────┘      └──────────────┘      └──────────────┘
```

## Scaling Considerations

### Current Setup (MVP)
- Single region deployment
- In-memory OTP storage
- No caching
- Direct database queries

### Production Recommendations
- Multi-region deployment with Traffic Manager
- Redis for OTP storage and caching
- CDN for static assets
- Database connection pooling
- API rate limiting
- Application Insights monitoring
- Auto-scaling for Functions

### Performance Targets
- Page load: < 2 seconds
- API response: < 500ms
- PowerBI embed: < 3 seconds
- OTP delivery: < 30 seconds
- Concurrent users: 1000+

This architecture provides a secure, scalable foundation for your supplier impact portal with clear separation of concerns and multiple security layers.
