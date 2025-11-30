import mongoose, { mongo } from "mongoose";
import { type } from "os";

const billSchema = new mongoose.Schema({

userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true

},
fileUrl :{
    type:String,
    require:true
},
originalFileName:{
    type:String
},
uploadAt:{
    type:Date
},
extractedItems :
[
      {
        rawText: String,
        confidence: Number,
      },
],
confirmedItems: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
        name: String,
        action: {
          type: String,
          enum: ["matched", "created", "ignored"],
          default: "matched",
        },
      },
    ],
    extractedItems: [
    {
      rawText: String,
      cleanName: String,
      categoryId: String,
      confidence: Number,
      matchedItemId: String
    }
  ]

}) 
export default mongoose.model("Bill" , billSchema)