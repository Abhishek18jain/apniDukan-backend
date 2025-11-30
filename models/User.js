import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String},
password:{
    type:String
},
contact :{
    type:Number
},
address:{
    type:String
},
shopName :{
    type:String
},
otp: { type: String },    
otpExpiry: {
    type:String
},
isVerified: { 
    type: Boolean, default: false 
}
})
export default mongoose.model("User",userSchema);