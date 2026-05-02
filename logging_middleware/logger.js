const axios = require('axios');

const LOG_API = "http://20.207.122.201/evaluation-service/logs";

async function Log(stack, level, package, message) {
    try {
        const payload = {
            stack: stack,
            level: level,
            package: package,
            message: message
        };

        const response = await axios.post(LOG_API, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`[LOG] ${stack} | ${level} | ${package} | ${message}`);
        return response.data;
    } catch (error) {
        console.error(`[LOG FAILED] ${stack} | ${level} | ${package} | ${message}`);
    }
}

module.exports = Log;