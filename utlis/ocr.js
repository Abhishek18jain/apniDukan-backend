import Tesseract from "tesseract.js";
export const textRecoginezer = async (imageUrl) => {
  const cleanLine = (text) => {
    if (!text) return "";
    return text
      .replace(/\d+/g, "")
      .replace(/kg|gm|ml|l|rs|₹/gi, "")
      .replace(/[^\u0900-\u097Fa-zA-Z ]/g, "")
      .trim();
  };

  const filterUsefulLines = (cleaned) => {
    return cleaned && /[A-Za-z\u0900-\u097F]/.test(cleaned);
  };

  const result = await Tesseract.recognize(imageUrl, "eng+hin");
  console.log(result);

  // Since your Tesseract config returns ONLY text:
  const lines = result.data.text.split("\n"); 

  const cleaned = lines
    .map((raw) => {
      const text = raw.trim();
      console.log(text)
      const cleanedText = cleanLine(text);
      return {
        rawText: text,
        cleanedText,
        confidence: result.data.confidence || 0,
      };
    })
    .filter((l) => filterUsefulLines(l.cleanedText));

  return cleaned;
};
