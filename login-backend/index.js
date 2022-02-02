import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import bcrypt from "bcrypt";
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

mongoose.connect(
  "mongodb://localhost:27017/loginDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Database Connected successfully!");
  },
);

// Routes

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }, async (err, user) => {
    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        res.send({ message: "Logged In Successfully!", user: user });
      } else {
        res.send({ message: "Password did not match!" });
      }
    } else {
      res.send({ message: "User Not Registered." });
    }
  });
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ message: "User Already Registered!" });
    } else {
      const user = new User({
        name,
        email,
        password,
      });

      user.save((err) => {
        if (err) {
          res.send(err);
        } else {
          res.send({ message: "User Registered Successfully!" });
        }
      });
    }
  });
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

// // hashing password
userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

// User Model
const User = new mongoose.model("User", userSchema);

app.listen(9002, () => {
  console.log("Server started at port 9002");
});
