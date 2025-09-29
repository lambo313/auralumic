# Auralumic - Psychic Reading Platform 🔮

A modern, full-stack psychic reading platform connecting clients with professional readers through an intuitive, secure, and feature-rich interface.

## 🌟 Overview

Auralumic is a comprehensive platform that enables clients to connect with psychic readers for personalized readings. The platform supports multiple user roles, real-time communications, secure payments, and a sophisticated matching system between clients and readers.

### Key Features

- **Multi-Role System**: Clients, Readers/Consultants, and Administrators
- **Real-Time Communications**: Live notifications and status updates
- **Secure Payments**: Stripe integration with credit-based system
- **Advanced Matching**: Client status system with suggested readings
- **Professional Tools**: Reader applications, earnings tracking, and performance analytics
- **Admin Oversight**: Complete platform management and dispute resolution

## 🚀 Technology Stack

### Core Framework
- **Next.js 15.5.0** - App Router with React Server Components
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.x** - Full type safety throughout the application

### Authentication & Database
- **Clerk 6.31.3** - Complete authentication solution
- **MongoDB 6.18.0** - NoSQL database with Mongoose 8.17.2 ODM
- **Prisma** - Type-safe database client and migrations

### UI & Styling
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library built on Radix UI
- **Radix UI** - Accessible component primitives
- **Lucide React 0.540.0** - Beautiful SVG icon library
- **Framer Motion 12.23.12** - Smooth animations and transitions

### Payments & External Services
- **Stripe 18.4.0** - Payment processing and subscriptions
- **AWS S3** - File storage and content delivery
- **Pusher 5.2.0** - Real-time notifications and presence
- **Nodemailer 7.0.5** - Email notifications

### Development & Testing
- **Vitest 3.2.4** - Fast unit testing framework
- **Testing Library** - Component testing utilities
- **ESLint** - Code linting and formatting
- **Zod 4.0.17** - Runtime type validation

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB database (local or cloud)
- Stripe account for payments
- Clerk account for authentication
- AWS S3 bucket for file storage
- Pusher account for real-time features

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database
MONGODB_URI=mongodb://localhost:27017/auralumic
DATABASE_URL=mongodb://localhost:27017/auralumic

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3 Storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=auralumic-uploads

# Pusher Real-time
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_KEY=your_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/lambo313/auralumic.git
   cd auralumic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Initialize the database**
   ```bash
   # Ensure MongoDB is running, then seed initial data
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Application Structure

### User Roles & Access

#### 🧑‍💼 Client
- Browse and connect with readers
- Purchase credits and book readings
- Post status updates for reader suggestions
- Manage reading history and reviews

#### 🔮 Reader/Consultant
- All client features plus:
- Create professional profile with attributes
- Accept/decline reading requests
- Manage availability and pricing
- Track earnings and performance

#### 👨‍💼 Administrator
- Platform oversight and user management
- Approve/decline reader applications
- Handle disputes and quality control
- Access comprehensive analytics

### Core Pages

| Route | Purpose | Access |
|-------|---------|---------|
| `/` | Landing page and marketing | Public |
| `/dashboard` | Role-specific dashboard | Authenticated |
| `/client/explore` | Discover and connect with readers | Client |
| `/reader/explore` | Reader community and client statuses | Reader |
| `/notifications` | Real-time notification center | All Users |
| `/client/readings` | Reading management | Client |
| `/reader/readings` | Reading requests and delivery | Reader |
| `/profile` | Profile management | All Users |
| `/admin/*` | Administrative functions | Admin Only |

## 🎨 Design System

### Color Palette
- **Base**: `rgb(9, 9, 9)` - Deep dark for text and contrasts
- **Main**: `rgb(248, 248, 255)` - Clean light background
- **Accent 1**: `rgb(120, 120, 255)` - Primary brand color with glow effects
- **Accent 2**: `rgb(192, 192, 192)` - Secondary accent for highlights

### Key Design Features
- Light and dark mode support
- Glowing accent shadows on interactive elements
- Generous use of Lucide icons throughout
- Responsive mobile-first design
- Smooth animations with Framer Motion

## 🏗 Architecture

### Project Structure
```
auralumic/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── client/            # Client-specific pages
│   ├── reader/            # Reader-specific pages
│   ├── admin/             # Admin-only pages
│   ├── api/               # API routes and webhooks
│   └── onboarding/        # User onboarding flow
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui base components
│   ├── auth/             # Authentication components
│   ├── readers/          # Reader-related components
│   ├── readings/         # Reading management components
│   └── layout/           # Layout and navigation
├── lib/                  # Utilities and configurations
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
├── services/            # API and external service integrations
├── data/               # Static data and seed files
└── public/             # Static assets
```

### API Design

RESTful API endpoints with consistent patterns:
- `GET /api/users` - List users with pagination
- `POST /api/readers/apply` - Submit reader application
- `PUT /api/readings/{id}/accept` - Accept reading request
- `DELETE /api/notifications/{id}` - Mark notification as read

All endpoints include:
- Authentication via Clerk
- Role-based access control
- Input validation with Zod
- Proper error handling
- Rate limiting

## 💳 Business Model

### Credit System
- **Base Rate**: 1 credit = 1 minute of reading time
- **Packages**: Multiple credit packages with bulk discounts
- **Subscriptions**: Monthly plans with included credits
- **Earnings**: Readers earn credits for completed readings

### Revenue Streams
1. Credit package sales to clients
2. Subscription fees for premium features
3. Platform commission on completed readings
4. Premium reader placement and promotion

## 🔐 Security Features

- **Authentication**: Secure JWT tokens via Clerk
- **Authorization**: Role-based access control middleware
- **Data Protection**: Input validation and sanitization
- **Payment Security**: PCI-compliant Stripe integration
- **File Uploads**: Secure S3 storage with signed URLs
- **API Security**: Rate limiting and CORS configuration

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Component logic and utilities
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Load testing for scalability

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### Build & Deploy
```bash
# Create production build
npm run build

# Start production server
npm start
```

### Recommended Platforms
- **Vercel** - Optimal for Next.js applications
- **AWS** - Full control with EC2/ECS deployment
- **Railway** - Simple deployment with database included

### Environment Setup
1. Configure production environment variables
2. Set up MongoDB Atlas or equivalent
3. Configure Stripe live mode
4. Set up AWS S3 production bucket
5. Configure email service (SendGrid, AWS SES)

## 📊 Analytics & Monitoring

### Built-in Analytics
- User engagement tracking
- Reader performance metrics
- Reading completion rates
- Revenue and payment analytics
- Platform health monitoring

### Integration Ready
- Google Analytics 4
- Mixpanel for event tracking
- Sentry for error monitoring
- LogRocket for session replay

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request
5. Code review and merge

### Code Standards
- TypeScript for all new code
- ESLint configuration enforcement
- Comprehensive test coverage
- Accessible UI components

## 📚 Documentation

- **[API Reference](./docs/api-reference.md)** - Complete API documentation
- **[Deployment Guide](./docs/deployment.md)** - Production deployment instructions
- **[Development Setup](./docs/development.md)** - Local development guide
- **[Architecture Overview](./auralumic_specs.md)** - Detailed technical specifications

## 🐛 Issues & Support

- **Bug Reports**: Use GitHub Issues with bug template
- **Feature Requests**: Use GitHub Issues with feature template
- **Security Issues**: Email security@auralumic.com
- **General Support**: Check documentation or open discussion

## 📄 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

Built with modern web technologies:
- [Next.js](https://nextjs.org/) - The React framework for production
- [Clerk](https://clerk.com/) - Authentication and user management
- [Stripe](https://stripe.com/) - Payment processing
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful component library

---

**Auralumic** - Connecting souls through authentic psychic experiences ✨
