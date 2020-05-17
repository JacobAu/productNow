/// ===== Campground Routes ===== /// 
var express= require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");

// campground INDEX
router.get("/",function(req,res){
    Campground.find({},function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index",{campgrounds : allCampgrounds});     
        }
    });
});

// campground NEW
router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});

// campground CREATE
router.post("/", middleware.isLoggedIn, function(req,res){
    // get data from form and add to campgrounds array
    var name = req.body.name; 
    var image = req.body.image; 
    var description = req.body.description; 
    var price = req.body.price;
    var newCampground = {
        name : name,
        image : image,
        description : description,
        price : price,
        author : {
            id: req.user._id,
            username : req.user.username 
        }
    }
    //create new campground and save to database
    Campground.create(newCampground, function(err,campground){
            if(err){
                res.send("database was not updated");
                console.log(err);
            }
            else{
                //console.log("new:" + campground);
                res.redirect("/campgrounds");
            }
        }
    )
});

// campground SHOW 
router.get("/:id",function(req,res){
    //find the campground with the provided id in the request made by the button
    Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
        if(err ||!foundCampground){
            req.flash("error","campground not found");
            res.redirect("/back");
        }    
        else{
            // render showpage with that campground
            // console.log(foundCampground)
            res.render("campgrounds/show",{campground : foundCampground});
        }
    });
})

// EDIT Campground route 
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
        req.flash("error","Campground not found");
         res.render("campgrounds/edit",{campground : foundCampground});
    });
});
// UPDATE Campground route

router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err,updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            res.redirect("/campgrounds/" +req.params.id);
        }
    });
});

// DESTROY Campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err){
            console.log(err.message);
            return res.redirect("back");
        }
        if(foundCampground.comments.length > 0){
            // remove all comments
            for(let i=0;i<foundCampground.comments.length; i++){
                Comment.findByIdAndRemove(foundCampground.comments[i]._id,function(err){
                    if(err){
                        console.log(err.message);
                        res.redirect("back");    
                    }
                    else{
                        removeCampground(foundCampground, req, res);
                    }
                })
            }
        }
        // remove campground regardless, check for error too.
        else{
            removeCampground(foundCampground, req, res);
        }
            

    });
});

function removeCampground(foundCampground,req, res){
    foundCampground.remove(function(err){
        if(err){
            res.redirect("/campgrounds");
        }
        else{
            req.flash("success","Campground deleted");
            res.redirect("/campgrounds");
        }
    });
}

module.exports = router;