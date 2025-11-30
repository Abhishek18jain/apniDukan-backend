import Inventory from "../models/Inventory.js";
import { successResponse, errorResponse } from "../utlis/responseHandler.js";
import Category from "../models/Category.js";

// ✅ Add item (with auto-create or reuse category)
export const addItem = async (req, res) => {
  try {
    const { itemName, category, lastOrdered, frequency } = req.body;

    // 1️⃣ Validate required fields
    if (!itemName) {
      return res.status(400).json({ message: "Item name is required" });
    }

    // 2️⃣ Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // 3️⃣ Handle category logic (auto-create if missing)
    const categoryName = category?.trim() || "Uncategorized";

    const categoryDoc = await Category.findOneAndUpdate(
      { user: req.user._id, name: categoryName },
      { user: req.user._id, name: categoryName },
      { new: true, upsert: true }
    );

    // 4️⃣ Prevent duplicate items
    const existing = await Inventory.findOne({
      itemName: itemName.trim(),
      user: req.user._id,
    });
    if (existing) {
      return res.status(400).json({ message: "Item already exists" });
    }

    // 5️⃣ Create new item
    const newItem = await Inventory.create({
      itemName: itemName.trim(),
      category: categoryDoc._id,
      user: req.user._id,
      frequency: frequency || 7,
      lastOrdered: lastOrdered || null,
    });

    res.status(201).json({
      success: true,
      message: "Item added successfully",
      data: newItem,
    });
  } catch (error) {
    console.error("Error creating item:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Duplicate key error" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Get all items (no search)
export const showItems = async (req, res) => {
  try {
    const { category } = req.query;

    let query = { user: req.user._id };

    // ✅ Only filter if category is NOT "all"
    if (category && category !== "all") {
      query.category = category;
    }

    const items = await Inventory.find(query)
      .populate("category", "name")
      .sort({ name: -1 });

    return res.json(successResponse("Items fetched successfully", items));
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json(errorResponse("Server error"));
  }
};


// ✅ Update item details
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, category, frequency } = req.body;

    if (!itemName && !category && !frequency) {
      return res
        .status(400)
        .json(errorResponse("At least one field required to update"));
    }

    const updatedItem = await Inventory.findOneAndUpdate(
      { _id: id, user: req.user._id },
      {
        ...(itemName && { itemName }),
        ...(category && { category }),
        ...(frequency && { frequency }),
      },
      { new: true }
    );

    if (!updatedItem)
      return res
        .status(404)
        .json(errorResponse("Item not found or unauthorized"));

    return res.status(200).json(successResponse("Item updated successfully", updatedItem));
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json(errorResponse("Server error"));
  }
};


// ✅ Delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Inventory.findOneAndDelete({ _id: id, user: req.user });
    if (!deleted) {
      return res.status(404).json(errorResponse("Item not found"));
    }
    return res.status(200).json(successResponse("Item deleted successfully"));
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json(errorResponse("Server error"));
  }
};

// Temporary: Filter items older than X minutes
export const getInactiveItems = async (req, res) => {
  try {
    const days = parseInt(req.params.days); // now treating "days" as minutes for testing

    if (!days|| days < 7) {
      return res.status(400).json(errorResponse("Invalid days value"));
    }
    const threshold = new Date(Date.now() - days*24*60 *60* 1000);
    const inactiveItems = await Inventory.find({
      user: req.user._id,
      lastOrdered: { $lte: threshold }
    }).populate("category", "name");
    return res.json(successResponse("Inactive items fetched", inactiveItems));
  } catch (error) {
    console.error("Error getting inactive items:", error);
    return res.status(500).json(errorResponse("Server error"));
  }
};


// ✅ Update only lastOrderedDate (when checkbox clicked)
export const updateItemDate = async (req, res) => {
  try {
    const { id } = req.params;

    const itemUpdated = await Inventory.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { lastOrdered: new Date() },
      { new: true }
    );

    if (!itemUpdated) {
      return res.status(404).json(errorResponse("Item not found"));
    }

    return res.status(200).json(successResponse("Item date updated successfully", itemUpdated));
  } catch (error) {
    console.error("Error updating item date:", error);
    return res
      .status(500)
      .json(errorResponse("Server error while updating item date"));
  }
};
// ✅ SEARCH ITEMS (for billing autocomplete)
export const searchInventoryItems = async (req, res) => {
  try {
    const query = req.query.query?.trim() || "";
    if (!query) {
      return res.json({
        success: true,
        items: []
      });
    }

    // Find by partial match on itemName
    const items = await Inventory.find({
      user: req.user._id,
      itemName: { $regex: query, $options: "i" },
    })
      .select("itemName _id category")  // return only needed fields
      .limit(20);

    return res.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Error searching items:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
