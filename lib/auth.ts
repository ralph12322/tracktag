import jwt from 'jsonwebtoken';

export function generateToken(user: {
  _id: string;
  username: string;
  email: string;
  role: string;
}) {
  return jwt.sign(
    {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}
