import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    default: ""
  },

  notes: {
    type: String,
    default: ""
  },

}, { timestamps: true });

export default mongoose.model("Customer", customerSchema);
