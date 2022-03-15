require("dotenv").config()

const express = require("express");

const passport = require('passport')
const flash = require('connect-flash');
const session = require('express-session');

const methodOverride= require("method-override")


// Passport Config
require('./Util/authentication/passport')(passport)

// mongo db utils
const DB = require("./Util/mongoose/mongo")

const app =  express();



// body parser 
app.use(express.urlencoded({extended :false}));
app.use(methodOverride('_method'));

// using EJS 
app.set('view engine', 'ejs');
app.use(express.static("public"));

// express-session middleware 
app.use(session({
    secret : 'SomeRandomKey', // encription key for the cookies
    resave : true,
    saveUninitialized : true,
}))

// // passport middleware
app.use(passport.initialize());
app.use(passport.session());

// // connect flash 
app.use(flash());

// Global variables for error and success msg
app.use((req,res,next)=> {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
}) 

// app.use(express.static(path.join(__dirname, 'public')))

const PORT = process.env.SimpleWSPORT||6254;



app.listen(PORT,async ()=>{ 
    console.log(`sever started at port : ${PORT}`)
    // connecting to mongo
    // DB.ConnectDB()
    await DB.ConnectDB()
    .then(async()=>
    {
        // console.log("success")
        if(await DB.CheckForCoreData())
        {
            console.log("starting routes")
            StartRoutes() 
        }
        else
        {
            console.log("Core Data Check failed")
        }
    })
    .catch((err)=>
    {
        console.log(err)
        console.log("failed")
    })
});

// Routes
function StartRoutes() {
    app.use("/",require('./Util/routes/home'));
    app.use("/users",require('./Util/routes/users'));
    app.use("/usergroups",require('./Util/routes/usergroups'));
    app.use("/settings",require('./Util/routes/settings'));
}
module.exports.StartRoutes = StartRoutes;