const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Log = require('../logging_middleware/logger');

const BASE_URL = "http://20.207.122.201/evaluation-service";
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function getDepots() {
    await Log("backend", "info", "scheduler", "Fetching depots");
    const headers = { 'Content-Type': 'application/json' };

    if (process.env.ACCESS_TOKEN) {
        headers.Authorization = `Bearer ${process.env.ACCESS_TOKEN}`;
    }

    const res = await axios.get(`${BASE_URL}/depots`, { headers });
    return res.data.depots;
}

async function getVehicles(depotId) {
    await Log("backend", "info", "scheduler", `Fetching vehicles for depot ${depotId}`);
    const headers = { 'Content-Type': 'application/json' };

    if (process.env.ACCESS_TOKEN) {
        headers.Authorization = `Bearer ${process.env.ACCESS_TOKEN}`;
    }

    const res = await axios.get(`${BASE_URL}/vehicles?depotId=${depotId}`, { headers });
    return res.data.vehicles;
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
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    dp[i - 1][w - task.Duration] + task.Impact
                );
            }
        }
    }
    return dp[n][capacity];
}

async function main() {
    await Log("backend", "info", "scheduler", "Starting Vehicle Maintenance Scheduler");

    const depots = await getDepots();
    const results = [];

    for (let depot of depots) {
        await Log("backend", "info", "scheduler", `Processing Depot ${depot.ID} - Mechanic Hours: ${depot.MechanicHours}`);

        const vehicles = await getVehicles(depot.ID);
        const maxImpact = knapsack(vehicles, depot.MechanicHours);

        await Log("backend", "info", "scheduler", `Depot ${depot.ID} → Max Impact: ${maxImpact}`);
        results.push({ depotId: depot.ID, mechanicHours: depot.MechanicHours, maxImpact });
    }

    await Log("backend", "info", "scheduler", "Vehicle Maintenance Scheduler completed");
    return results;
}

async function runDemo() {
    const results = await main();

    const rows = results.map((result) => `
        <tr>
            <td>${result.depotId}</td>
            <td>${result.mechanicHours}</td>
            <td>${result.maxImpact}</td>
        </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vehicle Maintenance Scheduler Output</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #f8fafc, #eef2ff);
                color: #111827;
                margin: 0;
                padding: 32px;
            }
            .card {
                max-width: 900px;
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
            }
            th {
                background: #f9fafb;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                font-size: 13px;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Vehicle Maintenance Scheduler Output</h1>
            <p>Maximum impact calculated for each depot using the 0/1 knapsack algorithm.</p>
            <table>
                <thead>
                    <tr>
                        <th>Depot</th>
                        <th>Mechanic Hours</th>
                        <th>Max Impact</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    </body>
    </html>`;

    fs.writeFileSync(path.join(__dirname, 'scheduler_output.html'), html, 'utf8');
}

if (require.main === module) {
    runDemo().catch((error) => Log("backend", "error", "scheduler", error.message));
}

module.exports = { main, getDepots, getVehicles, knapsack };