const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');
const path = require('path');

const tokenManager = {
  token: null,
  expirationTime: null,
  async getAccessToken() {
    if (this.token && Date.now() < this.expirationTime) {
      return this.token;
    }
    
    const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/hackathon-YJIJ.json')));
    
    const auth = new GoogleAuth({
      keyFile: path.join(__dirname, '../config/hackathon-YJIJ.json'),
      scopes: 'https://www.googleapis.com/auth/cloud-platform', 
    });

    const client = await auth.getClient();

    const tokenResponse = await client.getAccessToken();

    this.token = tokenResponse.token;
    // change to now+expiretime
    this.expirationTime = Date.now() + 60 * 60 * 1000;

    return this.token;
  }
};

module.exports = tokenManager;
