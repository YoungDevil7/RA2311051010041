# Notification System Design

## Stage 1

Assume a front-end developer colleague has asked you for REST API design, contract and structure to display notifications to the users when they are logged in. 

**Core REST API Endpoints:**

**GET** `/notifications`  
Query Parameters: `studentId`, `isRead` (optional), `type` (optional: placement/event/result)

**PUT** `/notifications/{notificationId}/read`

**Recommended Real-time Mechanism:** WebSocket (`/ws/notifications`) with fallback polling.

## Stage 2

**Recommended Database:** PostgreSQL (Relational)

**Reasoning:**
- Strong ACID compliance and complex querying support
- Excellent indexing capabilities for high-volume reads
- Easy to scale with read replicas

**DB Schema:**

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Placement', 'Event', 'Result')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priority INT DEFAULT 0,
    metadata JSONB
);

CREATE INDEX idx_student_notifications ON notifications(student_id, is_read, created_at DESC);
```

## Stage 3

The original query is slow because it lacks proper indexes and uses SELECT *.

**Improved Query:**

```sql
SELECT id, type, message, created_at 
FROM notifications 
WHERE student_id = '1042' 
  AND is_read = false 
ORDER BY created_at DESC 
LIMIT 50;
```

**Placement notifications in last 7 days:**

```sql
SELECT * FROM notifications 
WHERE student_id = '1042' 
  AND type = 'Placement' 
  AND created_at >= NOW() - INTERVAL '7 days';
```

## Stage 4

**Performance Solutions for large scale:**

- Implement Redis caching for unread notifications per student
- Use cursor-based pagination instead of OFFSET
- Add read replicas for read-heavy traffic
- Batch marking as read operations
- Consider sharding by student_id range at very high scale

## Stage 5

The given pseudocode has major issues: no error handling, no batching, sequential execution, and no retry mechanism.

**Improved Design (Batched + Queued):**

```javascript
async function notify_all(student_ids, message) {
    const batchSize = 1000;
    for (let i = 0; i < student_ids.length; i += batchSize) {
        const batch = student_ids.slice(i, i + batchSize);
        try {
            await save_notifications_batch(batch, message);
            await push_to_notification_queue(batch, message);
        } catch (err) {
            await Log("backend", "error", "notification", `Batch failed: ${err.message}`);
        }
    }
}
```

## Stage 6

**Priority Inbox Implementation:**

```javascript
async function getPriorityNotifications(studentId, limit = 10) {
    await Log("backend", "info", "priority", `Fetching top ${limit} for student ${studentId}`);

    const notifications = await fetchNotifications(studentId);

    const priorityMap = { "Placement": 3, "Result": 2, "Event": 1 };

    const sorted = notifications.sort((a, b) => {
        const priA = priorityMap[a.Type] || 0;
        const priB = priorityMap[b.Type] || 0;
        if (priB !== priA) return priB - priA;
        return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    return sorted.slice(0, limit);
}
```