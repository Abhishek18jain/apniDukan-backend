import Item from "../models/Inventory.js"


export const getDashboard = async (req , res) =>{
try {
    const user = req.user;
    if(!user){
        return res.status(400).json({
            message:"user not found"
        })
    }
    const totalItems = await Item.countDocuments({user:user._id})
    const now = new Date();
    const sevendaysAgo = new Date(now - 7*24*60*60*1000)
    const fifteendaysAgo = new Date(now - 15*24*60*60*1000)

    const notOrdered7 = await Item.countDocuments({user: user._id ,
        $or : [
            {lastOrderedDate : {$exists : false}},
            {lastOrderedDate : {$lt:sevendaysAgo}}
        ]
    }) 
    
    const notOrdered15 = await Item.countDocuments({user: user._id ,
        $or : [
            {lastOrderedDate : {$exists : false}},
            {lastOrderedDate : {$lt:fifteendaysAgo}}
        ]
    })
     return res.status(200).json({
        message:"Dashboard summary fetched successfully",
         user: {
          name: user.name,
          email: user.email,
          shopName: user.shopName,
        },
        stats: {
          totalItems,
          notOrdered7,
          notOrdered15,
        },
     })
    
} catch (error) {
        console.error("Error in dashboard summary:", error);
    return res
      .status(500)
      .json(errorResponse("Server error fetching dashboard data"));
   
}
}