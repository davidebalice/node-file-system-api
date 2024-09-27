const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE;
const cookieParser = require("cookie-parser");

global.token = "";

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        /(^|\.)davidebalice\.dev$/.test(origin) ||
        /^http:\/\/localhost(:\d{1,5})?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
  })
);

mongoose.set("strictQuery", false);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB connections successfully");
  })
  .catch((err) => {
    console.error("Errore nella connessione a MongoDB:", err);
  });

var session = require("express-session");
var bodyParser = require("body-parser");

app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const authRouter = require("./routers/authRoutes");
const filesRouter = require("./routers/filesRoutes");

app.use("/api/", authRouter);
app.use("/api/", filesRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
