const axios = require('axios');

const registrationData = {
  email: "sd4755@srmist.edu.in",
  name: "Sourya Varma Datla",
  mobileNo: "9441063377",
  githubUsername: "YoungDevil7",
  rollNo: "RA2311051010041",
  accessCode: "QkbpxH"
};

async function register() {
  try {
    console.log("📝 Registering with evaluation service...\n");
    
    const response = await axios.post(
      "http://20.207.122.201/evaluation-service/register",
      registrationData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log("✅ Registration Successful!\n");
    console.log("Response:", JSON.stringify(response.data, null, 2));
    
    if (response.data.clientID && response.data.clientSecret) {
      console.log("\n📌 SAVE THESE CREDENTIALS IMMEDIATELY:");
      console.log(`clientID: ${response.data.clientID}`);
      console.log(`clientSecret: ${response.data.clientSecret}`);
    }
  } catch (error) {
    console.error("❌ Registration Failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Error:", error.message);
    }
  }
}

register();
