const axios = require('axios');

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";

async function Log(stack, level, packageName, message) {
    try {
        const payload = {
            stack: stack,
            level: level,
            package: packageName,
            message: message
        };

        const response = await axios.post(LOG_API_URL, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(`[LOG] ${stack} | ${level} | ${packageName} | ${message}`);
        return response.data;
    } catch (error) {
        console.error(`[LOG FAILED] ${stack} | ${level} | ${packageName} | ${message}`);
    }
}

module.exports = Log;