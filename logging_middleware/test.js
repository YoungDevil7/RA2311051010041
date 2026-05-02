const Log = require('./logger');

async function test() {
    await Log("backend", "info", "controller", "User login successful");
    await Log("backend", "error", "handler", "Failed to connect to database");
    await Log("backend", "warn", "service", "High memory usage detected");
}

test();