// Package imports // 
var express         = require("express"), 
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    User            = require("./models/user"),
    Product          = require("./models/product"),
    Comment         = require("./models/comment"),
    seedDB          = require("./seeds");

// requiring routes // 
var productRoutes    = require("./routes/product"),
    commentRoutes       = require("./routes/comments"),
    indexRoutes          = require("./routes/index"); 

// App Configurations
mongoose.set('useUnifiedTopology', true);
// mongoose.connect(prcoess.env.DATABASEURL,{useNewUrlParser:true}); // uncomment to use local db. 
// "mongodb://localhost/productnow"
mongoose.connect("mongodb://localhost/productnow",
    { 
        useNewUrlParser: true,
        useCreateIndex : true
    }).then(()=>{
        console.log("connected to db");
    }).catch(err =>{
        console.log("ERROR: ", err.message);
    });  //Specify the name of the database here

app.use(bodyParser.urlencoded({extended:true})); // middleware
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public")); // makes folder public, avaliable to all filesystems.
app.use(methodOverride("_method"));
app.use(flash());

// Passport Configurations
app.use(require("express-session")({
    secret: "dynamic arrays",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//seedDB(); // seed database into product


// runs this function on every page, to check if user is logged in. 
app.use(function(req,res,next){
    res.locals.currentUser = req.user; 
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Router connections 
app.use(indexRoutes);
app.use("/product",productRoutes);
app.use("/product/:id/comments",commentRoutes);

app.listen(3000, function(){
    console.log("productnow server has started");
});