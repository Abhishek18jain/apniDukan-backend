import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createBill,
  listBills,
  getBill,
  getCustomerBalanceByPhone
} from "../controllers/itembillController.js";

const router = express.Router();

router.post("/create", protect, createBill);
router.get("/", protect, listBills);
router.get("/:id", protect, getBill);

// helper endpoint to check if customer phone has existing due
router.get("/customer-balance", protect, getCustomerBalanceByPhone);

export default router;
