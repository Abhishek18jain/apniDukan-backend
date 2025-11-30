import mongoose from "mongoose";
import User from "./User.js";
import Category from "./Category.js";
const inventorySchema = new mongoose.Schema({
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
 category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
   
      trim: true,
      required: true,
    },
    itemName:{
        type:String,
required:true,
trim:true

    }, lastOrdered:{
        type:Date,
        default:Date.now(),
        }
,
frequency:{
    default:7,
    type:Number
}
},
{timestamps:true})
inventorySchema.index({ itemName: "text" });

export default mongoose.model("Inventory", inventorySchema);