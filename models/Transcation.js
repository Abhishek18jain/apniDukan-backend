import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["given", "taken"],
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
