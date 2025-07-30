if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

// const { initDB } = require("./init/index.js");
const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const dbUrl = process.env.ATLASDB_URL;

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session =  require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport =  require("passport");
const LocalStrategy = require("passport-local");
const User =  require("./models/user.js");

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("Error in Mongo Session Store",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly:  true,
    },
};

app.get("/", (req,res) => {
    res.redirect("/listings");
});

// app.get("/run-init-db", async (req, res) => {
//     try {
//         await initDB();
//         res.send("✅ Database has been initialized.");
//     } catch (err) {
//         console.error("Error during DB init:", err);
//         res.status(500).send("❌ Failed to initialize DB: " + err.message);
//     }
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

/*
app.get("/demouser",async (req,res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username:  "delta-student",
    })
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
});
*/

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.all("/{*any}",(req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});
/*
app.all("*",(req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});
*/
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went Wrong" } = err;

    // For Hoppscotch / API clients — send JSON
    if (req.headers.accept === "application/json" || req.xhr) {
        return res.status(statusCode).json({ error: message });
    }

    // For browser requests — send HTML with correct status
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("Server is listening to port 8080");
});