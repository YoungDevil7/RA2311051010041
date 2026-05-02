const axios = require('axios');

const LOG_API = "http://20.207.122.201/evaluation-service/logs";
const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzZDQ3NTVAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzY5OTYzOSwiaWF0IjoxNzc3Njk4NzM5LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZmU5NzdjNzAtMmEyMS00YjQxLTkyOWMtYTJlMzAxZDA2MDIxIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic291cnlhIHZhcm1hIGRhdGxhIiwic3ViIjoiNGIwY2FhYWItYjlmZS00ZDQwLThkYzktMTIxZTIxMmM0ZTJlIn0sImVtYWlsIjoic2Q0NzU1QHNybWlzdC5lZHUuaW4iLCJuYW1lIjoic291cnlhIHZhcm1hIGRhdGxhIiwicm9sbE5vIjoicmEyMzExMDUxMDEwMDQxIiwiYWNjZXNzQ29kZSI6IlFrYnB4SCIsImNsaWVudElEIjoiNGIwY2FhYWItYjlmZS00ZDQwLThkYzktMTIxZTIxMmM0ZTJlIiwiY2xpZW50U2VjcmV0IjoiWFhjakFlSHZnRE5idUtVTiJ9.JFevg_bHUVU1dNhKNvVhNSn9gQghqttSWgS2ioTVxso";

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
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${BEARER_TOKEN}`
            }
        });

        console.log(`[LOG] ${stack} | ${level} | ${package} | ${message}`);
        return response.data;
    } catch (error) {
        console.error(`[LOG FAILED] ${stack} | ${level} | ${package} | ${message}`);
    }
}

module.exports = Log;