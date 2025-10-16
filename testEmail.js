import { sendEmail } from "./lib/alerts/gmail.ts";

(async () => {
  try {
    const result = await sendEmail(
      "tukmolraprap20@gmail.com", // recipient
      "Test Email",
      "Hello! This is a test email from Firebase + Gmail."
    );
    console.log("Email sent successfully:", result);
  } catch (err) {
    console.error("Error sending email:", err);
  }
})();
