const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;
const SECRET_KEY = "supersecretkey"; // use env variable in production

app.use(cors());
app.use(bodyParser.json());

// --- MongoDB Connection ---
mongoose.connect("mongodb://localhost:27017/reviewResponder", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// --- Schemas ---
const ReviewSchema = new mongoose.Schema({
  text: String,
  reply: String,
  tone: String,
  createdAt: { type: Date, default: Date.now }
});

const ToneSchema = new mongoose.Schema({
  name: String
});

const Review = mongoose.model("Review", ReviewSchema);
const Tone = mongoose.model("Tone", ToneSchema);

// --- AUTH ROUTES ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "password123") {
    const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- APP ROUTES ---
app.post("/generate-reply", async (req, res) => {
  const { review, tone } = req.body;
  const reply = `(${tone} tone)\n\nThank you for your feedback: "${review}". We truly appreciate you and look forward to serving you again!`;

  const newReview = new Review({ text: review, reply, tone });
  await newReview.save();

  res.json({ reply });
});

// --- ADMIN ROUTES ---
app.get("/admin-data", authenticateToken, async (req, res) => {
  const reviews = await Review.find();
  const tones = await Tone.find();
  res.json({ reviews, tones });
});

app.post("/add-tone", authenticateToken, async (req, res) => {
  const { tone } = req.body;
  const newTone = new Tone({ name: tone });
  await newTone.save();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
