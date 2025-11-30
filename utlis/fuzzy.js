import jaroWinkler from "jaro-winkler";
import Inventory from "../models/Inventory.js";
const SIMILARITY_THRESHOLD = 0.7;

export const fuzzyMatchItems = async(cleanName , userId) =>{
 const items = await Inventory.find({userId});
 let bestMatch = null;
 let bestScore = 0;

 for(const item of items){
    const score = jaroWinkler(cleanName.toLowerCase(), item.name.toLowerCase());
    if(score>bestScore){
bestScore = score;
bestMatch:item;
    }
 }
  if (bestScore >= SIMILARITY_THRESHOLD) {
    return {
      itemId: bestMatch._id,
      categoryId: bestMatch.categoryId,
      score: bestScore
    };
  }
  return null;



}