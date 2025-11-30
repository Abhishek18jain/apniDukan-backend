
const UNITS_REGEX = /\b(?:kg|g|gm|grams|ltr|l|ml|pcs|pc|nos|no|kgm|kgs|litre|litres|packet|pkt|pkt\.)\b/gi;
const CURRENCY_AND_PRICE_REGEX = /(?:₹|rs|inr|rs\.)\s*[\d,\.]+|\b\d+[\.,]?\d*\b/gi;
const PAREN_CONTENT_REGEX = /\(.*?\)|\[.*?\]|{.*?}/g;
const SYMBOLS_REGEX = /[^\u0900-\u097Fa-zA-Z\s]/g; // keep Hindi (Devanagari) + English letters + spaces
const COMMON_NOISE_WORDS = [
  // English noise words often on bills
  "total", "subtotal", "mrp", "gst", "discount", "cash", "credit", "balance", "amount", "change",
  "rate", "tax", "qty", "quantity", "pack", "price", "bill", "invoice", "phone", "mobile",
  // Hindi noise words (lowercase, no accents)
  "कुल", "मात्रा", "रु", "रू", "बिल", "किराना", "कुलराशि", "शेष", "कुल", "राशि"
];

// normalize whitespace, lower-case (for matching), trim
const normalize = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();

// Remove diacritics if any (mostly for safety with foreign chars)
const removeDiacritics = (s) =>
  s.normalize ? s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "") : s;
  export const extractCleanName = (rawText) => {
    if (!rawText || typeof rawText !== "string") return null;
  
    let text = rawText;
  
    // Remove bracket content
    text = text.replace(PAREN_CONTENT_REGEX, "");
  
    // Remove units (kg, g, ml, etc)
    text = text.replace(UNITS_REGEX, "");
  
    // Remove currency & numbers
    text = text.replace(CURRENCY_AND_PRICE_REGEX, "");
  
    // Remove symbols
    text = text.replace(SYMBOLS_REGEX, "");
  
    text = removeDiacritics(text);
    text = normalize(text);
  
    // Remove noise words one by one
    for (const noise of COMMON_NOISE_WORDS) {
      const r = new RegExp(`\\b${noise}\\b`, "gi");
      text = text.replace(r, "");
    }
  
    // Clean final spacing
    text = text.replace(/\s+/g, " ").trim();
  
    if (!text || text.length < 2) return null;
  
    return text;
  };
  