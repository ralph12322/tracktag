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

// Helper to encode email with HTML support
function makeBody(to: string, subject: string, htmlMessage: string, textMessage?: string) {
  const boundary = "boundary_" + Date.now();
  
  const str = [
    `To: ${to}`,
    `From: TrackTag <${process.env.GMAIL_USER || 'noreply@tracktag.com'}>`,
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    textMessage || htmlMessage.replace(/<[^>]*>/g, ''), // Strip HTML for plain text fallback
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    htmlMessage,
    "",
    `--${boundary}--`,
  ].join("\n");

  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Send email (raw version - backwards compatible)
export async function sendEmail(to: string, subject: string, message: string) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  const raw = makeBody(to, subject, message);

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
    console.log('Email sent successfully:', res.data.id);
    return res.data;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}

// Send HTML email
export async function sendHtmlEmail(to: string, subject: string, html: string) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  const raw = makeBody(to, subject, html);

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
    console.log('HTML email sent successfully:', res.data.id);
    return res.data;
  } catch (err) {
    console.error("Error sending HTML email:", err);
    throw err;
  }
}

/**
 * Generates a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends OTP email using Gmail API
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  type: 'login' | 'signup'
): Promise<boolean> {
  try {
    const action = type === 'login' ? 'log in to' : 'verify';
    const subject = `TrackTag - Your ${type === 'login' ? 'Login' : 'Verification'} Code`;
    const html = getOTPEmailTemplate(otp, type, action);

    await sendHtmlEmail(email, subject, html);
    console.log(`OTP email sent to ${email} for ${type}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

/**
 * Generates HTML email template for OTP
 */
function getOTPEmailTemplate(
  otp: string,
  type: 'login' | 'signup',
  action: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          margin-top: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        h1 {
          color: white;
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 800;
        }
        h2 {
          color: #0f172a;
          margin: 0 0 15px 0;
          font-size: 24px;
        }
        .otp-code {
          font-size: 42px;
          font-weight: bold;
          letter-spacing: 12px;
          color: #0d9488;
          background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%);
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          border: 2px solid #99f6e4;
        }
        .info-text {
          color: #475569;
          font-size: 16px;
          margin: 15px 0;
        }
        .warning-text {
          color: #dc2626;
          font-weight: 600;
          font-size: 15px;
          margin: 20px 0;
        }
        .security-note {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          text-align: left;
        }
        .security-note p {
          margin: 0;
          color: #78350f;
          font-size: 14px;
        }
        .footer {
          color: #e0f2fe;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        .footer p {
          margin: 5px 0;
        }
        .footer a {
          color: #e0f2fe;
          text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
          .container {
            padding: 30px 15px;
          }
          .content {
            padding: 20px;
          }
          .otp-code {
            font-size: 36px;
            letter-spacing: 8px;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <div class="logo">🔐</div>
          <h1>TrackTag</h1>
          
          <div class="content">
            <h2>Your Verification Code</h2>
            <p class="info-text">Use this code to ${action} your TrackTag account:</p>
            
            <div class="otp-code">${otp}</div>
            
            <p class="warning-text">⏱️ This code will expire in 10 minutes</p>
            
            <div class="security-note">
              <p><strong>🛡️ Security Note:</strong></p>
              <p>Never share this code with anyone. TrackTag staff will never ask for your verification code.</p>
            </div>
            
            <p class="info-text">
              If you didn't request this code, please ignore this email and ensure your account is secure.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>TrackTag Team</strong></p>
            <p>© ${new Date().getFullYear()} TrackTag. All rights reserved.</p>
            <p style="margin-top: 15px; font-size: 12px;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    // Try to get user profile to verify connection
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    await gmail.users.getProfile({ userId: "me" });
    console.log('Gmail API connection successful!');
    return true;
  } catch (error) {
    console.error('Gmail API connection failed:', error);
    return false;
  }
}

/**
 * Validates OTP format
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Checks if OTP has expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}