import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

const client_id = process.env.GMAIL_CLIENT_ID!;
const client_secret = process.env.GMAIL_CLIENT_SECRET!;
const redirect_uri = process.env.GMAIL_REDIRECT_URI!;
const refresh_token = process.env.GMAIL_REFRESH_TOKEN!;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
oAuth2Client.setCredentials({ refresh_token });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { to, subject, text } = req.body;

  if (!to || !subject || !text) return res.status(400).json({ error: 'Missing fields' });

  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const message = [
      `From: "TrackTag" <${process.env.GMAIL_USER}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      text,
    ].join('\n');

    const raw = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    res.status(200).json({ success: true, result });
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: error.message });
  }
}
