const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const Log = require('../logging_middleware/logger');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.DEMO_PORT || 4000;

const depots = [
    { ID: 1, MechanicHours: 60 },
    { ID: 2, MechanicHours: 135 },
    { ID: 3, MechanicHours: 188 },
    { ID: 4, MechanicHours: 97 },
    { ID: 5, MechanicHours: 164 }
];

const vehiclesByDepot = {
    1: [
        { TaskID: 'a1', Duration: 10, Impact: 20 },
        { TaskID: 'a2', Duration: 20, Impact: 35 },
        { TaskID: 'a3', Duration: 15, Impact: 30 },
        { TaskID: 'a4', Duration: 25, Impact: 45 },
        { TaskID: 'a5', Duration: 12, Impact: 18 }
    ],
    2: [
        { TaskID: 'b1', Duration: 25, Impact: 50 },
        { TaskID: 'b2', Duration: 30, Impact: 55 },
        { TaskID: 'b3', Duration: 45, Impact: 70 },
        { TaskID: 'b4', Duration: 18, Impact: 28 },
        { TaskID: 'b5', Duration: 22, Impact: 33 }
    ],
    3: [
        { TaskID: 'c1', Duration: 40, Impact: 60 },
        { TaskID: 'c2', Duration: 50, Impact: 80 },
        { TaskID: 'c3', Duration: 35, Impact: 58 },
        { TaskID: 'c4', Duration: 28, Impact: 46 },
        { TaskID: 'c5', Duration: 24, Impact: 40 }
    ],
    4: [
        { TaskID: 'd1', Duration: 10, Impact: 15 },
        { TaskID: 'd2', Duration: 15, Impact: 22 },
        { TaskID: 'd3', Duration: 20, Impact: 30 },
        { TaskID: 'd4', Duration: 18, Impact: 26 },
        { TaskID: 'd5', Duration: 25, Impact: 38 }
    ],
    5: [
        { TaskID: 'e1', Duration: 35, Impact: 50 },
        { TaskID: 'e2', Duration: 45, Impact: 68 },
        { TaskID: 'e3', Duration: 20, Impact: 32 },
        { TaskID: 'e4', Duration: 28, Impact: 41 },
        { TaskID: 'e5', Duration: 14, Impact: 21 }
    ]
};

const notifications = [
    { ID: 'n1', Type: 'Placement', Message: 'Amazon internship applications closing tomorrow', Timestamp: '2026-05-02 15:30:00', studentId: '1042' },
    { ID: 'n2', Type: 'Placement', Message: 'Google hiring drive - Apply now!', Timestamp: '2026-05-02 14:45:00', studentId: '1042' },
    { ID: 'n3', Type: 'Placement', Message: 'Microsoft campus interview scheduled', Timestamp: '2026-04-30 11:00:00', studentId: '1042' },
    { ID: 'n4', Type: 'Result', Message: 'Final exam results published', Timestamp: '2026-05-02 08:15:00', studentId: '1042' },
    { ID: 'n5', Type: 'Result', Message: 'Assignment 3 grades available', Timestamp: '2026-04-28 09:30:00', studentId: '1042' },
    { ID: 'n6', Type: 'Event', Message: 'AI Workshop - Register now', Timestamp: '2026-05-02 12:00:00', studentId: '1042' },
    { ID: 'n7', Type: 'Event', Message: 'Hackathon 2026 registration', Timestamp: '2026-05-01 16:20:00', studentId: '1042' },
    { ID: 'n8', Type: 'Result', Message: 'Mid-sem result published', Timestamp: '2026-04-22 17:51:30', studentId: '1042' },
    { ID: 'n9', Type: 'Placement', Message: 'Nvidia Corporation hiring', Timestamp: '2026-05-01 17:21:33', studentId: '1042' },
    { ID: 'n10', Type: 'Event', Message: 'Sports fest nominations', Timestamp: '2026-04-27 13:45:00', studentId: '1042' }
];

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload, null, 2));
}

async function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            if (!body) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

function knapsack(vehicles, capacity) {
    const n = vehicles.length;
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const task = vehicles[i - 1];
        for (let w = 0; w <= capacity; w++) {
            if (task.Duration > w) {
                dp[i][w] = dp[i - 1][w];
            } else {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - task.Duration] + task.Impact);
            }
        }
    }

    return dp[n][capacity];
}

async function buildSchedulerResult() {
    const results = [];

    for (const depot of depots) {
        await Log('backend', 'info', 'demo-api', `Computing depot ${depot.ID}`);
        const vehicles = vehiclesByDepot[depot.ID] || [];
        const maxImpact = knapsack(vehicles, depot.MechanicHours);
        results.push({ depotId: depot.ID, mechanicHours: depot.MechanicHours, maxImpact });
    }

    return results;
}

async function buildPriorityResult(studentId, limit) {
    const priorityMap = { Placement: 3, Result: 2, Event: 1 };
    const studentNotifications = notifications.filter((item) => item.studentId === studentId);
    const sorted = studentNotifications.sort((a, b) => {
        const priorityA = priorityMap[a.Type] || 0;
        const priorityB = priorityMap[b.Type] || 0;

        if (priorityB !== priorityA) {
            return priorityB - priorityA;
        }

        return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    return sorted.slice(0, limit);
}

async function handler(req, res) {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    await Log('backend', 'info', 'demo-api', `${req.method} ${requestUrl.pathname}`);

    if (req.method === 'GET' && requestUrl.pathname === '/') {
        const filePath = path.join(__dirname, 'client.html');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(filePath, 'utf8'));
        return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/health') {
        sendJson(res, 200, { status: 'ok', service: 'backend-demo' });
        return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/depots') {
        sendJson(res, 200, { depots });
        return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/api/vehicles') {
        const depotId = Number(requestUrl.searchParams.get('depotId'));
        sendJson(res, 200, { vehicles: vehiclesByDepot[depotId] || [] });
        return;
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/scheduler/compute') {
        try {
            await readBody(req);
            const results = await buildSchedulerResult();
            sendJson(res, 200, { results });
            return;
        } catch (error) {
            await Log('backend', 'error', 'demo-api', error.message);
            sendJson(res, 400, { error: 'Invalid JSON body' });
            return;
        }
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/priority/top') {
        try {
            const body = await readBody(req);
            const studentId = String(body.studentId || '1042');
            const limit = Number(body.limit || 10);
            const topNotifications = await buildPriorityResult(studentId, limit);
            sendJson(res, 200, { notifications: topNotifications });
            return;
        } catch (error) {
            await Log('backend', 'error', 'demo-api', error.message);
            sendJson(res, 400, { error: 'Invalid JSON body' });
            return;
        }
    }

    sendJson(res, 404, { error: 'Route not found' });
}

http.createServer((req, res) => {
    handler(req, res).catch(async (error) => {
        await Log('backend', 'error', 'demo-api', error.message);
        sendJson(res, 500, { error: 'Internal server error' });
    });
}).listen(PORT, () => {
    Log('backend', 'info', 'demo-api', `Demo API listening on port ${PORT}`);
});
