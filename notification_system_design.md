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