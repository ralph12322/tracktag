// gmail.ts
import fs from "fs";
import path from "path";
import { google } from "googleapis";

// === CONFIGURATION ===
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");

// Load credentials
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
const { client_secret, client_id, redirect_uris } = credentials.installed;

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Load token
if (fs.existsSync(TOKEN_PATH)) {
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
  oAuth2Client.setCredentials(token);
} else {
  console.error("Token not found. Run the OAuth2 flow first to generate token.json");
}

// Helper to encode email
function makeBody(to: string, subject: string, message: string) {
  const str = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=UTF-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n");

  // Base64 URL encode
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Send email
export async function sendEmail(to: string, subject: string, message: string) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const raw = makeBody(to, subject, message);

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}
