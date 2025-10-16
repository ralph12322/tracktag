import db from "../firebase/firebaseAdmin";
import { sendEmail } from "./gmail";

export async function checkPriceAndAlert() {
  const collectionRef = db.collection("trackedProducts");
  const snapshot = await collectionRef.get();

  snapshot.forEach(async (doc) => {
    const data = doc.data();
    const { title, currentPrice, email, url } = data;

    // Here you’d compare with previous price stored somewhere
    // For demo, let’s just alert for all products
    await sendEmail(
      email,
      `Price Update for ${title}`,
      `<p>The product <a href="${url}">${title}</a> currently costs $${currentPrice}.</p>`
    );
    console.log(`Alert sent to ${email} for ${title}`);
  });
}
