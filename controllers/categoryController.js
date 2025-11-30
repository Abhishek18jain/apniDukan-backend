import Category from "../models/Category.js";
import Inventory from "../models/Inventory.js";
export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Category name is required" });
  }
  const existingCategory = await Category.findOne({ name, user: req.user._id });
  if (existingCategory) {
    return res
      .status(400)
      .json({ success: false, message: "Category already exists" });
  }
  const newCategory = await Category.create({ name, user: req.user._id });
  return res.status(200).json({ success: true, data: newCategory });
};
export const getAllCategories = async (req, res) => {
  const categories = await Category.find({ user: req.user._id }).sort({
    name: 1,
  });
  return res.status(200).json({ success: true, data: categories });
};
export const deleteCategory = async (req, res) =>{
  const categoryId = req.params.id;
  try {
    const category = await Category.findOne({
      _id:categoryId,
      user:req.user._id,
    })
    if(!category){
  return res.status(404).json({
        success: false,
        message: "Category not found or unauthorized",
      });
    }
      const itemCount = await Inventory.countDocuments({
      category: categoryId,
      user: req.user._id,
    });
     if (itemCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category — items exist inside it",
      });
    }   
     await Category.findByIdAndDelete(categoryId);

    return res.json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {
     console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",})
  }
}
 export const editCategory = async(req , res) =>{
try {
  const {id } = req.params;
  const {name} = req.body;
  if(!id && !name){
    return res.status(400).json(({
      message:"something went wrong"
    }))
    const updateCategory = await Category.findOneAndUpdate({_id : id , user: req.user._id},
      {name: name.trim()},
      {new:true}
    )
        if (!updateCategory) {
      return res.status(404).json(errorResponse("Category not found"));
    }
  return res.status(200).json(successResponse("Category updated", updated));
  }
} catch (error) {
   console.error(error);
    return res.status(500).json(errorResponse("Server error"));
  
}



}