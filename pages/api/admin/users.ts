// pages/api/admin/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '../start';
import { User } from '@/lib/models/user';
import jwt from 'jsonwebtoken';

type Data = {
  success: boolean;
  data?: any;
  message?: string;
};

// Helper function to verify JWT token and extract user
function verifyToken(req: NextApiRequest) {
  try {
    const token = req.cookies.authToken;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      user: {
        _id: string;
        username: string;
        email: string;
        role: string;
      };
    };
    return decoded.user;
  } catch (error) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await connectToDB();

  // Check if user is authenticated
  const user = verifyToken(req);
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Please login' 
    });
  }

  // Check if user has admin role
  if (user.role !== 'Admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden - Admin access required' 
    });
  }

  if (req.method === 'GET') {
    try {
      // Fetch all users, sorted by creation date (newest first)
      // Select only necessary fields and exclude sensitive data like passwords
      const users = await User.find({})
        .select('email username role isVerified createdAt lastLogin')
        .sort({ createdAt: -1 });

      return res.status(200).json({ 
        success: true, 
        data: users 
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  } 
  else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed` 
    });
  }
}