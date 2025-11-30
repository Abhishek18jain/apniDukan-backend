import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log("header se token aaya hai", token);
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log("token laya tera bhai cookie se", token);
  } else {
    console.log("No token found in header or cookie");
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
