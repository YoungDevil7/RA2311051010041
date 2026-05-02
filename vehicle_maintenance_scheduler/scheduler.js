const axios = require('axios');
const Log = require('../logging_middleware/logger');

const BASE_URL = "http://20.207.122.201/evaluation-service";
const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzZDQ3NTVAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzcwMTExNCwiaWF0IjoxNzc3NzAwMjE0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiODlhMWNhNjYtZGIwNS00OTkwLTgwODUtZTBjMzViY2JhODEzIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic291cnlhIHZhcm1hIGRhdGxhIiwic3ViIjoiNGIwY2FhYWItYjlmZS00ZDQwLThkYzktMTIxZTIxMmM0ZTJlIn0sImVtYWlsIjoic2Q0NzU1QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoic291cnlhIHZhcm1hIGRhdGxhIiwicm9sbE5vIjoicmEyMzExMDUxMDEwMDQxIiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNGIwY2FhYWItYjlmZS00ZDQwLThkYzktMTIxZTIxMmM0ZTJlIiwiY2xpZW50U2VjcmV0IjoiWFhjakFlSHZnRE5idUtVTiJ9.Bi2rRECLfyCHR-SabH1zZ3FsCAwe8E2jhm3LayCnhv4";

async function getDepots() {
    await Log("backend", "info", "scheduler", "Fetching depots");
    const res = await axios.get(`${BASE_URL}/depots`, {
        headers: { 'Authorization': `Bearer ${BEARER_TOKEN}` }
    });
    return res.data.depots;
}

async function getVehicles(depotId) {
    await Log("backend", "info", "scheduler", `Fetching vehicles for depot ${depotId}`);
    const res = await axios.get(`${BASE_URL}/vehicles?depotId=${depotId}`, {
        headers: { 'Authorization': `Bearer ${BEARER_TOKEN}` }
    });
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

    for (let depot of depots) {
        await Log("backend", "info", "scheduler", `Processing Depot ${depot.ID} - Mechanic Hours: ${depot.MechanicHours}`);

        const vehicles = await getVehicles(depot.ID);
        const maxImpact = knapsack(vehicles, depot.MechanicHours);

        console.log(`Depot ${depot.ID} → Max Impact: ${maxImpact}`);
        await Log("backend", "info", "scheduler", `Depot ${depot.ID} → Max Impact: ${maxImpact}`);
    }

    await Log("backend", "info", "scheduler", "Vehicle Maintenance Scheduler completed");
    console.log("✅ Scheduler completed successfully.");
}

main().catch(console.error);