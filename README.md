# Campus Hiring Evaluation Backend

This repository contains the backend deliverables for the campus hiring evaluation. It includes the logging middleware, the vehicle maintenance scheduler, the notification system design document, and a local backend demo used to capture output evidence from my own app.

## What’s Included

- Logging middleware: [logging_middleware/logger.js](logging_middleware/logger.js)
- Vehicle maintenance scheduler: [vehicle_maintenance_scheduler/scheduler.js](vehicle_maintenance_scheduler/scheduler.js)
- Notification system design: [notification_system_design.md](notification_system_design.md)
- Local demo API and browser client: [backend_api_demo/server.js](backend_api_demo/server.js) and [backend_api_demo/client.html](backend_api_demo/client.html)
- Output screenshots folder: [OUTPUT SCREENSHOTS](OUTPUT%20SCREENSHOTS)

## How to Run

Start the local demo API:

```bash
npm run demo:backend
```

Then open:

```text
http://localhost:4000/
```

From there you can trigger the two local API calls and capture the request body, response, and response time directly from the app.

## Output Screenshots

The screenshots below are stored in the repository under [OUTPUT SCREENSHOTS](OUTPUT%20SCREENSHOTS):

- [scheduler_client.png](OUTPUT%20SCREENSHOTS/scheduler_client.png)
- [priority_client.png](OUTPUT%20SCREENSHOTS/priority_client.png)
- [scheduler_output.png](OUTPUT%20SCREENSHOTS/scheduler_output.png)
- [priority_inbox_output.png](OUTPUT%20SCREENSHOTS/priority_inbox_output.png)

## Notes

- The code uses the mandatory logging middleware.
- The screenshot evidence is from the local backend demo, not the evaluation test server.
- The repository also includes HTML report files generated alongside the screenshots for convenient viewing.