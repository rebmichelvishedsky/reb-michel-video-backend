const { google } = require("googleapis");
const readline = require("readline");

const oauth2Client = new google.auth.OAuth2(
  "YOUR_CLIENT_ID",
  "YOUR_CLIENT_SECRET",
  "http://localhost:3000/oauth2callback"
);

const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
});

console.log("Authorize this app by visiting:", authUrl);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Enter the code from that page here: ", async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log("Refresh Token:", tokens.refresh_token);
  rl.close();
});
