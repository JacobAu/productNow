/// ===== Prodcut Routes ===== /// 
var express= require("express");
var router = express.Router();
var Product = require("../models/product");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");

// product INDEX
router.get("/",function(req,res){
    Product.find({},function(err, allProducts){
        if(err){
            console.log(err);
        }else{
            res.render("product/index",{product : allProducts});     
        }
    });
});

// product NEW
router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("product/new");
});

// product CREATE
router.post("/", middleware.isLoggedIn, function(req,res){
    // get data from form and add to product array
    var name = req.body.name; 
    var image = req.body.image; 
    var description = req.body.description; 
    var price = req.body.price;
    var newProduct = {
        name : name,
        image : image,
        description : description,
        price : price,
        author : {
            id: req.user._id,
            username : req.user.username 
        }
    }
    //create new product and save to database
    Product.create(newProduct, function(err,product){
            if(err){
                res.send("database was not updated");
                console.log(err);
            }
            else{
                //console.log("new:" + product);
                res.redirect("/product");
            }
        }
    )
});

// product SHOW 
router.get("/:id",function(req,res){
    //find the product with the provided id in the request made by the button
    Product.findById(req.params.id).populate('comments').exec(function(err, foundProduct){
        if(err ||!foundProduct){
            req.flash("error","product not found");
            res.redirect("/back");
        }    
        else{
            // render showpage with that product
            res.render("product/show",{product : foundProduct});
        }
    });
})

// EDIT product route 
router.get("/:id/edit", middleware.checkProductOwnership, function(req,res){
    Product.findById(req.params.id, function(err, foundProduct){
        req.flash("error","product not found");
         res.render("product/edit",{product : foundProduct});
    });
});
// UPDATE product route

router.put("/:id", middleware.checkProductOwnership, function(req,res){
    Product.findByIdAndUpdate(req.params.id, req.body.product, function(err,updatedProduct){
        if(err){
            res.redirect("/product");
        }
        else{
            res.redirect("/product/" +req.params.id);
        }
    });
});

// DESTROY product
router.delete("/:id", middleware.checkProductOwnership, function(req,res){
    Product.findById(req.params.id).populate("comments").exec(function(err,foundProduct){
        if(err){
            console.log(err.message);
            return res.redirect("back");
        }
        if(foundProduct.comments.length > 0){
            // remove all comments
            for(let i=0;i<foundProduct.comments.length; i++){
                Comment.findByIdAndRemove(foundProduct.comments[i]._id,function(err){
                    if(err){
                        console.log(err.message);
                        res.redirect("back");    
                    }
                    else{
                        removeProduct(foundProduct, req, res);
                    }
                })
            }
        }
        // remove product regardless, check for error too.
        else{
            removeProduct(foundProduct, req, res);
        }
            

    });
});

function removeProduct(foundProduct,req, res){
    foundProduct.remove(function(err){
        if(err){
            res.redirect("/product");
        }
        else{
            req.flash("success","Product deleted");
            res.redirect("/product");
        }
    });
}

module.exports = router;