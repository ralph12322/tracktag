// pages/api/feedback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '../start';
import { Feedback } from '@/lib/models/feedback';
import { User } from '@/lib/models/user';
import { filterGoodFeedbacks } from '@/lib/utils/helper'

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

 if (req.method === 'GET') {
    try {
      const feedbacks = await Feedback.find();
      const { all } = filterGoodFeedbacks(feedbacks);

      // Convert Mongoose documents to plain objects
      const cleanGood = all.map(f => ({
        _id: f._doc._id,
        name: f._doc.name,
        email: f._doc.email,
        message: f._doc.message,
        createdAt: f._doc.createdAt,
        analysis: f.analysis.sentiment,
      }));
      return res.status(200).json({
        success: true,
        data: cleanGood
        },
      );
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
