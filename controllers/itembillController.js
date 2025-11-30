import Bill from "../models/itemBill.js";
import Customer from "../models/Customer.js";
import Transaction from "../models/Transcation.js";

/**
 * POST /api/bills/create
 * body: { customerName, customerPhone, items: [{name, qty, unit, amount}], discount (number), paid (number), notes }
 * Behaviour:
 *  - calculates subtotal, total, due
 *  - if phone provided and customer not exists -> create customer
 *  - save bill
 *  - if due > 0 and customer exists -> create Transaction (type: 'given') to record due
 */
export const createBill = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      customerName = "",
      customerPhone = "",
      items = [],
      discount = 0,
      paid = 0,
      notes = ""
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Add at least one item to the bill" });
    }

    // Calculate subtotal (sum of item.amount * 1 OR assume item.amount already final row amount)
    // Here we assume amount is per-row total (qty accounted). If you want per unit price, multiply.
    let subtotal = 0;
    for (const it of items) {
      const rowAmount = Number(it.amount || 0);
      subtotal += rowAmount;
    }

    const discountNum = Number(discount || 0);
    const total = Math.max(0, subtotal - discountNum); // not negative
    const paidNum = Number(paid || 0);
    const due = Math.max(0, total - paidNum);

    // Find or create customer (if phone provided)
    let customer = null;
    if (customerPhone && customerPhone.trim() !== "") {
      customer = await Customer.findOne({ phone: customerPhone, user: userId });
      if (!customer) {
        // create new customer
        customer = await Customer.create({
          user: userId,
          name: customerName || (customerPhone ? "Customer" : ""),
          phone: customerPhone,
          notes: ""
        });
      }
    }

    // Save bill
    const bill = await Bill.create({
      user: userId,
      customer: customer ? customer._id : null,
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      items,
      subtotal,
      discount: discountNum,
      total,
      paid: paidNum,
      due,
      notes
    });

    // If due exists and we have a customer -> create transaction entry automatically
    if (due > 0 && customer) {
      // 'given' indicates customer owes you (matching earlier logic)
      await Transaction.create({
        customer: customer._id,
        user: userId,
        type: "given",
        amount: due,
        description: `Due from bill ${bill._id}`,
      });
    }

    return res.status(201).json({ success: true, bill });
  } catch (error) {
    console.error("createBill error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/bills
 * query: page, limit, search (customerName/phone)
 */
export const listBills = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const q = (req.query.search || "").trim();

    const filter = { user: userId };
    if (q) {
      filter.$or = [
        { customerName: { $regex: q, $options: "i" } },
        { customerPhone: { $regex: q, $options: "i" } }
      ];
    }

    const [list, total] = await Promise.all([
      Bill.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("customer").lean(),
      Bill.countDocuments(filter)
    ]);

    return res.status(200).json({ success: true, list, total, page, limit });
  } catch (error) {
    console.error("listBills error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/bills/:id
 */
export const getBill = async (req, res) => {
  try {
    const billId = req.params.id;
    const userId = req.user._id;

    const bill = await Bill.findOne({ _id: billId, user: userId }).populate("customer").lean();
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    return res.status(200).json({ success: true, bill });
  } catch (error) {
    console.error("getBill error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/bills/customer-balance?phone=XXXXXXXX
 * Returns aggregated balance (given - taken) for matching customer by phone.
 * If multiple customers with same phone for the user, it sums them (rare).
 */
export const getCustomerBalanceByPhone = async (req, res) => {
  try {
    const userId = req.user._id;
    const phone = (req.query.phone || "").trim();
    if (!phone) return res.status(400).json({ message: "phone is required" });

    const customer = await Customer.findOne({ phone, user: userId });
    if (!customer) return res.status(200).json({ success: true, balance: 0, customer: null });

    // compute balance using Transaction model
    const txs = await Transaction.find({ customer: customer._id, user: userId }).lean();

    let given = 0, taken = 0;
    txs.forEach(t => {
      if (t.type === "given") given += (t.amount || 0);
      else taken += (t.amount || 0);
    });

    const balance = given - taken; // positive => customer owes you
    return res.status(200).json({ success: true, balance, customer });
  } catch (error) {
    console.error("getCustomerBalanceByPhone error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
