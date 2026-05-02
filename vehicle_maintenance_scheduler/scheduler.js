const axios = require('axios');
const Log = require('../logging_middleware/logger');

const BASE_URL = "http://20.207.122.201/evaluation-service";

async function getDepots() {
    await Log("backend", "info", "scheduler", "Fetching depots");
    const res = await axios.get(`${BASE_URL}/depots`);
    return res.data.depots;
}

async function getVehicles(depotId) {
    await Log("backend", "info", "scheduler", `Fetching vehicles for depot ${depotId}`);
    const res = await axios.get(`${BASE_URL}/vehicles?depotId=${depotId}`);
    return res.data.vehicles;
}

// 0/1 Knapsack to maximize Impact
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