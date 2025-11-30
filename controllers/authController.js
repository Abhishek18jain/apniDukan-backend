import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import data from "../data.js"
import User from '../models/User.js';
import Category from "../models/Category.js"
import Inventory from "../models/Inventory.js"

export const registerUser = async (req, res) => {
  const { name, email, password, contact, address, shopName } = req.body;

  try {
    if (!name || !email || !password || !contact || !address || !shopName) {
      return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      contact,
      address,
      shopName
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
 for (const cat of data.categories) {

  // Create or reuse category for this user
  const newCat = await Category.findOneAndUpdate(
    { user: user._id, name: cat.name },
    { user: user._id, name: cat.name },
    { upsert: true, new: true }
  );

  // insert items
  const itemsInsert = cat.items.map((itemName) => ({
    itemName,
    category: newCat._id,
    user: user._id,
    frequency: 7,
    lastOrdered: null
  }));

  await Inventory.insertMany(itemsInsert);

      }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        shopName: user.shopName,
      

      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res
      .cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "User logged in successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          shopName: user.shopName,
          address:user.address
        },
      });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
