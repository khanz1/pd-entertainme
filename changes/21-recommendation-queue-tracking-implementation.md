# 21 - Recommendation Queue Tracking Implementation

## Changes Made

### Created Files

- `server/src/models/RecommendationQueue.ts` - New model for tracking recommendation queue jobs

### Updated Files

- `server/src/models/index.ts` - Added RecommendationQueue model and associations
- `server/src/apis/movie/recommendation.service.ts` - Added addQueue and updateQueue functions
- `server/src/apis/movie/recommendation.queue.ts` - Integrated queue tracking with worker lifecycle

## What Was Added

### RecommendationQueue Model

Created a new Sequelize model with the following fields:

- `jobId` (string, unique) - BullMQ job identifier
- `userId` (integer) - Reference to the user requesting recommendations
- `status` (enum: "queue", "process", "done") - Current job status
- `processingTime` (integer, default: 0) - Processing duration in seconds
- Standard `createdAt` and `updatedAt` timestamps

### Service Functions

Added two new functions to `recommendation.service.ts`:

#### `addQueue(userId: number)`

- Creates a new BullMQ job for movie recommendations
- Inserts a corresponding record in the RecommendationQueue table
- Returns both the job ID and queue record
- Includes retry logic with exponential backoff

#### `updateQueue(jobId: string, status: "process" | "done", processingTime?: number)`

- Updates the queue record status
- Tracks processing time when job completes
- Provides comprehensive logging for debugging
- Returns the updated record or null if not found

### Worker Integration

Enhanced the BullMQ worker to:

- Mark jobs as "process" when they start
- Track start time for processing duration calculation
- Update status to "done" with processing time when completed
- Handle errors gracefully while maintaining queue tracking

### Database Associations

- Added User ↔ RecommendationQueue one-to-many relationship
- Implemented cascade delete for data integrity
- Created appropriate database indexes for performance

## Pros and Cons

### Pros

1. **Complete Job Tracking** - Full visibility into queue job lifecycle from creation to completion
2. **Performance Monitoring** - Processing time tracking enables performance optimization
3. **User Experience** - Users can see their recommendation request status
4. **Debugging Support** - Comprehensive logging at each stage for troubleshooting
5. **Data Integrity** - Proper foreign key relationships and cascade deletes
6. **Scalability** - Indexed fields for efficient querying at scale
7. **Error Handling** - Robust error handling with detailed logging
8. **Retry Logic** - Built-in retry mechanism with exponential backoff

### Cons

1. **Additional Storage** - Extra database table increases storage requirements
2. **Complexity** - More code to maintain and potential points of failure
3. **Performance Overhead** - Additional database operations for each job
4. **Cleanup Needs** - May need periodic cleanup of old queue records
5. **Consistency Risk** - Potential for queue table and BullMQ state to become inconsistent

## Technical Implementation Details

### Model Design

- Uses ENUM for status field ensuring data consistency
- Unique constraint on jobId prevents duplicate tracking
- Default values for status ("queue") and processingTime (0)
- Proper foreign key relationships with cascade delete

### Function Architecture

- `addQueue()` combines BullMQ job creation with database tracking
- `updateQueue()` handles both status transitions and time tracking
- Both functions include comprehensive error handling and logging
- Return structured data for easy integration

### Worker Enhancement

- Tracks job start time before processing begins
- Updates status at key lifecycle points (start, completion)
- Calculates processing time in seconds for consistency
- Maintains BullMQ error handling while adding tracking

### Database Optimization

- Strategic indexes on frequently queried fields (jobId, userId, status)
- Efficient foreign key relationships
- Proper data types for optimal storage

## Potential Issues and Fixes

### Issue 1: Queue Table and BullMQ State Inconsistency

**Problem**: Database queue state might not match actual BullMQ job state
**Fix**: Implement periodic reconciliation job to sync states

```typescript
// Add reconciliation function to check and sync states
export const reconcileQueueStates = async () => {
  // Compare database records with actual BullMQ jobs
  // Update inconsistent records
};
```

### Issue 2: Old Queue Records Accumulation

**Problem**: Queue table may grow large with completed jobs
**Fix**: Implement cleanup job for old completed records

```typescript
// Add cleanup function
export const cleanupOldQueueRecords = async (daysOld: number = 30) => {
  // Delete records older than specified days
};
```

### Issue 3: Processing Time Accuracy

**Problem**: Server restarts might lose in-progress time tracking
**Fix**: Consider storing start time in database for persistence

```typescript
// Add startedAt field to track actual start time
startedAt: {
  type: DataTypes.DATE,
  allowNull: true,
},
```

### Issue 4: Bulk Job Operations

**Problem**: High load might create many database operations
**Fix**: Implement batch update capabilities

```typescript
// Add batch update function
export const updateMultipleQueues = async (
  updates: Array<{ jobId: string; status: string }>
) => {
  // Batch update multiple records
};
```

## Git Commit Message

```
feat(recommendation): implement queue tracking system

• add RecommendationQueue model with job lifecycle tracking
• implement addQueue function for job creation and tracking
• add updateQueue function for status and time management
• enhance worker with processing time calculation
• create proper database associations and indexes
• add comprehensive logging for debugging support

The queue tracking system provides full visibility into recommendation
job lifecycle, enabling better user experience and performance monitoring.
```
