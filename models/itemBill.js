import mongoose from "mongoose";

const BillItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 },
  unit: { type: String, default: "" }, // kg / g / packet / litre / pcs
  amount: { type: Number, required: true, default: 0 } // amount for the row (unit price * qty or final row amount)
}, { _id: false });

const BillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
  customerName: { type: String, default: "" },
  customerPhone: { type: String, default: "" },

  items: { type: [BillItemSchema], default: [] },

  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 }, // numeric amount
  total: { type: Number, default: 0 },

  paid: { type: Number, default: 0 },
  due: { type: Number, default: 0 },

  date: { type: Date, default: Date.now },
  notes: { type: String, default: "" },

}, { timestamps: true });

export default mongoose.model("itemBill", BillSchema);
