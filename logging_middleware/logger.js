const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const LOG_API = "http://20.207.122.201/evaluation-service/logs";

async function Log(stack, level, package, message) {
    try {
        const payload = {
            stack: stack,
            level: level,
            package: package,
            message: message
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        if (process.env.ACCESS_TOKEN) {
            headers.Authorization = `Bearer ${process.env.ACCESS_TOKEN}`;
        }

        const response = await axios.post(LOG_API, payload, { headers });
        return response.data;
    } catch (error) {
        return null;
    }
}

module.exports = Log;