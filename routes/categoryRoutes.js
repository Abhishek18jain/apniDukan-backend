import express from "express";
import { createCategory, getAllCategories, deleteCategory,editCategory } from "../controllers/categoryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/all", protect, getAllCategories);
router.post("/create", protect, createCategory);
router.delete("/:id", protect, deleteCategory);
router.put("/edit/:id" , protect , editCategory)



export default router;
