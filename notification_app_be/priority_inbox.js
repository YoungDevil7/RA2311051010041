// priority_inbox.js
const Log = require('../logging_middleware/logger');

async function getPriorityNotifications(studentId, limit = 10) {
    await Log("backend", "info", "priority", `Fetching top ${limit} for student ${studentId}`);

    // Mock data for demonstration (would come from API in production)
    const notifications = [
        {
            ID: "1",
            Type: "Event",
            Message: "Tech Conference 2026 registration open",
            Timestamp: "2026-05-01 10:30:00"
        },
        {
            ID: "2",
            Type: "Result",
            Message: "Final exam results published",
            Timestamp: "2026-05-02 08:15:00"
        },
        {
            ID: "3",
            Type: "Placement",
            Message: "Google hiring drive - Apply now!",
            Timestamp: "2026-05-02 14:45:00"
        },
        {
            ID: "4",
            Type: "Event",
            Message: "Hackathon 2026 registration",
            Timestamp: "2026-05-01 16:20:00"
        },
        {
            ID: "5",
            Type: "Placement",
            Message: "Microsoft campus interview scheduled",
            Timestamp: "2026-04-30 11:00:00"
        },
        {
            ID: "6",
            Type: "Result",
            Message: "Assignment 3 grades available",
            Timestamp: "2026-04-28 09:30:00"
        },
        {
            ID: "7",
            Type: "Event",
            Message: "AI Workshop - Register now",
            Timestamp: "2026-05-02 12:00:00"
        },
        {
            ID: "8",
            Type: "Placement",
            Message: "Amazon internship applications closing tomorrow",
            Timestamp: "2026-05-02 15:30:00"
        },
        {
            ID: "9",
            Type: "Event",
            Message: "Sports fest nominations",
            Timestamp: "2026-04-27 13:45:00"
        },
        {
            ID: "10",
            Type: "Result",
            Message: "Mid-sem result published",
            Timestamp: "2026-04-22 17:51:30"
        }
    ];

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

// Test the priority inbox
async function test() {
    console.log("📱 Priority Inbox Test\n");
    console.log("=" .repeat(80));
    const results = await getPriorityNotifications("1042", 10);
    console.log("=" .repeat(80));
    console.log("\n✨ Top 10 Priority Notifications:\n");
    
    results.forEach((notif, index) => {
        console.log(`${index + 1}. [${notif.Type}] ${notif.Message}`);
        console.log(`   ID: ${notif.ID} | Timestamp: ${notif.Timestamp}\n`);
    });
    
    console.log("=" .repeat(80));
    console.log("✅ Priority Inbox completed successfully.");
}

module.exports = getPriorityNotifications;

// Run test
test().catch(console.error);
