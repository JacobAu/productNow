// all middleware goes here
var Campground = require("../models/campground");
var Comment = require("../models/comment");


var middlewareObject = {
    isLoggedIn : function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        // user not logged in to do command
        req.flash("error", "You need to be logged in to do that");
        res.redirect("/login");
    },

    checkCampgroundOwnership : function(req, res, next){
        if(req.isAuthenticated()){
            Campground.findById(req.params.id, function(err,foundCampground){
                if(err || !foundCampground){
                    req.flash("error","Campground not found")
                    res.redirect("back");
                }
                else{
                    if(foundCampground.author.id.equals(req.user._id)){  //Do this to compare user ids
                        next();
                    }
                    else{
                        // not the right user
                        req.flash("error","You don't have permission to do that");
                        res.redirect("back");
                    }
                }
            });
        } else{
            // Not Logged in
            req.flash("error","You need to be logged in to that.");
            res.redirect("back");
        }
    },

    checkCommentOwnership: function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err,foundComment){
            if(err || !foundComment){
                req.flash('error',"comment not found");
                res.redirect("back");
            }
            else{
                if(foundComment.author.id.equals(req.user._id)){  //Do this to compare user ids
                    next();
                }
                else{
                    // not the right user
                    req.flash("error","You don't have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    } else{
        // Not Logged in
        req.flash("error","You need to be logged in to do that");
        res.redirect("back");
    }
}
};

module.exports = middlewareObject; 