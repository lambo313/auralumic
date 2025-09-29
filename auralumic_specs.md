# Auralumic - Psychic Reading Platform
## Product Requirements Document

### Technology Stack (Current Implementation)
- **Framework**: Next.js 15.5.0 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.1 with custom design system
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Icons**: Lucide React 0.540.0
- **Database**: MongoDB 6.18.0 with Mongoose 8.17.2
- **Authentication**: Clerk 6.31.3
- **Payment Processing**: Stripe 18.4.0
- **Real-time**: Pusher 5.2.0 for live notifications
- **File Storage**: AWS S3 with SDK 3.864.0
- **Email Service**: Nodemailer 7.0.5
- **Form Handling**: React Hook Form 7.62.0 with Zod 4.0.17
- **Animation**: Framer Motion 12.23.12
- **Testing**: Vitest 3.2.4 with Testing Library

### Design System

#### Color Palette
- **Base Color**: RGB(9, 9, 9) / #090909
- **Main Color**: RGB(248, 248, 255) / #F8F8FF
- **Accent Color 1**: RGB(120, 120, 255) / #7878FF
- **Accent Color 2**: RGB(192, 192, 192) / #C0C0C0

#### Design Requirements
- Light and dark mode support
- Glowing accent color drop shadows on containers and buttons
- Generous use of icons throughout the application
- Responsive design for mobile and desktop

### User Roles & States

#### 1. Client
- Can view free Public Readings
- Can purchase Private Readings using credits
- Can purchase credit packages or subscriptions
- Access to Client-specific features

#### 2. Reader/Consultant
- Can provide Readings (services)
- Has access to both Client and Reader user states
<!-- - Can post Public Readings -->
- Can offer Private Reading services
- Earnings tracking and profile management

#### 3. Administrator
- Full CRUD capabilities for Categories, Attributes, and Badges
- Approves/declines Reader sign-ups
- Manages disputes and platform oversight
- Access to all user management features

### Application Structure

#### Landing Page
**Route**: `/home`
- Marketing page for non-authenticated users
- Sign-up/login prompts
- Feature highlights and testimonials

#### Header Navigation
**Component**: Pinned header bar
- **Left**: Online status toggle (Reader/Consultant state only)
- **Center**: Auralumic logo
- **Right**: Login/logout button with dropdown account settings

#### Footer Navigation
**Component**: Bottom navigation with 5 equally spaced icons (role-specific)
1. Dashboard
2. Explore
2. Notifications  
3. Readings
4. Profile

### Main Application Pages

#### 1. Dashboard (`/dashboard`)
**Purpose**: Role-specific dashboard that redirects to appropriate interface

**Features**:
- **Client Dashboard**: Status management, recent readings, reader recommendations
- **Reader Dashboard**: Reading requests, earnings, profile analytics
- **Admin Dashboard**: Platform oversight, user management, dispute resolution
- **Automatic Routing**: Based on user role after authentication

#### 2. Explore (`/client/explore` & `/reader/explore`)
**Purpose**: Discover and connect with Readers

**Two Main Tabs**:

**Tab 1: Connect**
- **Filter Toggles**:
  - "Online Now"
  - "Favorites"
- **Reader Profile Cards** (vertical list):
  - Clickable profile image
  - Active attributes display
  - Online status indicator
  - Average rating (stars)
  - Clickable heart (favorite toggle)
  - Reading types offered
  - Click to initiate reading request

**Reading Request Flow** (Multi-step form):
1. **Scheduling**: Immediate or scheduled (date, time, duration)
2. **Delivery**: Reading option type, reader selection
3. **Question**: Topic selection, question text box (optional for general readings)
4. **Summary**: Review request details
5. **Submitted**: Confirmation and payment

**Tab 2: Attributes**
- **Sub-tabs**:
  - **Tools**: Including "Astrology" and others
  - **Abilities**: Psychic abilities and skills
  - **Style**: Reading approach and communication style

**Client Status Feature**:
- **Status Creation**: Clients can post their current situation/question
- **Suggested Readings**: Readers can suggest personalized readings for client statuses
- **Status Categories**: Love, Career, Spiritual, General guidance
- **Status Lifecycle**: Active (accepting suggestions) → Closed (suggestion accepted)
- **Reader Responses**: Include suggested reading type, duration, price, and personal message

**Caching**: Updates every hour

#### 3. Notifications (`/notifications`)
**Purpose**: User-specific notification center

**Dynamic Content per User Role**:

**Clients Receive**:
- Reading request status (accepted/declined/completed)
- New suggested readings for their status posts
- Credit purchase confirmations
- Reading reminders

**Readers Receive**:
- New reading requests
- New client status posts matching their specialties
- Application approval/rejection notifications
- Earnings notifications

**Administrators Receive**:
- New reader applications requiring review
- Dispute notifications
- System alerts and platform metrics

**Features**:
- Pagination for performance
- Real-time updates
- Mark as read functionality

#### 4. Readings (`/client/readings` & `/reader/readings`)
**Purpose**: Manage reading history and requests

**Three Tab States**:
1. **Accepted**: Confirmed readings
2. **Requested**: Pending readings
3. **Archived**: Completed/cancelled readings

**Features**:
- Pagination for each tab
- Vertical list of reading cards
- View button for detailed information
- Status tracking and updates

#### 5. Profile (`/client/profile` & `/reader/profile`)
**Purpose**: Client profile management and reader discovery

**General Features**:
- Search bar for finding reader profiles
- Dynamic content based on user state

**Reader State Profile** (Full CRUD capabilities):
- **Basic Information**:
  - Profile picture (default from Clerk auth)
  - Background image
  - Tagline
  - Location

- **Professional Attributes**:
  - Tools (maximum 3)
  - Abilities (maximum 3)  
  - Style (maximum 1)

- **Availability Management**:
  - Online status toggle
  - Calendar for scheduled readings
  - Booking preferences

- **Performance Tracking**:
  - Readings completed (comprehensive chart/table)
  - Attributes dropdown (abilities, style, tools)
  - Time period columns:
    - This week
    - Last week
    - This month
    - Last month
    - Last 3 months
    - Last 6 months
    - Total
  - Credits earned tracking
  - Reviews and ratings
  - Posts analytics

- **Service Offerings**:
  - **Reading Types**:
    - Phone call
    - Video message (pre-recorded)
    - Live video
  - Pricing management
  - Service descriptions

### Data Models

#### User Roles
```typescript
enum UserRole {
  CLIENT = 'client',
  READER = 'reader',
  ADMIN = 'admin'
}
```

#### Reading Topics
```typescript
enum Topic {
  CAREER_WORK = 'Career & Work',
  LOST_SEEKING = 'Lost & Seeking',
  LOVE_RELATIONSHIPS = 'Love & Relationships',
  PAST_LIFE = 'Past Life',
  LIFE_PATH = 'Life Path',
  FUTURE_LIFE = 'Future Life'
}
```

#### Attributes
```typescript
{
  "Abilities": [
    "Dream Analysis",
    "Channeling", 
    "Empath",
    "Clairaudient",
    "Clairvoyant",
    "Scrying",
    "Medium",
    "Clairsentient"
  ],
  "Tools": [
    "Runes",
    "Crystal Energy", 
    "Astrology",
    "No Tools",
    "Pendulum",
    "Oracle Cards",
    "I-Ching",
    "Numerology",
    "Tarot"
  ],
  "Styles": [
    "Compassionate",
    "Inspirational", 
    "Straightforward"
  ]
}
```

#### Badges
```typescript
interface Badge {
  id: string;
  name: string;
  attribute: string; // Reference to ability, tool, or style
  tier: "Bronze" | "Silver" | "Gold";
  requirements: {
    readingsCompleted: number;
    averageRating?: number;
    timeframe?: string;
  };
  icon: string;
  description: string;
}
```



#### Notifications
```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdDate: Date;
  relatedId?: string; // ID of related reading, post, etc.
  actionUrl?: string;
}

enum NotificationType {
  READING_REQUEST = "reading_request",
  READING_ACCEPTED = "reading_accepted",
  READING_DECLINED = "reading_declined", 
  READING_COMPLETED = "reading_completed",
  SUGGESTED_READING = "suggested_reading",
  STATUS_RESPONSE = "status_response",
  APPLICATION_APPROVED = "application_approved",
  APPLICATION_DECLINED = "application_declined",
  CREDITS_PURCHASED = "credits_purchased",
  DISPUTE_FILED = "dispute_filed"
}
```

#### ReadingOptions
```typescript
interface ReadingOption {
  id: string;
  type: "phone_call" | "video_message" | "live_video";
  name: string;
  description: string;
  duration: number; // in minutes
  price: number; // in credits
  isActive: boolean;
}
```

#### ReadingStatus
```typescript
enum ReadingStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded'
}
```

#### Client Status System
```typescript
interface Status {
  id: string;
  userId: string; // Client who posted
  content: string;
  mood?: string;
  category?: string; // "love", "career", "spiritual", "general"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  suggestedReadings: SuggestedReading[];
  acceptedSuggestedReadingId?: string;
}

interface SuggestedReading {
  id: string;
  statusId: string;
  readerId: string;
  readerName: string;
  title: string;
  description: string;
  suggestedType: string;
  estimatedDuration: number;
  suggestedPrice?: number;
  message?: string;
  isAccepted: boolean;
  createdAt: Date;
}
```#### Client Status System
```typescript
interface Status {
  id: string;
  userId: string; // Client who posted
  content: string;
  mood?: string;
  category?: string; // "love", "career", "spiritual", "general"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  suggestedReadings: SuggestedReading[];
  acceptedSuggestedReadingId?: string;
}

interface SuggestedReading {
  id: string;
  statusId: string;
  readerId: string;
  readerName: string;
  title: string;
  description: string;
  suggestedType: string;
  estimatedDuration: number;
  suggestedPrice?: number;
  message?: string;
  isAccepted: boolean;
  createdAt: Date;
}
```

#### ReadingTimeSpans
```typescript
interface ReadingTimeSpan {
  id: string;
  duration: number; // in minutes
  label: string; // "15 minutes", "30 minutes", etc.
  multiplier: number; // Price multiplier
}
```

#### PsychicReaders
```typescript
interface PsychicReader {
  id: string;
  userId: string; // Clerk user ID
  profileImage: string;
  backgroundImage?: string;
  tagline: string;
  location: string;
  isOnline: boolean;
  isApproved: boolean;
  attributes: {
    tools: string[]; // max 3
    abilities: string[]; // max 3  
    style: string; // max 1
  };
  availability: {
    schedule: WeeklySchedule;
    timezone: string;
    instantBooking: boolean;
  };
  stats: {
    totalReadings: number;
    averageRating: number;
    totalEarnings: number;
    completionRate: number;
  };
  readingOptions: ReadingOption[];
  badges: string[]; // Badge IDs
  reviews: Review[];
  createdDate: Date;
  lastActive: Date;
}
```

#### Topics
```typescript
enum Topic {
  CAREER_WORK = "Career & Work",
  LOST_SEEKING = "Lost & Seeking", 
  LOVE_RELATIONSHIPS = "Love & Relationships",
  PAST_LIFE = "Past Life",
  LIFE_PATH = "Life Path",
  FUTURE_LIFE = "Future Life"
}
```

#### Additional Models

#### User
```typescript
interface User {
  id: string; // Clerk user ID
  email: string;
  role: UserRole;
  credits: number;
  subscriptionId?: string;
  preferences: UserPreferences;
  createdDate: Date;
  lastLogin: Date;
}

enum UserRole {
  CLIENT = "client",
  READER = "reader", 
  ADMIN = "admin"
}
```

#### Reading
```typescript
interface Reading {
  id: string;
  clientId: string;
  readerId: string;
  topic: Topic;
  question?: string;
  readingOption: ReadingOption;
  scheduledDate?: Date;
  status: ReadingStatus;
  creditsCost: number;
  deliveryUrl?: string;
  review?: Review;
  createdDate: Date;
  completedDate?: Date;
}
```

#### Review
```typescript
interface Review {
  id: string;
  readingId: string;
  clientId: string;
  readerId: string;
  rating: number; // 1-5 stars
  comment: string;
  createdDate: Date;
  isDisputed: boolean;
}
```

#### CreditPackage
```typescript
interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number; // in cents for Stripe
  discount?: number; // percentage
  isPopular: boolean;
  stripePriceId: string;
}
```

### Business Logic (Current Implementation)

#### Credit System
- Credits purchased through Stripe integration
- Base pricing: 1 credit per minute of reading
- Time span multipliers apply (e.g., 30-min reading = 30 credits × multiplier)
- Credit balance tracked in User model
- Automatic deduction on reading acceptance

#### Client Status System
- Clients post their situation/questions as "Status"
- Readers can suggest personalized readings for statuses
- Status categories: Love, Career, Spiritual, General
- Status lifecycle: Active → Closed (when suggestion accepted)
- Integration with reading booking system

#### Reader Application Process
- Multi-step application form with profile details
- Admin approval required before activation
- Application status tracking and notifications
- Profile completion validation

#### Role-Based Access Control
- Three distinct user roles: Client, Reader, Admin
- Middleware-level route protection
- Dynamic UI based on user role
- Separate dashboards and navigation per role

#### Real-time Features
- Pusher integration for live notifications
- Online status tracking for readers
- Instant updates for reading status changes
- Real-time admin notifications

### Technical Requirements

#### Performance
- Implement caching for feed and explore pages (1-hour intervals)
- Pagination for lists and notifications
- Optimistic updates for user interactions
- Image optimization for profile pictures and artwork

#### Real-time Features
- Online status updates
- Notification delivery
- Reading status changes
- Live chat/video capabilities

#### Security
- Role-based access control
- Secure payment processing via Stripe
- Data validation and sanitization
- Rate limiting for API endpoints

#### Responsive Design
- Mobile-first approach
- Touch-friendly interface elements
- Adaptive layouts for different screen sizes
- Progressive Web App capabilities

## Suggested Improvements & Enhanced Features

### Enhanced Data Architecture

#### Base Model with Audit Trails
```typescript
interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Soft delete support
  version: number; // Optimistic locking
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
```

### User Experience Enhancements

#### User Onboarding System
```typescript
interface UserOnboarding {
  userId: string;
  completedSteps: string[];
  currentStep: string;
  skipTutorial: boolean;
  welcomeMessageShown: boolean;
  profileCompletionPercentage: number;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  isOptional: boolean;
}
```

#### Enhanced User Preferences
```typescript
interface UserPreferences extends BaseModel {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    readingReminders: boolean;
    marketingEmails: boolean;
  };
  language: string;
  timezone: string;
  accessibility: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    screenReader: boolean;
    reducedMotion: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'readers_only' | 'private';
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
  };
}
```

### Business Intelligence & Analytics

#### Analytics Tracking
```typescript
interface Analytics extends BaseModel {
  userId?: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  page?: string;
  referrer?: string;
  userAgent: string;
  ipAddress: string;
}

interface ReaderMetrics extends BaseModel {
  readerId: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  metrics: {
    profileViews: number;
    bookingRequests: number;
    acceptedBookings: number;
    completedReadings: number;
    bookingRate: number; // accepted/requested
    completionRate: number; // completed/accepted
    averageRating: number;
    totalRevenue: number;
    repeatClientCount: number;
    repeatClientRate: number;
    averageResponseTime: number; // in minutes
  };
}

interface PlatformMetrics extends BaseModel {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  metrics: {
    activeUsers: number;
    newSignups: number;
    totalReadings: number;
    platformRevenue: number;
    averageSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
    disputeRate: number;
  };
}
```

### Enhanced Search & Discovery

#### Advanced Search System
```typescript
interface SearchFilters {
  query?: string;
  attributes?: {
    abilities?: string[];
    tools?: string[];
    styles?: string[];
  };
  priceRange?: [number, number];
  minRating?: number;
  availability?: 'now' | 'today' | 'this_week' | 'flexible';
  languages?: string[];
  experience?: 'beginner' | 'intermediate' | 'expert';
  location?: string;
  readingTypes?: string[];
  badges?: string[];
}

interface SearchResult {
  readers: PsychicReader[];
  totalCount: number;
  facets: {
    abilities: { name: string; count: number }[];
    tools: { name: string; count: number }[];
    styles: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    ratings: { rating: number; count: number }[];
  };
  suggestions?: string[];
}

interface RecommendationEngine {
  userId: string;
  generateRecommendations(limit?: number): Promise<PsychicReader[]>;
  trackInteraction(readerId: string, action: 'view' | 'favorite' | 'book' | 'complete'): void;
  getRecommendationReasons(readerId: string): string[];
}
```

### Quality Assurance Systems

#### Quality Metrics & Monitoring
```typescript
interface QualityMetrics extends BaseModel {
  readerId: string;
  period: 'weekly' | 'monthly' | 'quarterly';
  metrics: {
    averageResponseTime: number; // minutes to respond to requests
    cancellationRate: number; // percentage of cancelled readings
    disputeRate: number; // percentage of disputed readings
    clientSatisfactionScore: number; // average rating
    punctualityScore: number; // on-time delivery percentage
    profileCompleteness: number; // percentage
    activityScore: number; // engagement level
  };
  warnings: QualityWarning[];
  status: 'excellent' | 'good' | 'needs_improvement' | 'at_risk';
}

interface QualityWarning {
  id: string;
  type: 'response_time' | 'cancellation_rate' | 'dispute_rate' | 'low_rating' | 'inactivity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  createdDate: Date;
  acknowledgedDate?: Date;
  resolvedDate?: Date;
}
```

#### Content Moderation System
```typescript
interface ContentModerationQueue extends BaseModel {
  contentType: 'post' | 'review' | 'profile' | 'message';
  contentId: string;
  authorId: string;
  flaggedReason: 'inappropriate' | 'spam' | 'harassment' | 'false_claims' | 'copyright' | 'other';
  flaggedBy: 'auto' | 'user' | 'admin';
  flaggedById?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  moderatorId?: string;
  moderatorNotes?: string;
  autoModerationScore?: number;
  reviewedDate?: Date;
}

interface ModerationRule {
  id: string;
  name: string;
  description: string;
  contentType: string;
  conditions: {
    keywords?: string[];
    sentiment?: 'negative' | 'positive' | 'neutral';
    length?: { min?: number; max?: number };
    userRole?: string[];
  };
  action: 'flag' | 'auto_approve' | 'auto_reject' | 'escalate';
  isActive: boolean;
}
```

### Performance & Scalability

#### Caching Strategy
```typescript
interface CacheConfig {
  feeds: { ttl: 3600; key: 'feed:*' }; // 1 hour
  clientProfiles: { ttl: 1800; key: 'profile:*' }; // 30 minutes
  readerSearch: { ttl: 900; key: 'search:*' }; // 15 minutes
  readings: { ttl: 300; key: 'reading:*' }; // 5 minutes
  notifications: { ttl: 60; key: 'notifications:*' }; // 1 minute
  publicPosts: { ttl: 7200; key: 'posts:*' }; // 2 hours
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    cached: boolean;
    cacheKey?: string;
    generatedAt: Date;
  };
}
```

### Legal & Compliance

#### Compliance Tracking
```typescript
interface ComplianceTracking extends BaseModel {
  userId: string;
  dataProcessingConsent: {
    marketing: boolean;
    analytics: boolean;
    thirdParty: boolean;
    consentDate: Date;
    consentVersion: string;
  };
  ageVerification: {
    verified: boolean;
    method: 'self_declared' | 'id_verification' | 'credit_card';
    verifiedDate?: Date;
  };
  termsAccepted: {
    version: string;
    acceptedDate: Date;
    ipAddress: string;
  };
  privacyPolicyAccepted: {
    version: string;
    acceptedDate: Date;
    ipAddress: string;
  };
  dataRetentionPolicy: {
    deleteAfter?: Date;
    reason?: string;
    requestedDate?: Date;
    processedDate?: Date;
  };
  rightToPortability: {
    requested: boolean;
    requestedDate?: Date;
    fulfilledDate?: Date;
    downloadUrl?: string;
  };
}

interface LegalDocument {
  id: string;
  type: 'terms_of_service' | 'privacy_policy' | 'cookie_policy' | 'community_guidelines';
  version: string;
  content: string;
  effectiveDate: Date;
  isActive: boolean;
  previousVersionId?: string;
}
```

### Error Handling & Monitoring

#### Error Tracking System
```typescript
interface ErrorTracking extends BaseModel {
  userId?: string;
  sessionId: string;
  errorType: 'javascript' | 'api' | 'payment' | 'auth' | 'validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stackTrace: string;
  url: string;
  userAgent: string;
  breadcrumbs: ErrorBreadcrumb[];
  context: Record<string, any>;
  resolved: boolean;
  resolvedDate?: Date;
  assignedTo?: string;
}

interface ErrorBreadcrumb {
  timestamp: Date;
  message: string;
  category: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

interface SystemHealth extends BaseModel {
  service: string;
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  responseTime: number;
  errorRate: number;
  throughput: number;
  lastChecked: Date;
  uptime: number;
  dependencies: {
    name: string;
    status: string;
    responseTime: number;
  }[];
}
```

### Enhanced Feature Models

#### Advanced Notification System
```typescript
interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject: string;
  bodyTemplate: string;
  channels: ('email' | 'push' | 'in_app' | 'sms')[];
  isActive: boolean;
  variables: {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    required: boolean;
    defaultValue?: any;
  }[];
}

interface NotificationPreference {
  userId: string;
  type: NotificationType;
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    sms: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
  quietHours?: {
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
  };
}
```

#### Enhanced Reading System
```typescript
interface ReadingTemplate {
  id: string;
  readerId: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  questions: {
    id: string;
    question: string;
    type: 'text' | 'choice' | 'date' | 'number';
    required: boolean;
    options?: string[];
  }[];
  deliveryMethod: 'phone' | 'video' | 'text' | 'audio';
  isActive: boolean;
}

interface ReadingDelivery extends BaseModel {
  readingId: string;
  method: 'phone' | 'video' | 'text' | 'audio';
  content?: string; // For text readings
  audioUrl?: string; // For audio readings
  videoUrl?: string; // For video readings
  callDetails?: {
    scheduledTime: Date;
    duration: number;
    dialInNumber?: string;
    meetingId?: string;
  };
  deliveredDate?: Date;
  viewedDate?: Date;
}
```

#### Subscription Management
```typescript
interface Subscription extends BaseModel {
  userId: string;
  planId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledDate?: Date;
  trialEnd?: Date;
  credits: {
    included: number;
    used: number;
    rollover: number;
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // monthly price in cents
  creditsIncluded: number;
  features: string[];
  stripePriceId: string;
  isActive: boolean;
  trialDays?: number;
}
```

## Implementation Status

### ✅ Completed (Current State)
**Core Features Implemented:**
- ✅ Authentication with Clerk (v6.31.3)
- ✅ User registration and role-based onboarding
- ✅ Reader application and approval system
- ✅ Reading booking and management system
- ✅ Credit-based payment system with Stripe
- ✅ Real-time notifications with Pusher
- ✅ Admin dashboard with user management
- ✅ Role-based routing (Client/Reader/Admin)
- ✅ Client status system with suggested readings
- ✅ File upload with AWS S3 integration
- ✅ Reader search and filtering
- ✅ Responsive UI with Shadcn/ui components

**Architecture Implemented:**
- ✅ Next.js 15 with App Router
- ✅ MongoDB with Mongoose
- ✅ TypeScript throughout
- ✅ Role-based middleware protection
- ✅ API routes with proper validation
- ✅ Component-based architecture
- ✅ Service layer abstraction

### 🔄 In Progress / Planned Enhancements
**Phase 2 Features:**
- 📊 Enhanced analytics dashboard
- 🔍 Advanced search with faceted filtering
- 💬 Real-time chat during video sessions
- 📈 Reader performance metrics
- 🎯 Recommendation engine
- 📱 Mobile app optimization
- 🔔 Enhanced notification preferences
**Optimization Features:**
- Advanced caching implementation
- Comprehensive error monitoring
- Recommendation engine
- Legal compliance tracking
- Performance optimization
- Mobile app considerations

**Data Models Priority:**
- ComplianceTracking, ErrorTracking, SystemHealth
- RecommendationEngine, SubscriptionPlan
- Advanced analytics and reporting

## Architecture Recommendations

### Microservices Structure
1. **User Service**: Authentication, profiles, preferences, onboarding
2. **Reading Service**: Booking, delivery, reviews, templates
3. **Payment Service**: Credits, subscriptions, transactions, refunds
4. **Content Service**: Posts, moderation, recommendations
5. **Notification Service**: Real-time messaging, alerts, templates
6. **Analytics Service**: Tracking, metrics, reporting

### Database Strategy
- **MongoDB**: Main application data, client profiles, reader profiles, readings
- **Redis**: Caching, sessions, real-time data, queues
- **PostgreSQL**: Financial transactions, audit logs (ACID compliance)

### Security Implementation
- Rate limiting on all endpoints (Redis-based)
- CSRF protection with Next.js built-in features
- Input validation with Zod schemas
- API key management for third-party services
- Encrypted data storage for sensitive information

This comprehensive specification provides a robust foundation for building the Auralumic platform with scalability, security, and exceptional user experience in mind.