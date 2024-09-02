if(process.env.NODE_ENV != "production"){
require('dotenv').config()
}

const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require('ejs-mate');
const ExpressError = require("./util/ExpressError.js");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Set EJS as templating engine
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600,

});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE : ",err);
});

const SessionOption = {
    store,
    secret: 'mysupersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};



// const db = 'mongodb://127.0.0.1:27017/wanderlust';

// Connect to MongoDB
async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connection successful");   111``
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

main();

// Session and Flash Middleware
app.use(session(SessionOption));
app.use(flash());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    res.locals.error = req.flash("error");
    res.locals.message = req.flash("message");
    res.locals.currUser = req.user;
    next();
});

// Routes
// app.get("/", (req, res) => {
//     res.send("Root Working");
// });

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// Catch-all route for 404 errors
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found!", 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    if (!res.headersSent) {
        res.status(statusCode).render("listings/error.ejs", { statusCode, message });
    } else {
        console.error('Headers already sent. Cannot send response.');
    }
});

// Start server
app.listen(8080, () => {
    console.log("Listening at port 8080");
});
