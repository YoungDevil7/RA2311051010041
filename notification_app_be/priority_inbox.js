const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Log = require('../logging_middleware/logger');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = 'http://20.207.122.201/evaluation-service';

async function fetchNotifications(studentId) {
    await Log('backend', 'info', 'priority', `Fetching notifications for student ${studentId}`);

    const headers = { 'Content-Type': 'application/json' };
    if (process.env.ACCESS_TOKEN) {
        headers.Authorization = `Bearer ${process.env.ACCESS_TOKEN}`;
    }

    const response = await axios.get(`${BASE_URL}/notifications?studentId=${studentId}`, {
        headers
    });

    return response.data.notifications || [];
}

async function getPriorityNotifications(studentId, limit = 10) {
    await Log('backend', 'info', 'priority', `Fetching top ${limit} for student ${studentId}`);

    const notifications = await fetchNotifications(studentId);
    const priorityMap = { Placement: 3, Result: 2, Event: 1 };

    const sorted = notifications.sort((a, b) => {
        const priorityA = priorityMap[a.Type] || 0;
        const priorityB = priorityMap[b.Type] || 0;

        if (priorityB !== priorityA) {
            return priorityB - priorityA;
        }

        return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    const topNotifications = sorted.slice(0, limit);
    await Log('backend', 'info', 'priority', `Returned ${topNotifications.length} priority notifications`);

    return topNotifications;
}

async function runDemo() {
    const results = await getPriorityNotifications('1042', 10);

    const rows = results.map((notification, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${notification.Type}</td>
            <td>${notification.Message}</td>
            <td>${notification.ID}</td>
            <td>${notification.Timestamp}</td>
        </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Priority Inbox Output</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #f6f8fc, #eef2ff);
                color: #111827;
                margin: 0;
                padding: 32px;
            }
            .card {
                max-width: 1100px;
                margin: 0 auto;
                background: white;
                border-radius: 18px;
                box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
                padding: 32px;
            }
            h1 {
                margin-top: 0;
                font-size: 28px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                text-align: left;
                padding: 14px 12px;
                border-bottom: 1px solid #e5e7eb;
                vertical-align: top;
            }
            th {
                background: #f9fafb;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.04em;
            }
            .badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 700;
            }
            .placement { background: #dcfce7; color: #166534; }
            .result { background: #dbeafe; color: #1d4ed8; }
            .event { background: #fef3c7; color: #92400e; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Priority Inbox Output</h1>
            <p>Top ${results.length} notifications sorted by priority and recency for student 1042.</p>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Type</th>
                        <th>Message</th>
                        <th>ID</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    </body>
    </html>`;

    fs.writeFileSync(path.join(__dirname, 'priority_inbox_output.html'), html, 'utf8');
}

if (require.main === module) {
    runDemo().catch((error) => {
        Log('backend', 'error', 'priority', error.message);
    });
}

module.exports = getPriorityNotifications;
