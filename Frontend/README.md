# Pharmalovo - Digital Health Platform

A production-ready multi-page web application revolutionizing medication access in Tunisia by connecting pharmacies and customers through real-time stock visibility, smart location-based search, online ordering, and secure digital payments.

## Features

### Core Functionality
- **Real-time Stock Visibility**: Browse medication availability across Tunisia pharmacies
- **Smart Location-based Search**: Find nearby pharmacies with distance calculations
- **Online Ordering**: Complete purchase flow with cart and checkout
- **Secure Digital Payments**: Multiple payment methods with bank-level encryption
- **Multi-language Support**: English and Arabic (RTL) with language switcher
- **Dark Mode**: Toggle between light and dark themes with localStorage persistence

### Pages
1. **Home**: Hero section, key statistics, features grid, testimonials, and CTA
2. **About**: Mission, vision, timeline, team, comparison table, and impact metrics
3. **Pharmacies**: Interactive map, pharmacy cards with filters, join form, and dashboard preview
4. **Search Medications**: Autocomplete search, results with filters, availability indicators
5. **For Customers**: Dashboard preview, features showcase, how-it-works guide, FAQ accordion
6. **Contact**: Contact form, information cards, WhatsApp support, map placeholder
7. **Login/Register**: Authentication forms with Google OAuth mock, user type selection
8. **Dashboard**: Unified dashboard for customers and pharmacies with order tracking, notifications

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

## Design System

### Color Palette
- **Primary**: #007BFF (Blue)
- **Accent**: #28A745 (Green)
- **Backgrounds**: White/Light Gray
- **Dark Mode**: Gray scale with adjusted contrasts

### Typography
- **Font**: Inter
- **Weights**: 300, 400, 500, 600, 700, 800

## Project Structure

```
src/
├── components/       # Reusable UI components (Button, Card, Input)
├── pages/           # Page components (Home, About, etc.)
├── layout/          # Layout components (Navbar, Footer)
├── data/            # Mock data (medications, pharmacies, testimonials)
├── contexts/        # React contexts (Language, Theme)
├── i18n/            # Translation files
├── lib/             # Supabase client and utilities
└── types/           # TypeScript type definitions
```

## Database Schema

### Tables
- **profiles**: User profiles with type (customer/pharmacy)
- **pharmacies**: Pharmacy information and location data
- **medications**: Medication inventory with pricing and availability
- **orders**: Order records with status tracking
- **order_items**: Individual items in orders
- **saved_medications**: User's saved/favorite medications
- **notifications**: User notifications
- **loyalty_points**: Customer loyalty program

### Security
- Row Level Security (RLS) enabled on all tables
- Policies for authenticated users to manage their own data
- Pharmacies can manage their own inventory
- Customers can view all data but only modify their own

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd pharmalovo
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Run development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

## Features Implementation

### Bilingual Support
- English (default) and Arabic with RTL support
- Language switcher in navbar
- Persistent language preference in localStorage
- Dynamic text direction and layout adjustments

### Dark Mode
- Toggle in navbar
- Persistent preference in localStorage
- Smooth transitions between themes
- Tailwind dark: classes for styling

### Tunisia-focused Defaults
- Tunis governorate as default location
- TND currency throughout the app
- +216 phone number format
- Tunisia map centered coordinates
- All 24 Tunisia governorates in dropdowns

### Mobile-first Design
- Responsive layouts for all screen sizes
- Touch-friendly UI elements
- Optimized images and lazy loading
- PWA-ready with manifest.json

### Accessibility
- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Sufficient color contrast ratios

## Mock Data

The application includes comprehensive mock data for demonstration:
- 8 medications across various categories
- 6 pharmacies with complete details
- 6 customer testimonials
- Order history and tracking data

All mock data is TypeScript-typed and ready for backend integration.

## API Integration

The project is structured for easy backend integration:
- Supabase client configured in `src/lib/supabase.ts`
- TypeScript types for all database entities
- Mock data matches database schema
- API calls ready to replace mock implementations

## SEO & PWA

### SEO Optimization
- Comprehensive meta tags
- Open Graph protocol
- Twitter Card support
- Descriptive page titles
- Structured semantic HTML

### PWA Features
- Web app manifest
- Mobile-friendly viewport
- Theme color configuration
- App icons configured

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright © 2026 Pharmalovo. All rights reserved.

## Contact

- Email: contact@pharmalovo.tn
- Phone: +216 71 123 456
- Address: Avenue Habib Bourguiba, Tunis 1000, Tunisia
