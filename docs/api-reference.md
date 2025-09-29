# API Reference

## Authentication

### POST /api/auth/webhook
Clerk webhook handler for authentication events.

### GET /api/users/me
Get current user information.

## Users

### GET /api/users
List users with pagination.

### GET /api/users/:id
Get user by ID.

### PATCH /api/users/:id
Update user information.

## Readers

### GET /api/readers
List readers with filters and pagination.

### GET /api/readers/:id
Get reader profile.

### POST /api/readers/:id/approve
Approve reader application.

### GET /api/readers/search
Search readers by criteria.

## Readings

### POST /api/readings/request
Create new reading request.

### GET /api/readings/:id
Get reading details.

### POST /api/readings/:id/accept
Accept reading request.

### POST /api/readings/:id/decline
Decline reading request.

### POST /api/readings/:id/complete
Mark reading as complete.

## Posts

### POST /api/posts
Create new post.

### GET /api/posts/:id
Get post details.

### POST /api/posts/:id/like
Like/unlike post.

### POST /api/posts/:id/comments
Add comment to post.

## Credits

### GET /api/credits/balance
Get user credit balance.

### POST /api/credits/purchase
Purchase credit package.

## Payments

### POST /api/payments/webhook
Stripe webhook handler.

### POST /api/payments/create-intent
Create payment intent.

### GET /api/payments/packages
List credit packages.
