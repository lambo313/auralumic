# Auralumic MVP - Complete File Structure

```
Auralumic/
├── components.json                     # Shadcn/ui configuration file
├── .env.local                          # Environment variables
├── .env.example                        # Environment variables template
├── .gitignore                          # Git ignore rules
├── .eslintrc.json                      # ESLint configuration
├── .prettierrc                         # Prettier configuration
├── next.config.js                      # Next.js configuration
├── tailwind.config.js                  # Tailwind CSS configuration
├── postcss.config.js                   # PostCSS configuration
├── tsconfig.json                       # TypeScript configuration
├── package.json                        # Dependencies and scripts
├── README.md                           # Project documentation
├── middleware.ts                       # Next.js middleware for auth/routing
│
├── app/                                # Next.js 15 App Router
│   ├── globals.css                     # Global styles and Tailwind imports
│   ├── layout.tsx                      # Root layout with providers
│   ├── loading.tsx                     # Global loading component
│   ├── error.tsx                       # Global error component
│   ├── page.tsx                        # Landing page
│   ├── favicon.ico                     # Site favicon
│   │
│   ├── (auth)/                         # Auth route group
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx            # Clerk sign-in page
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx            # Clerk sign-up page
│   │
│   ├── dashboard/                      # General dashboard (redirects)
│   │   ├── layout.tsx                  # Dashboard layout
│   │   └── page.tsx                    # Dashboard redirect logic
│   │
│   ├── client/                         # Client-specific routes
│   │   ├── layout.tsx                  # Client layout with nav
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Client dashboard
│   │   ├── explore/
│   │   │   └── page.tsx                # Explore readers with tabs
│   │   ├── notifications/
│   │   │   └── page.tsx                # Client notifications
│   │   ├── readings/
│   │   │   ├── page.tsx                # Client readings management
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Individual reading details
│   │   ├── reading/
│   │   │   └── [readerId]/
│   │   │       └── page.tsx            # Reading booking flow
│   │   └── profile/
│   │       ├── page.tsx                # Client profile
│   │       └── edit/
│   │           └── page.tsx            # Edit client profile
│   │
│   ├── reader/                         # Reader-specific routes
│   │   ├── layout.tsx                  # Reader layout with nav
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Reader dashboard
│   │   ├── explore/
│   │   │   └── page.tsx                # Reader explore page
│   │   ├── notifications/
│   │   │   └── page.tsx                # Reader notifications
│   │   ├── readings/
│   │   │   ├── page.tsx                # Reader readings management
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Reading details and delivery
│   │   └── profile/
│   │       ├── page.tsx                # Reader profile management
│   │       └── edit/
│   │           └── page.tsx            # Edit reader profile
│   │
│   ├── admin/                          # Admin-only routes
│   │   ├── layout.tsx                  # Admin layout
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Admin dashboard
│   │   ├── users/
│   │   │   └── page.tsx                # User management
│   │   ├── readings/
│   │   │   └── page.tsx                # Reading oversight
│   │   ├── content/
│   │   │   └── page.tsx                # Content management
│   │   └── disputes/
│   │       └── page.tsx                # Dispute management
│   │
│   ├── onboarding/                     # User onboarding flow
│   │   ├── page.tsx                    # Onboarding start
│   │   ├── role-selection/
│   │   │   └── page.tsx                # Role selection
│   │   ├── profile-setup/
│   │   │   └── page.tsx                # Basic profile setup
│   │   └── reader-application/
│   │           └── page.tsx            # Reader application form
│   │
│   ├── api/                            # API routes
│   │   ├── auth/
│   │   │   └── webhook/
│   │   │       └── route.ts            # Clerk webhook handler
│   │   │
│   │   ├── users/
│   │   │   ├── route.ts                # User CRUD operations
│   │   │   ├── [id]/
│   │   │   │   └── route.ts            # Individual user operations
│   │   │   └── me/
│   │   │       └── route.ts            # Current user operations
│   │   │
│   │   ├── readers/
│   │   │   ├── route.ts                # Reader search and listing
│   │   │   ├── apply/
│   │   │   │   └── route.ts            # Reader application
│   │   │   ├── check-username/
│   │   │   │   └── route.ts            # Username availability
│   │   │   ├── search/
│   │   │   │   └── route.ts            # Reader search with filters
│   │   │   └── [id]/
│   │   │       ├── route.ts            # Individual reader operations
│   │   │       └── approve/
│   │   │           └── route.ts        # Reader approval (admin)
│   │   │
│   │   ├── readings/
│   │   │   ├── route.ts                # Reading CRUD operations
│   │   │   └── [id]/
│   │   │       ├── route.ts            # Individual reading operations
│   │   │       ├── accept/
│   │   │       │   └── route.ts        # Accept reading request
│   │   │       ├── decline/
│   │   │       │   └── route.ts        # Decline reading request
│   │   │       └── complete/
│   │   │           └── route.ts        # Complete reading
│   │   │
│   │   ├── notifications/
│   │   │   ├── route.ts                # Notification operations
│   │   │   └── [id]/
│   │   │       └── route.ts            # Mark notification as read
│   │   │
│   │   ├── credits/
│   │   │   ├── route.ts                # Credit operations
│   │   │   ├── purchase/
│   │   │   │   └── route.ts            # Purchase credit packages
│   │   │   └── balance/
│   │   │       └── route.ts            # Get credit balance
│   │   │
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   └── route.ts            # Admin user management
│   │   │   ├── readers/
│   │   │   │   └── route.ts            # Admin reader management
│   │   │   ├── readings/
│   │   │   │   └── route.ts            # Admin reading oversight
│   │   │   └── disputes/
│   │   │       └── route.ts            # Dispute management
│   │   │
│   │   ├── upload/
│   │   │   └── route.ts                # File upload handler
│   │   │
│   │   └── webhook/
│   │       └── stripe/
│   │           └── route.ts            # Stripe webhook handler
│   │
│
├── components/                         # Reusable UI components
│   ├── ui/                            # Shadcn/ui components (generated/customized)
│   │   ├── avatar.tsx                 # Avatar component
│   │   ├── badge.tsx                  # Badge component
│   │   ├── button.tsx                 # Button variants
│   │   ├── card.tsx                   # Card component
│   │   ├── checkbox.tsx               # Checkbox component
│   │   ├── command.tsx                # Command component
│   │   ├── dialog.tsx                 # Modal dialog
│   │   ├── dropdown-menu.tsx          # Dropdown menu component
│   │   ├── form.tsx                   # Form components
│   │   ├── input.tsx                  # Input field
│   │   ├── label.tsx                  # Form label
│   │   ├── pagination.tsx             # Pagination component
│   │   ├── popover.tsx                # Popover component
│   │   ├── progress.tsx               # Progress component
│   │   ├── radio-group.tsx            # Radio group component
│   │   ├── scroll-area.tsx            # Scroll area component
│   │   ├── select.tsx                 # Select dropdown
│   │   ├── separator.tsx              # Visual separator
│   │   ├── skeleton.tsx               # Loading skeleton
│   │   ├── switch.tsx                 # Toggle switch
│   │   ├── tabs.tsx                   # Tab component
│   │   ├── textarea.tsx               # Text area
│   │   ├── tooltip.tsx                # Tooltip component
│   │   └── with-safe-rendering.tsx    # Safe rendering wrapper
│   │
│   ├── layout/                        # Layout components
│   │   ├── app-header.tsx             # Main application header
│   │   ├── client-navigation.tsx      # Client-specific navigation
│   │   ├── reader-navigation.tsx      # Reader-specific navigation
│   │   ├── admin-navigation.tsx       # Admin-specific navigation
│   │   ├── landing-header.tsx         # Landing page header
│   │   └── mobile-menu.tsx            # Mobile menu overlay
│   │
│   ├── auth/                          # Authentication components
│   │   ├── auth-buttons.tsx           # Auth CTA buttons
│   │   ├── auth-guard.tsx             # Route protection
│   │   ├── role-guard.tsx             # Role-based access control
│   │   └── user-button.tsx            # User profile button
│   │
│   ├── readers/                       # Reader-related components
│   │   ├── reader-card.tsx            # Reader profile card
│   │   ├── reader-list.tsx            # List of readers
│   │   ├── reader-profile.tsx         # Full reader profile
│   │   ├── reader-connect.tsx         # Reader connection interface
│   │   ├── reader-attributes.tsx      # Reader attributes explorer
│   │   ├── reader-search.tsx          # Reader search functionality
│   │   ├── online-status.tsx          # Online status indicator
│   │   ├── rating-display.tsx         # Star rating display
│   │   └── reader-application-form.tsx # Reader application
│   │
│   ├── readings/                      # Reading-related components
│   │   ├── reading-booking-form.tsx   # Reading booking flow
│   │   ├── reading-card.tsx           # Reading display card
│   │   ├── reading-list.tsx           # List of readings
│   │   ├── reading-status.tsx         # Status indicator
│   │   ├── topic-selector.tsx         # Topic selection
│   │   └── review-form.tsx            # Reading review form
│   │
│   ├── clients/                       # Client-specific components
│   │   ├── client-dashboard.tsx       # Client dashboard layout
│   │   ├── client-status-creator.tsx  # Status creation
│   │   └── client-status-list.tsx     # Status management
│   │
│   ├── chat/                          # Chat and communication
│   │   ├── chat-interface.tsx         # Chat interface
│   │   └── message-list.tsx           # Message display
│   │
│   ├── notifications/                 # Notification components
│   │   ├── notification-list.tsx      # List of notifications
│   │   ├── notification-item.tsx      # Individual notification
│   │   └── notification-badge.tsx     # Unread count badge
│   │
│   ├── profile/                       # Profile components
│   │   ├── profile-form.tsx           # Profile editing form
│   │   ├── client-stats-dashboard.tsx # Client statistics
│   │   ├── reader-stats-dashboard.tsx # Reader statistics
│   │   ├── attribute-selector.tsx     # Attribute selection
│   │   └── badge-display.tsx          # User badges display
│   │
│   ├── payments/                      # Payment components
│   │   ├── credit-balance.tsx         # Credit balance display
│   │   ├── credit-purchase.tsx        # Credit purchase flow
│   │   ├── package-selector.tsx       # Credit package selection
│   │   └── payment-form.tsx           # Stripe payment form
│   │
│   └── admin/                         # Admin components
│       ├── admin-dashboard.tsx        # Admin dashboard
│       ├── user-state-switcher.tsx    # Admin user state switcher
│       ├── user-management.tsx        # User management interface
│       ├── reading-management.tsx     # Reading oversight
│       ├── content-management.tsx     # Content management
│       └── dispute-management.tsx     # Dispute resolution
│
├── lib/                               # Utility libraries and configurations
│   ├── auth.ts                        # Clerk authentication utilities
│   ├── database.ts                    # MongoDB connection and utilities
│   ├── stripe.ts                      # Stripe configuration
│   ├── validations.ts                 # Zod validation schemas
│   ├── utils.ts                       # Tailwind + clsx utilities (cn function)
│   ├── constants.ts                   # Application constants
│   ├── permissions.ts                 # Role-based permissions
│   ├── notifications.ts               # Notification utilities
│   ├── email.ts                       # Email service integration
│   ├── upload.ts                      # File upload utilities
│   └── cache.ts                       # Caching utilities
│
├── types/                             # TypeScript type definitions
│   ├── index.ts                       # Main type exports
│   ├── user.ts                        # User-related types
│   ├── reader.ts                      # Reader-related types
│   ├── reading.ts                     # Reading-related types
│   ├── post.ts                        # Post-related types
│   ├── notification.ts                # Notification types
│   ├── payment.ts                     # Payment-related types
│   ├── api.ts                         # API response types
│   └── database.ts                    # Database model types
│
├── hooks/                             # Custom React hooks
│   ├── use-auth.ts                    # Authentication state hook
│   ├── use-reader.ts                  # Reader data management
│   ├── use-readings.ts                # Reading management
│   ├── use-notifications.ts           # Notification management
│   ├── use-feed.ts                    # Feed data management
│   ├── use-credits.ts                 # Credit balance management
│   ├── use-debounce.ts                # Debounce utility hook
│   ├── use-local-storage.ts           # Local storage hook
│   └── use-infinite-scroll.ts         # Infinite scrolling hook
│
├── context/                           # React context providers
│   ├── auth-context.tsx               # Authentication context
│   ├── theme-context.tsx              # Theme management
│   ├── notification-context.tsx       # Real-time notifications
│   └── reader-context.tsx             # Reader state management
│
├── services/                          # External service integrations
│   ├── api.ts                         # API client configuration
│   ├── auth-service.ts                # Authentication service
│   ├── user-service.ts                # User operations
│   ├── reader-service.ts              # Reader operations
│   ├── reading-service.ts             # Reading operations
│   ├── post-service.ts                # Post operations
│   ├── notification-service.ts        # Notification operations
│   ├── payment-service.ts             # Payment processing
│   ├── upload-service.ts              # File upload service
│   └── email-service.ts               # Email notifications
│
├── data/                              # Static data and seeds
│   ├── attributes.json                # Default attributes data
│   ├── badges.json                    # Badge definitions
│   ├── credit-packages.json           # Credit package options
│   ├── categories.json                # Post categories
│   └── seed-data.json                 # Development seed data
│
├── styles/                            # Additional styles
│   ├── components.css                 # Component-specific styles
│   └── themes.css                     # Theme variations
│
├── public/                            # Static assets
│   ├── icons/                         # Lucide React icons (imported as needed)
│   │   └── index.ts                   # Icon re-exports for consistency
│   ├── images/                        # Static images
│   │   ├── logo.svg
│   │   ├── hero-bg.jpg
│   │   └── default-avatar.png
│   ├── favicon.ico                    # Site favicon
│   └── manifest.json                  # PWA manifest
│
├── docs/                              # Project documentation
│   ├── api-reference.md               # API documentation
│   ├── deployment.md                  # Deployment guide
│   ├── development.md                 # Development setup
│   └── contributing.md                # Contribution guidelines
│
└── tests/                             # Test files
    ├── __mocks__/                     # Test mocks
    │   ├── clerk.ts                   # Clerk mock
    │   └── stripe.ts                  # Stripe mock
    ├── components/                    # Component tests
    │   ├── feed/
    │   ├── readers/
    │   └── ui/
    ├── pages/                         # Page tests
    │   ├── feed.test.tsx
    │   ├── explore.test.tsx
    │   └── profile.test.tsx
    ├── services/                      # Service tests
    │   ├── auth-service.test.ts
    │   └── api.test.ts
    ├── utils/                         # Utility tests
    │   └── validations.test.ts
    ├── setup.ts                       # Test setup
    └── jest.config.js                 # Jest configuration
```

## Additional Configuration Files

### components.json (Shadcn/ui configuration)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom Auralumic colors
        'aura-base': 'rgb(9, 9, 9)',
        'aura-main': 'rgb(248, 248, 255)',
        'aura-accent-1': 'rgb(120, 120, 255)',
        'aura-accent-2': 'rgb(192, 192, 192)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(120, 120, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(120, 120, 255, 0.4)',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
}
```

### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### lib/utils.ts (Shadcn/ui utilities)
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Additional utility functions for Auralumic
export function formatCredits(credits: number): string {
  return credits.toLocaleString()
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString()
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString()
}
```

### Global CSS Updates (app/globals.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 248 248 255; /* aura-main */
    --foreground: 9 9 9; /* aura-base */
    --card: 248 248 255;
    --card-foreground: 9 9 9;
    --popover: 248 248 255;
    --popover-foreground: 9 9 9;
    --primary: 120 120 255; /* aura-accent-1 */
    --primary-foreground: 248 248 255;
    --secondary: 192 192 192; /* aura-accent-2 */
    --secondary-foreground: 9 9 9;
    --muted: 192 192 192;
    --muted-foreground: 9 9 9;
    --accent: 120 120 255;
    --accent-foreground: 248 248 255;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 192 192 192;
    --input: 192 192 192;
    --ring: 120 120 255;
    --radius: 0.75rem;
  }

  .dark {
    --background: 9 9 9; /* aura-base */
    --foreground: 248 248 255; /* aura-main */
    --card: 9 9 9;
    --card-foreground: 248 248 255;
    --popover: 9 9 9;
    --popover-foreground: 248 248 255;
    --primary: 120 120 255; /* aura-accent-1 */
    --primary-foreground: 9 9 9;
    --secondary: 192 192 192; /* aura-accent-2 */
    --secondary-foreground: 248 248 255;
    --muted: 31.5 31.5 31.5;
    --muted-foreground: 248 248 255;
    --accent: 120 120 255;
    --accent-foreground: 248 248 255;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 31.5 31.5 31.5;
    --input: 31.5 31.5 31.5;
    --ring: 120 120 255;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom Auralumic styles */
@layer components {
  .glow-box {
    @apply shadow-glow;
  }
  
  .glow-button {
    @apply shadow-glow hover:shadow-glow-lg transition-shadow duration-300;
  }
}
```

### Setup Commands for Development

```bash
# Install dependencies
npm install

# Initialize shadcn/ui (if not already done)
npx shadcn@latest init

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### package.json
```json
{
  "name": "created",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.864.0",
    "@aws-sdk/s3-request-presigner": "^3.864.0",
    "@clerk/nextjs": "^6.31.3",
    "@headlessui/react": "^2.2.7",
    "@heroicons/react": "^2.2.0",
    "@hookform/resolvers": "^5.2.1",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@stripe/react-stripe-js": "^3.9.1",
    "@stripe/stripe-js": "^7.8.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "framer-motion": "^12.23.12",
    "lucide-react": "^0.540.0",
    "mongoose": "^8.17.2",
    "next": "15.5.0",
    "nodemailer": "^7.0.5",
    "pusher": "^5.2.0",
    "pusher-js": "^8.4.0",
    "react": "19.1.0",
    "react-day-picker": "^9.9.0",
    "react-dom": "19.1.0",
    "react-hook-form": "^7.62.0",
    "stripe": "^18.4.0",
    "svix": "^1.74.1",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^4.0.17"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/forms": "^0.5.10",
    "@testing-library/jest-dom": "^6.7.0",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^20",
    "@types/nodemailer": "^7.0.1",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.17",
    "eslint": "^9",
    "eslint-config-next": "15.5.0",
    "jsdom": "^26.1.0",
    "mongodb": "^6.18.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "tw-animate-css": "^1.3.7",
    "typescript": "^5",
    "vitest": "^3.2.4"
  }
}
```

### Environment Variables (.env.example)
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_...

# Database
MONGODB_URI=mongodb://localhost:27017/auralumic
DATABASE_URL=mongodb://localhost:27017/auralumic

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=auralumic-uploads

# Pusher (real-time notifications)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster

# Email Service (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## File Structure Notes

### MVP Priority Files
For the MVP implementation, focus on these core files first:

1. **Authentication & Layout**: `/app/layout.tsx`, `/middleware.ts`, `/lib/auth.ts`
2. **Main Pages**: Feed, Explore, Notifications, Readings, Profile
3. **API Routes**: Users, Readers, Readings, Notifications, Payments
4. **Core Components**: UI components, Reader cards, Reading management
5. **Data Models**: User, Reader, Reading, Notification types

### Scalability Considerations
- Route groups organize related pages
- API routes follow RESTful conventions
- Components are organized by feature domain
- Services layer abstracts business logic
- Hooks provide reusable state management
- Type definitions ensure type safety

### Development Workflow
1. Start with basic authentication and user management
2. Implement core data models and API routes
3. Build essential UI components
4. Add main application pages
5. Integrate payment processing
6. Implement notification system
7. Add admin functionality
8. Testing and optimization

This structure provides a solid foundation for the MVP while maintaining flexibility for future enhancements and scaling.