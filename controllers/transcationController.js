import Customer from "../models/Customer.js";
import Transaction from "../models/Transcation.js";

// -----------------------------------------------------
// CREATE CUSTOMER
// -----------------------------------------------------
export const createCustomer = async (req, res) => {
  const { name, phone, notes } = req.body;

  try {
    const customer = await Customer.create({
      name,
      phone,
      notes,
      user: req.user._id
    });

    return res.status(200).json({ success: true, customer });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};


// -----------------------------------------------------
// SEARCH CUSTOMER: name or phone
// -----------------------------------------------------
export const searchCustomer = async (req, res) => {
  const { query } = req.query;

  try {
    const results = await Customer.find({
      user: req.user._id,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } }
      ]
    });

    return res.status(200).json({ success: true, results });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};


// -----------------------------------------------------
// GET CUSTOMER DETAILS + TRANSACTIONS + BALANCE
// -----------------------------------------------------
export const getCustomerDetails = async (req, res) => {
  const id = req.params.id;

  try {
    const customer = await Customer.findOne({
      _id: id,
      user: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const transactions = await Transaction.find({ customer: id })
      .sort({ createdAt: -1 });

    let given = 0,
      taken = 0;

    transactions.forEach((t) => {
      if (t.type === "given") given += t.amount;
      else taken += t.amount;
    });

    const balance = given - taken;

    return res.status(200).json({
      success: true,
      customer,
      transactions,
      totalGiven: given,
      totalTaken: taken,
      balance
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};


// -----------------------------------------------------
// EDIT CUSTOMER
// -----------------------------------------------------
export const editCustomer = async (req, res) => {
  const { name, phone, notes } = req.body;

  try {
    const updated = await Customer.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, phone, notes },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Customer not found" });

    return res.status(200).json({ success: true, updated });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};


// -----------------------------------------------------
// ADD TRANSACTION (given/taken)
// -----------------------------------------------------
export const addTransaction = async (req, res) => {
  const { customerId, type, amount, description } = req.body;

  try {
    const trx = await Transaction.create({
      customer: customerId,
      user: req.user._id,
      type,
      amount,
      description
    });

    return res.status(200).json({ success: true, trx });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};


// -----------------------------------------------------
// GET ALL TRANSACTIONS OF A CUSTOMER
// -----------------------------------------------------
export const getCustomerTransactions = async (req, res) => {
  try {
    const list = await Transaction.find({
      customer: req.params.id,
      user: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, list });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
// -----------------------------------------------------
//delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!deleted)
      return res.status(404).json({ message: "Customer not found" });
    // Also delete related transactions
    await Transaction.deleteMany({ customer: req.params.id, user: req.user._id });

    return res.status(200).json({ success: true, message: "Customer and related transactions deleted" });     
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};