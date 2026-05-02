const axios = require('axios');

const authData = {
  email: "sd4755@srmist.edu.in",
  name: "Sourya Varma Datla",
  rollNo: "RA2311051010041",
  accessCode: "QkbpxH",
  clientID: "4b0caaab-b9fe-4d40-8dc9-121e212c4e2e",
  clientSecret: "XXcjAeHvgDNbuKUN"
};

async function authenticate() {
  try {
    console.log("🔐 Authenticating with evaluation service...\n");
    
    const response = await axios.post(
      "http://20.207.122.201/evaluation-service/auth",
      authData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log("✅ Authentication Successful!\n");
    console.log("Response:", JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log("\n📌 SAVE THIS TOKEN:");
      console.log(`token: ${response.data.token}`);
    }
  } catch (error) {
    console.error("❌ Authentication Failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Error:", error.message);
    }
  }
}

authenticate();
