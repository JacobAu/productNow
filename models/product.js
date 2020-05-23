var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    name : String, 
    image : String,
    description : String,
    price : String,
    author : {
        id:{
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        username : String
    },
    comments :  [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});
var Product = mongoose.model("Product",productSchema);
module.exports = Product;