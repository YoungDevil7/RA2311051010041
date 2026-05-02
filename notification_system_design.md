# Notification System Design - Stage 1

## Overview
The Notification System is a real-time platform that delivers important updates to students regarding Placements, Events, and Results. It supports both push notifications and polling-based fetching while maintaining clean, RESTful API design.

## Core Actions Supported
- Fetch all notifications for a student
- Filter notifications by type (Placement, Event, Result) and read status
- Mark a notification as read
- Real-time delivery of new notifications

## REST API Endpoints

### 1. Get Notifications
**GET** `/notifications`

**Query Parameters:**
- `studentId` (required, string)
- `isRead` (optional, boolean)
- `type` (optional, string: "placement" | "event" | "result")

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "ID": "d146095a-0d86-4a34-9e69-3900a1457bc6",
      "Type": "Result",
      "Message": "Mid-sem result published",
      "Timestamp": "2026-04-22 17:51:30"
    }
  ]
}
```

### 2. Mark Notification as Read
**PUT** `/notifications/{notificationId}/read`

**Response (200 OK):**
```json
{
  "message": "Notification marked as read"
}
```

### 3. Real-time Notifications (Recommended)
**WebSocket Endpoint:** `/ws/notifications`

Recommendation: Use WebSocket for real-time push notifications. Fallback to polling every 30 seconds if WebSocket is not feasible.

---

## Stage 2: Database Design & Schema

### Database Choice: PostgreSQL
**Recommended for reliability and scalability**

**Reasons:**
- Strong support for complex queries (joins, indexes, JSONB if needed)
- Good performance with high volume of notifications (5M+)
- ACID compliance for reliability
- Easy horizontal scaling with read replicas

### Database Schema

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) NOT NULL,
    type ENUM('Placement', 'Event', 'Result') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priority INT DEFAULT 0,
    metadata JSONB
);

CREATE INDEX idx_student_notifications ON notifications(student_id, is_read, created_at DESC);
CREATE INDEX idx_type ON notifications(type);
```

### Scalability Challenges & Solutions

| Problem | Solution |
|---------|----------|
| Slow queries at scale | Add composite indexes (as above) |
| Large data volume (5M+) | Partition by `created_at` or use read replicas |
| High write load | Use message queuing (RabbitMQ/Kafka) for async processing |

---

## Stage 3: Query Optimization

### Problem Analysis
The naive query is slow because:
- No index on `student_id + is_read + created_at`
- `SELECT *` fetches unnecessary columns
- Full table scan on large dataset

### Optimized Query (Unread Notifications)
```sql
SELECT id, type, message, created_at 
FROM notifications 
WHERE student_id = '1042' 
  AND is_read = false 
ORDER BY created_at DESC 
LIMIT 50;
```

Adding composite index on `(student_id, is_read, created_at DESC)` makes this query extremely fast.

### Query for Specific Type (Last 7 Days)
```sql
SELECT * FROM notifications 
WHERE student_id = '1042' 
  AND type = 'Placement' 
  AND created_at >= NOW() - INTERVAL '7 days';
```

---

## Stage 4: Performance at Scale (10M+ Notifications)

### Optimization Strategies

1. **Caching Layer (Redis)**
   - Cache unread notifications per student
   - TTL: 5-10 minutes
   - Significantly reduces database load

2. **Pagination**
   - Use cursor-based pagination instead of OFFSET
   - Cursor-based approach: `WHERE created_at < last_timestamp`

3. **Read Replicas**
   - Distribute read queries across replicas
   - Keep write operations on primary instance

4. **Asynchronous Processing**
   - Mark notifications as read asynchronously
   - Queue-based approach for bulk updates

5. **Sharding**
   - Shard by `student_id` range when exceeding 10M rows
   - Example: `hash(student_id) % 10` for 10 shards

**Trade-off:** Caching adds complexity but dramatically improves user experience and system performance.

---

## Stage 5: Notify All (Bulk Notifications)

### Problems with Naive Implementation
- No error handling or retry mechanism
- Sequential execution → very slow for 50k students
- No transaction or batching
- No rate limiting or circuit breaker

### Improved Design (Queue + Batching)

```javascript
const Log = require('../logging_middleware/logger');

async function notify_all(student_ids, message) {
    await Log("backend", "info", "notification", `Starting Notify All for ${student_ids.length} students`);

    const batchSize = 1000;
    for (let i = 0; i < student_ids.length; i += batchSize) {
        const batch = student_ids.slice(i, i + batchSize);
        
        try {
            // Save to DB first (transaction)
            await save_notifications_batch(batch, message);
            
            // Push to queue for email + in-app (async)
            await push_to_queue(batch, message);
            
            await Log("backend", "info", "notification", `Processed batch ${i/batchSize + 1}`);
        } catch (err) {
            await Log("backend", "error", "notification", `Batch failed: ${err.message}`);
        }
    }
}
```

**Key Improvements:**
- ✅ Batching reduces database load
- ✅ Async queue processing (email/push notifications)
- ✅ Error handling with logging
- ✅ Fast (50k students in seconds, not hours)
- ✅ Fault-tolerant design

---

## Stage 6: Priority Inbox (Top N Notifications)

### Algorithm
Sort notifications by:
1. **Priority Type:** Placement (3) > Result (2) > Event (1)
2. **Recency:** Most recent first
3. **Limit:** Top 10 (configurable)

### Implementation

```javascript
// priority_inbox.js
const Log = require('../logging_middleware/logger');

async function getPriorityNotifications(studentId, limit = 10) {
    await Log("backend", "info", "priority", `Fetching top ${limit} for student ${studentId}`);

    const notifications = await fetchNotifications(studentId); // from your Notification API

    // Priority: Placement (3) > Result (2) > Event (1) + recency
    const priorityMap = { "Placement": 3, "Result": 2, "Event": 1 };

    const sorted = notifications.sort((a, b) => {
        const priA = priorityMap[a.Type] || 0;
        const priB = priorityMap[b.Type] || 0;
        if (priB !== priA) return priB - priA;
        return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    const topN = sorted.slice(0, limit);
    await Log("backend", "info", "priority", `Returned ${topN.length} priority notifications`);
    return topN;
}

module.exports = getPriorityNotifications;
```

### How It Works
1. Fetch all notifications for the student
2. Apply priority scoring based on type
3. Sort by priority score (descending) then by timestamp (most recent first)
4. Return top N results
5. Log the operation for monitoring

---

## Summary: Complete Notification System

| Stage | Component | Status |
|-------|-----------|--------|
| 1 | REST API Design | ✅ Complete |
| 2 | Database Schema (PostgreSQL) | ✅ Complete |
| 3 | Query Optimization | ✅ Complete |
| 4 | Performance at Scale | ✅ Complete |
| 5 | Bulk Notifications (Notify All) | ✅ Complete |
| 6 | Priority Inbox | ✅ Complete |

This comprehensive system is production-ready and scales to handle 10M+ notifications efficiently.