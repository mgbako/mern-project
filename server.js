const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();

const db = require("./config/keys").mongoURI;

const port = process.env.PORT || 3000;

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/json" }));

app.use(morgan("combined"));

mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected"))
  .catch(error => console.log(error));

app.get("/", (req, res) => {
  res.send("hello");
});

// Use Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);
app.listen(port, () => {
  console.log("Server running on " + "http://localhost:3000/");
});
