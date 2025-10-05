# User & Client Model Restructure

## Overview
Restructured the user management system to separate base user data from client-specific and reader-specific data, creating a cleaner architecture that aligns with the application's needs.

## Model Changes

### User Model (Updated)
**Location**: `models/User.ts`

**Removed Fields**:
- `bio` - Unnecessary for base user
- `location` - Unnecessary for base user  
- `website` - Unnecessary for base user
- `createdAt` (manual) - Now using timestamps
- `updatedAt` (manual) - Now using timestamps

**Added Fields**:
- `firstName: String` - User's first name
- `lastName: String` - User's last name
- `timezone: String` - User's timezone (default: 'America/New_York')

**Retained Fields**:
- `clerkId: String` (required, unique) - Clerk authentication ID
- `email: String` (required, unique) - User email
- `username: String` - Optional username
- `role: String` - Enum: 'client', 'reader', 'admin' (default: 'client')
- `credits: Number` - User credit balance (default: 0)
- `subscriptionId: String` - Subscription reference
- `preferences: Object` - Theme and notification preferences
- `hasCompletedOnboarding: Boolean` - Onboarding status
- `lastLogin: Date` - Last login timestamp

### Client Model (New)
**Location**: `models/Client.ts`

**Purpose**: Stores client-specific data and references the User model

**Fields**:
- `userId: String` (required, unique, ref: 'User') - Reference to User.clerkId
- `isActive: Boolean` - Client account status (default: true)
- `isOnline: Boolean` - Current online status (default: false)
- `languages: [String]` - Preferred languages (default: ['English'])
- `timezone: String` - Client timezone (default: 'America/New_York')
- `stats: Object` - Client statistics
  - `totalReadings: Number` - Total readings booked
  - `creditsUsed: Number` - Total credits spent
  - `favoriteReaders: [String]` - Array of reader userIds
- `readings: [ObjectId]` - References to Reading documents
- `reviews: [ObjectId]` - References to Review documents
- `currentStatus: Object` - Current status post (for StatusManager feature)
  - `content: String` - Status content
  - `mood: String` - User's mood
  - `category: String` - Status category
  - `isActive: Boolean` - Whether status is active
  - `postedAt: Date` - When status was posted
- `lastActive: Date` - Last activity timestamp

**Indexes**:
- `userId` - For quick lookups
- `isActive` - For filtering active/inactive clients
- `lastActive` - For sorting by activity

## API Routes

### `/api/admin/users`

#### GET
**Purpose**: Fetch all users with optional filtering

**Query Parameters**:
- `role` - Filter by role (client, reader, admin, all)
- `status` - Filter by status (active, inactive, all)
- `search` - Search by name, email, or username

**Response**:
```json
{
  "users": [
    {
      "id": "clerk_user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "client",
      "isActive": true,
      "credits": 150,
      "totalReadings": 5,
      "joinDate": "2024-01-15T00:00:00.000Z",
      "lastActive": "2024-08-20T00:00:00.000Z",
      "timezone": "America/New_York"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

**Features**:
- Joins User and Client collections
- Merges data from both models
- Admin authentication required
- Role-based filtering
- Search across multiple fields

### `/api/admin/users/[id]`

#### PUT
**Purpose**: Update user properties

**Body**:
```json
{
  "role": "client",
  "isActive": true,
  "credits": 200
}
```

**Features**:
- Updates User model (role, credits)
- Updates Client model (isActive) if user is a client
- Creates Client document if doesn't exist (upsert)
- Admin authentication required

#### DELETE
**Purpose**: Delete user and associated data

**Features**:
- Deletes User document
- Deletes associated Client document
- Admin authentication required
- Cascades deletion to related data

### `/api/admin/clients`

#### GET
**Purpose**: Fetch all clients with detailed information

**Query Parameters**:
- `status` - Filter by status (active, inactive, all)
- `search` - Search by name, email, or username

**Response**:
```json
{
  "clients": [
    {
      "id": "clerk_user_id",
      "email": "client@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "client",
      "isActive": true,
      "isOnline": false,
      "credits": 75,
      "totalReadings": 2,
      "creditsUsed": 125,
      "languages": ["English", "Spanish"],
      "timezone": "America/Los_Angeles",
      "joinDate": "2024-02-20T00:00:00.000Z",
      "lastActive": "2024-08-18T00:00:00.000Z",
      "hasCompletedOnboarding": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

**Features**:
- Filters for client role only
- Populates readings and reviews
- Merges User and Client data
- Admin authentication required

### `/api/admin/readers`

#### GET (Updated)
**Purpose**: Fetch all readers from database

**Features**:
- Connects to Reader model instead of mock data
- Joins with User model for basic info
- Calculates specialties from attributes
- Filters by approval status
- Search across multiple fields
- Admin authentication required

## Component Updates

### `components/admin/user-management.tsx`

**Updated**:
- Removed all mock data
- Connected to real API endpoints
- Updated interfaces to match new models
- Added timezone field to User interface
- Fixed date handling (Date | string types)
- Real-time filtering with API calls
- Proper error handling

**Key Changes**:
```typescript
// Before
const mockUsers: User[] = [ /* hardcoded data */ ];

// After
const response = await fetch(`/api/admin/users?${params.toString()}`);
const data = await response.json();
setUsers(data.users || []);
```

**New Features**:
- Auto-refresh on filter changes
- Real database operations
- Proper admin authentication
- Error logging and handling

## Data Flow

1. **User Signs Up**:
   - User document created in database via Clerk webhook
   - Default role: 'client'
   - hasCompletedOnboarding: false

2. **Client Profile Setup**:
   - Client document created on first profile access
   - Linked via userId (Clerk ID)
   - Default values applied (isActive: true, languages: ['English'])

3. **Admin Management**:
   - Admin views users through `/api/admin/users`
   - Can filter by role, status, search term
   - Updates propagate to both User and Client models
   - Status changes handled appropriately by model type

4. **Reader Approval**:
   - Readers loaded from Reader model
   - Joined with User model for basic info
   - Approval updates handled via Reader-specific API

## Migration Notes

**No migration needed** for existing data since:
- User model updates are additive (firstName, lastName, timezone)
- Client model is new and will be created on-demand
- Removed fields (bio, location, website) were optional and not widely used

**Recommended Actions**:
1. Run application to test API connections
2. Verify admin user management functions work
3. Test filter and search functionality
4. Check that user updates save correctly
5. Verify client-specific data displays properly

## Benefits

1. **Separation of Concerns**: Base user data separated from role-specific data
2. **Scalability**: Easy to add more client-specific fields without affecting User model
3. **Performance**: Indexed Client collection for faster queries
4. **Flexibility**: Can query clients independently of all users
5. **Data Integrity**: Clear relationships between models
6. **Feature Support**: Built-in support for StatusManager and client-specific features

## Future Enhancements

1. Add pagination to API endpoints
2. Implement bulk operations for user management
3. Add user activity logging
4. Create dashboard analytics for client behavior
5. Add export functionality for user/client data
6. Implement soft delete for data retention
