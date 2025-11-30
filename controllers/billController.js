import Bill from "../models/Bill.js";
import Category from "../models/Category.js";
import Inventory from "../models/Inventory.js";
import { textRecoginezer } from "../utlis/ocr.js";
import { fuzzyMatchItems } from "../utlis/fuzzy.js";
import { extractCleanName } from "../utlis/cleanName.js";
export const uploadBill = async (req, res) => {
  try {
    console.log("uploading bill in controllers");
    const newBill = new Bill({
      userId: req.user._id,
      fileUrl: req.fileUrl,
      originalFileName: req.originalFileName,
    });
    console.log("going for ocr");
    const ocrLines = await textRecoginezer(req.fileUrl);
    console.log("done with ocr");
    const extractedItems = [];
    console.log("now for extracted items")
    for (const line of ocrLines) {
      const cleanName = extractCleanName(line.rawText);
      if (!cleanName) continue;

      const match = await fuzzyMatchItems(cleanName, req.user._id);
      extractedItems.push({
        rawText: line.rawText,
        confidence: line.confidence / 100,
        cleanName: cleanName,
        matchedItemId: match?.itemId || null,
        categoryId: match?.categoryId || null,
      });

      newBill.extractedItems = extractedItems;
    }
    await newBill.save();

    res.status(200).json({
      success: true,
      message: "Bill uploaded successfully",
      data: extractedItems,
      billId: newBill._id,
       extractedItems:newBill.extractedItems
      
    });
    console.log("done uploaded to cloudinary")
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const billHistory = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user._id }).sort({
      createAt: -1,
    });
    res.status(200).json({
      success: true,
      message: "Bills fetched successfully",
      data: bills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const confirmBill = async (req, res) => {
  try {
    console.log("called me controller")
    const billId = req.params.billId;
    const { items } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: "bill not found" });
    }
   let unCategorized = await Category.findOne({ name: "Uncategorized" });
if (!unCategorized) {
  unCategorized = await Category.create({ name: "Uncategorized" , user:req.user._id });
}
const UNCATEGORIZED_ID = unCategorized._id;
    bill.confirmedItems = [];
    for (const item of items) {
      const { cleanName, matchedItemId, categoryId } = item;

      let finalItemId;
      let finalCategoryId = categoryId || UNCATEGORIZED_ID;
      let action;
      if (matchedItemId) {
        const existingItem = await Inventory.findById(matchedItemId);

        // Update last ordered
        existingItem.lastOrdered = new Date();

        // Update category only if user selected one
        if (categoryId) {
existingItem.category = categoryId;
        }

        await existingItem.save();

        finalItemId = existingItem._id;
        action = "matched";
      }

      // CASE 2: new item
     if (!matchedItemId) {
  const newItem = await Inventory.create({
    itemName: cleanName,          // ✔ matches schema
    category: finalCategoryId,    // ✔ matches schema
    user: req.user._id,           // ✔ matches schema
    lastOrdered: new Date(),
  });

  finalItemId = newItem._id;
  action = "created";
}

      // Add to confirmedItems
      bill.confirmedItems.push({
        itemId: finalItemId,
        name: cleanName,
        categoryId: finalCategoryId,
        action,
      });
    }

    // 5. Save bill
    await bill.save();

    // Done
    return res.status(200).json({
      success: true,
      message: "Bill confirmed successfully",
      confirmedItems: bill.confirmedItems,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
};
export const getBillDetails = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json({
      billId,
      items: bill.extractedItems,   // <-- OCR processed items stored earlier
    });

  } catch (err) {
    console.error("Error fetching bill details:", err);
    res.status(500).json({ message: "Server error" });
  }
};
 