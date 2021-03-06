var express= require("express");
var router = express.Router({mergeParams:true});
var Product = require("../models/product");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");

// Comments NEW 
router.get("/new", middleware.isLoggedIn,function(req,res){
    // find product by id
    Product.findById(req.params.id,function(err,foundProduct){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new",{product : foundProduct});
        }
    });
});

// Comments Create
router.post("/", middleware.isLoggedIn,function(req,res){
    Product.findById(req.params.id,function(err, foundProduct){
        if(err){
            console.log(err);
            req.flash("error","Something went wrong");
            res.redirect("/product");
        }
        else{
            Comment.create(req.body.comment,function(err, comment){
                if(err){
                    req.flash("error","Something went wrong");
                    console.log(err);
                }
                else{
                    // add username and id to comments
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    // save comment
                    foundProduct.comments.push(comment);
                    foundProduct.save();
                    //console.log(comment);
                    req.flash("success","Successfully created comment");
                    res.redirect("/product/" + foundProduct._id);
                }
            });
        }
    });
})

// Edit Page 
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req,res){
    Product.findById(req.params.id, function(err, foundProduct){
        if(err || !foundProduct){
            req.flash("error","product not found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err,foundComment){
            if(err || !foundComment){
                res.redirect("back");
            }
            else{
                res.render("comments/edit",{
                    product_id : req.params.id,
                    comment : foundComment
                });
            }
        });
    });
});

// UPDATE Route - Put request
router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }
        else{
            res.redirect("/product/" + req.params.id);
        }
    });
});

// Destroy Route - delete request
router.delete("/:comment_id", middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("success","Comment deleted");
            res.redirect("/product/" + req.params.id);
        }
    });
}) 

module.exports = router;