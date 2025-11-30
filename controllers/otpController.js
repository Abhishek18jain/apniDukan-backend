import User from "../models/User.js";
import { sendMail } from "../utlis/nodeMailer.js";
import bcrypt from "bcrypt";
import {successResponse , errorResponse} from "../utlis/responseHandler.js"
 export const sendSignUpOtp = async (req, res) => {
  const { name, email, password, contact, address, shopName } = req.body;

  try {
    if (!name || !email || !password || !contact || !address || !shopName) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingVerified = await User.findOne({ email, isVerified: true });

    if (existingVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    await User.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password,  // raw for now, hash on verification
        contact,
        address,
        shopName,
        otp,
        otpExpiry,
        isVerified: false
      },
      { upsert: true, new: true }
    );

    await sendMail(email, "Your Signup OTP", `OTP is: ${otp}`);

    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

import data from "../data.js"; // your default categories/items

export const verifySignUpOtp = async (req, res) => {
  const { email, otp, name, password, contact, address, shopName } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid email" });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Update user
    user.name = name;
    user.password = hashed;
    user.contact = contact;
    user.address = address;
    user.shopName = shopName;
    user.isVerified = true;

    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    // ------------------------------------------------------------------
    // CREATE DEFAULT CATEGORIES & INVENTORY FOR NEW USER
    // ------------------------------------------------------------------
    for (const cat of data.categories) {
      // create category
      const newCat = await Category.findOneAndUpdate(
        { user: user._id, name: cat.name },
        { user: user._id, name: cat.name },
        { upsert: true, new: true }
      );

      // add items
      const itemsToInsert = cat.items.map((itemName) => ({
        itemName,
        category: newCat._id,
        user: user._id,
        frequency: 7,
        lastOrdered: null,
      }));

      await Inventory.insertMany(itemsToInsert);
    }

    return res.status(200).json({
      success: true,
      message: "Signup completed",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

 export const sendForgetOtp = async(req,res)=>{
      const { email } = req.body;
      try {
        const user = await User.findOne({email});
        if(!user){
            // return res.status(400).errorResponse("User not found")
            return res.json({
                message:"user not found"
            })
        }
        const otp = Math.floor(10000 + Math.random()*900000).toString();
        const otpExpiry = Date.now() + 5*60*1000;
        user.otp = otp;
        user.otpExpiry =otpExpiry;
        await user.save();
        await sendMail(email, "Reset Password OTP" , `Your OTP is ${otp}`)
         res.status(200).json({ message : "OTP sent successfully"});

      } catch (error) {
        console.log(error)
        res.status(500).json({message :"Server Error"})
      }
 }

 export const resetPasswordOtp = async(req,res) =>{
    const {email , otp , newPassword} = req.body;
    
    try {
        const user = await User.findOne({email});
        if(!user) return res.status(400).errorResponse("User not found");
        if(user.otp !== otp || user.otpExpiry < Date.now()){
            return res.status(400).json({message:"Invalid or Expired OTP"})
        }
        const hashed = await bcrypt.hash(newPassword,10);
        user.password = hashed;
        user.otp = undefined;
        user.otpExpiry =undefined
        await user.save();
        res.status(200).json({message:"Password Updated"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message :"Server Error"})
    }
 }