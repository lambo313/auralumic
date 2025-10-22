# Reading Details Modal Implementation

## Overview
Implemented a comprehensive reading details modal that allows clients to view, edit, and cancel their pending reading requests with automatic credit adjustment calculations.

## New Files Created

### 1. `components/readings/reading-details-modal.tsx`
A dedicated modal component for viewing and managing reading requests with the following features:

#### Features:
- **View Mode**: Display all reading details (topic, question, duration, format, schedule, credits)
- **Edit Mode**: Allow clients to modify pending readings
  - Edit question/description
  - Change duration
  - Change reading format (phone/video/message)
  - Update scheduled date (if applicable)
- **Credit Calculations**: 
  - Real-time credit difference calculation when editing
  - Shows additional charges or refund amounts
  - Validates sufficient credits before allowing updates
- **Cancel Functionality**:
  - Cancel pending readings
  - Automatic full credit refund
  - Confirmation dialog for safety
- **Status Display**: Visual indicators for different reading queue types (instant, scheduled, message)
- **Reader Information**: Shows reader profile, rating, and online status

### 2. `app/api/readings/[id]/route.ts`
RESTful API endpoint for individual reading operations:

#### Endpoints:
- **GET `/api/readings/[id]`**: Fetch single reading details
  - Authorization: Only client or reader involved
  
- **PATCH `/api/readings/[id]`**: Update reading details
  - Authorization: Only client can edit their own reading
  - Restrictions: Only pending readings can be edited
  - Credit handling:
    - Deducts additional credits if cost increases
    - Refunds credits if cost decreases
    - Validates sufficient balance
  
- **DELETE `/api/readings/[id]`**: Cancel reading
  - Authorization: Only client can cancel their own reading
  - Restrictions: Only pending readings can be cancelled
  - Sets status to 'refunded' instead of hard delete
  - Full credit refund processed

## Modified Files

### 1. `lib/credit-validation.ts`
Added `refundCredits` function:
```typescript
export async function refundCredits(userId: string, creditAmount: number): Promise<{ success: boolean; newBalance: number }>
```
- Adds credits back to user account
- Returns new balance for UI updates

### 2. `components/readings/reading-card.tsx`
Enhanced to support modal functionality:
- Added `fullReading` prop to pass complete Reading object
- Added `currentCredits` prop for credit validation
- Added `onReadingUpdated` callback to refresh list after changes
- Added `onCreditsUpdated` callback to update credit balance
- Integrated `ReadingDetailsModal` component
- Made `onViewDetails` optional (falls back to modal)

### 3. `components/readings/reading-list.tsx`
Updated to pass modal-required props:
- Added `currentCredits` prop
- Added `onReadingUpdated` callback
- Added `onCreditsUpdated` callback
- Passes `fullReading` object to each ReadingCard

### 4. `app/client/readings/page.tsx`
Integrated with credit management:
- Uses `useCredits` hook to get current balance
- Passes credit callbacks to ReadingList components
- All reading tabs now support edit/cancel functionality

### 5. `hooks/use-readings.ts`
Added refetch capability:
- Extracted `fetchReadings` as standalone function
- Added `refetch` to return type
- Allows manual refresh after CRUD operations

## User Experience Flow

### For Clients Viewing Pending Readings:

1. **View Details**
   - Click "View Details" on any reading card
   - Modal opens showing full reading information
   - See reader profile and current status

2. **Edit Reading** (if pending)
   - Click "Edit Details" button
   - Modify question, duration, format, or schedule
   - See real-time credit difference calculation
   - System validates sufficient credits
   - Click "Update Reading" to save changes
   - Credits automatically adjusted (charge or refund)
   - Reading list refreshes automatically

3. **Cancel Reading** (if pending)
   - Click "Cancel Reading" button
   - Confirm cancellation in dialog
   - Full credit refund processed immediately
   - Reading status changed to 'refunded'
   - Moved to archived readings
   - Reading list refreshes automatically

### Credit Adjustment Examples:

**Scenario 1: Increase Duration**
- Original: 30 min phone call = 25 credits
- Updated: 60 min phone call = 50 credits
- **Result**: Client charged 25 additional credits

**Scenario 2: Change to Discount Format**
- Original: 30 min phone call = 25 credits (1.0x)
- Updated: 30 min video message = 20 credits (0.8x)
- **Result**: Client refunded 5 credits

**Scenario 3: Complete Cancellation**
- Original: 60 min live video = 60 credits (1.2x)
- Action: Cancel reading
- **Result**: Client refunded full 60 credits

## Security & Validation

### Authorization
- Only the client who created the reading can edit/cancel
- Readers can view but not modify
- Admins can view all (not implemented in this PR)

### Status Restrictions
- Only pending readings can be edited:
  - `instant_queue`
  - `scheduled`
  - `message_queue`
- Readings in progress, completed, or disputed cannot be modified

### Credit Validation
- Checks sufficient balance before allowing cost increases
- Prevents negative balances
- Atomic operations (reading update + credit adjustment)
- Automatic rollback on errors

## API Response Format

### Update Response:
```json
{
  "reading": { /* updated reading object */ },
  "creditBalance": 1500,
  "creditDifference": -5
}
```

### Cancel Response:
```json
{
  "message": "Reading cancelled and credits refunded",
  "creditBalance": 1525,
  "refundedCredits": 50
}
```

## Error Handling

- Insufficient credits: Returns 400 with error message
- Unauthorized access: Returns 403
- Reading not found: Returns 404
- Invalid status for operation: Returns 400
- Server errors: Returns 500 with error details

## Toast Notifications

Users receive real-time feedback for all operations:
- Success: "Reading updated" with credit change info
- Success: "Reading cancelled" with refund amount
- Error: "Insufficient credits" or operation-specific error
- Warning: "No changes detected" if submitting without edits

## Future Enhancements

Potential improvements for future iterations:
1. Add revision history for edited readings
2. Allow scheduling changes without credit adjustment
3. Implement partial refunds for late cancellations
4. Add reader confirmation for significant changes
5. Support bulk operations
6. Add notes/messages between client and reader
7. Enable attachment uploads for context
