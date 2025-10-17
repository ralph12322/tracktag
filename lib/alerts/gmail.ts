import { google } from "googleapis";

// === CONFIGURATION ===
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

// Load credentials from environment variables
const client_id = process.env.GMAIL_CLIENT_ID!;
const client_secret = process.env.GMAIL_CLIENT_SECRET!;
const redirect_uri = process.env.GMAIL_REDIRECT_URI!;
const refresh_token = process.env.GMAIL_REFRESH_TOKEN!;

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
oAuth2Client.setCredentials({ refresh_token });

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
      requestBody: { raw },
    });
    return res.data;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}
