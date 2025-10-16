// pages/api/feedback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '../start';
import { Feedback } from '@/lib/models/feedback';
import { User } from '@/lib/models/user';

type Data = {
  success: boolean;
  data?: any;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await connectToDB();

  if (req.method === 'POST') {
    const { name, email, message } = req.body;

    // Validate input
    const realUser = await User.findOne({ email });
    if (!realUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!name || !realUser || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
      const feedback = await Feedback.create({ name, realUser, message });
      return res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } 
  else if (req.method === 'GET') {
    try {
      const feedbacks = await Feedback.find();
      console.log(feedbacks);
      return res.status(200).json({ success: true, data: feedbacks });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } 
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
}
