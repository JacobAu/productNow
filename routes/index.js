/// ======= Auth Routes ======= /// 
var express= require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user")
var middleware = require("../middleware/index");

// Landing page
router.get("/",function(req,res){
    res.render("landing");
});

// register new
router.get("/register",function(req,res){
    res.render("register");
});

// register create
router.post("/register",function(req,res){
    var newUser = new User({username : req.body.username});
    User.register(newUser, req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);
            return res.render("register");
        }
            req.flash("success","New account created, Welcome to yelpcamp!" + user.username);
            passport.authenticate("local")(req,res,function(){
            res.redirect("/campgrounds");
        })
    });
});

// login routes

// login form
router.get("/login",function(req,res){
    res.render("login");
});

// login logic post
router.post("/login",passport.authenticate("local",
    {
        successRedirect : "/campgrounds",
        failureRedirect : "/login"
    }),function(req,res){
        req.flash("success","successfully logged in");
});

// logout
router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","logged you out!"); // logout flash message
    res.redirect("/campgrounds");
});

module.exports = router;