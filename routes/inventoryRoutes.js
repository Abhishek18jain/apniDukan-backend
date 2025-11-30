
import express from 'express';

import {
    addItem ,
     showItems ,
     getInactiveItems ,
     updateItemDate,
      updateItem, 
      deleteItem,   searchInventoryItems  } from "../controllers/inventoryController.js";
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/add', protect, addItem);
router.get('/show', protect, showItems);
router.put('/update/:id', protect, updateItem);
router.get("/not-ordered/:days", protect, getInactiveItems);
router.patch("/:id/date", protect, updateItemDate);
router.delete('/delete/:id', protect, deleteItem);
router.get("/search", protect, searchInventoryItems);



export default router;


