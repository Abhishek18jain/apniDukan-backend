import fileUpload from "express-fileupload"
import cloudinary  from "../configs/cloudinary.js"


export const uploadMiddleware = fileUpload({
useTempFiles:true,
tempFileDir:"./tmp/",
limits:{fileSize:2*1024*1024}
});
export const uploadToCloudinary = async(req , res , next) =>{
try {


    if(!req.files|| !req.files.bill ){
 return res.status(400).json({ success: false,
    message: "No file uploaded" });
    }
    const file = req.files.bill  ;

 const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "shopkeeper_bills"
 });
  req.fileUrl = result.secure_url;
    req.originalFileName = file.name;
    next();
} catch (error) {
     console.error("Upload Error:", error);
    return res.status(500).json({ success: false, message: "File upload failed" });
}
}