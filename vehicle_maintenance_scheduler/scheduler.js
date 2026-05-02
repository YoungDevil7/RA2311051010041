const axios = require('axios');

const BASE_URL = "http://20.207.122.201/evaluation-service";

async function getDepots() {
    const res = await axios.get(`${BASE_URL}/depots`);
    return res.data.depots;
}

async function getVehicles(depotId) {
    const res = await axios.get(`${BASE_URL}/vehicles?depotId=${depotId}`);
    return res.data.vehicles;
}

// 0/1 Knapsack - Maximize Impact without exceeding Mechanic Hours
function knapsack(tasks, capacity) {
    const n = tasks.length;
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const task = tasks[i - 1];
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
    console.log("🚀 Starting Vehicle Maintenance Scheduler...\n");

    const depots = await getDepots();

    for (let depot of depots) {
        console.log(`Depot ${depot.ID} - Available Mechanic Hours: ${depot.MechanicHours}`);

        const vehicles = await getVehicles(depot.ID);

        const maxImpact = knapsack(vehicles, depot.MechanicHours);

        console.log(`Maximum Impact Score achievable: ${maxImpact}\n`);
    }

    console.log("✅ Scheduler completed successfully.");
}

main().catch(console.error);