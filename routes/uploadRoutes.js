import express from "express";
import { uploadBill, billHistory,confirmBill,getBillDetails } from "../controllers/billController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadMiddleware, uploadToCloudinary } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/upload", protect, uploadMiddleware, uploadToCloudinary, uploadBill);
router.get("/history", protect, billHistory);
router.post("/confirm/:billId", protect ,confirmBill  )
router.get("/details/:billId", protect, getBillDetails);  // <--- ADD THIS
// router.post("/confirm/:billId")
export default router;
