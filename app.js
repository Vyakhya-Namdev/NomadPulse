if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = 'mongodb://127.0.0.1:27017/nomadpulse';
const dbUrl = process.env.ATLASDB_URL;

main()
    .then((res) => {
        console.log("Connected to database");
    }).catch(err => {
        console.log("Not connecting to database", err);
    })
async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);  //used for same styling on multiple pages -> navbar
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET, //to store session infos for 24hrs
    },
    touchAfter: 24 * 3600, // time in seconds
});

store.on("error", () => {
    console.log("Error in MONGO SESSION STORE", err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  //(days*hours*mins*seconds*millisecs)
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,  //to protect from crashscriptting attacks
    }
};

app.use(session(sessionOptions));
app.use(flash());  //call before all routes

//Authentication & Authorization
app.use(passport.initialize());
app.use(passport.session());  //to identify session of same user
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curUser = req.user; 
    next();
});

// //Demo user
// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email: "student@yahoo.com",
//         username: "Fake Student"
//     });
//     //register is a static method of passport library use to register the student 
//     //by passing its username password
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings", reviewRouter);
app.use("/", userRouter);

/*app.get("/testListing", async (req, res) => {
    let sampleListing = new Listing({
        title: "My New Villa",
        description: "By the beach",
        price: 1200,
        loaction: "Calangute, Goa",
        country: "India",
    });

    await sampleListing.save();
    console.log("Dataset Loaded");
    res.send("Successfully saved");
})*/

//this error will generate when none of the above routes matches with the request ( * -> all routes[that don't match])
app.use((req, res, next) => {
    const err = new ExpressError(404, "Page Not Found!");
    next(err);
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
    //res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Connected to server, port 8080");
})