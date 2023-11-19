# Fairplay-API-Wrapper

The Fairplay-API-Wrapper is a comprehensive JavaScript library designed to facilitate interactions with Economy Plus's infrastructure services. It offers an optimized approach to gathering information from multiple API endpoints and handling various types of server instances.

## Key Functionalities

- Gathers and manages backend resources such as guild information, member counts, kick records, and user activities.
- Constructs and controls frontend server entities including shards, load balancers, and batch processing servers.
- Provides real-time monitoring of the system's connectivity, measuring aspects such as the current online status, ping times, active connections, message processing, and system uptime.

## Usage

Start by ensuring that you have installed the `axios` library, which is a prerequisite for sending HTTP requests.

Below is a brief example demonstrating how to retrieve the connection status of the system using the wrapper:
```js
let fpAPI = require('./src/fairplay-api-wrapper');

(async () => {
  let connected = await fpAPI.get_connected();
  console.log(connected);
})();
```