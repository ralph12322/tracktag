import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HomeContent from '@/components/HomeContent';
import { connectToDB } from '@/pages/api/start'; // move db logic here if not yet
import jwt from 'jsonwebtoken';

export default async function HomePage() {
  await connectToDB(); // Always await DB connection

  const cookieStore = await cookies(); // ✅ No need for 'await' here
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // You can pass decoded data to your component if needed
  } catch (err) {
    console.error('❌ Invalid or expired token:', err);
    redirect('/auth/login');
  }

  return <HomeContent />;
}
