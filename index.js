require("dotenv").config();

//MONGOOSE
const connectDB = require("./config/db");
connectDB();

//EXPRESS
const express = require("express");
const app = express();
app.use(express.static("public"));

//EJS
const ejs = require("ejs");
app.set("view engine", "ejs");

//LODASH
const _ = require("lodash");
app.locals._ = _;

//BODY PARSER (Express Implementation)
app.use(express.urlencoded({ extended: true }));

//EXPRESS SESSION
const session = require("express-session");
app.use(
  session({
    secret: process.env.EXPSESSIONSECRET || "SomeSecret",
    resave: false,
    saveUninitialized: false,
  })
);

//PASSPORTjs
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/userModel.js");

passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

if (
  process.env.DEFAULTADMINNAME !== "" &&
  process.env.DEFAULTADMINPASSWORD !== "" &&
  process.env.ADMINMAIL !== ""
) {
  console.log("Starting default admin user functionality");
  User.findOne({ username: process.env.DEFAULTADMINNAME }, (err, user) => {
    console.log("User found: ", user);
    if (!user) {
      User.register(
        {
          username: process.env.DEFAULTADMINNAME,
          email: process.env.ADMINMAIL,
        },
        process.env.DEFAULTADMINPASS,
        (err, user) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Default admin user created");
          }
        }
      );
    } else {
      console.log("Default admin user already exists");
    }
  });
}

//ROUTES
app.use("/", require("./routes/main.js"));
app.use("/hizmetler", require("./routes/hizmetler.js"));
app.use("/admin", require("./routes/admin.js"));
app.use("/isler", require("./routes/works.js"));

//CONNECT TO SERVER
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started on port " + process.env.PORT);
});
