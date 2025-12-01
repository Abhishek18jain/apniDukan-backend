import express from "express";
import {
  createCustomer,
  searchCustomer,
  getCustomerDetails,
  editCustomer,
  addTransaction,
  getCustomerTransactions,deleteCustomer 
} from '../controllers/transcationController.js'  // FIXED SPELLING

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CUSTOMER ROUTES
router.post("/create", protect, createCustomer);                // POST /customers
router.get("/search", protect, searchCustomer);           // GET /customers/search
router.get("/details/:id", protect, getCustomerDetails);          // GET /customers/:id
router.put("/update/:id", protect, editCustomer);                // PUT /customers/:id
router.delete("/deleteCustomer/:id", protect, deleteCustomer);           

// TRANSACTION ROUTES (properly namespaced)
router.post("/addTransaction/:id/", protect, addTransaction);        // POST /customers/:id/transactions
router.get("/amount/:id/", protect, getCustomerTransactions); // GET /customers/:id/transactions

export default router;
