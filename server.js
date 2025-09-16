const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors({
origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
methods: ["GET", "POST"],
credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/basketDB", {
useNewUrlParser: true,
useUnifiedTopology: true,
});

// Schemas
const UserSchema = new mongoose.Schema({
firstname: String,
lastname: String,
username: String,
email: { type: String, unique: true },
password: String,
});

const ReviewSchema = new mongoose.Schema({
username: String,
review: String,
rating: Number,
});

const ProductSchema = new mongoose.Schema({
name: String,
price: Number,
image: String,
category: String
});

// Models
const User = mongoose.model("User", UserSchema);
const Review = mongoose.model("Review", ReviewSchema);
const Product = mongoose.model("Product", ProductSchema);

// Routes
// Signup
app.post("/signup", async (req, res) => {
try {
const { firstname, lastname, username, email, password } = req.body;
if (!firstname||!lastname||!username||!email||!password) {
return res.status(400).json({ success: false, message: "All fields are required." });
}
const existingUser = await User.findOne({ email });
if (existingUser) return res.status(400).json({ success: false, message: "Email already registered." });

const hashedPass = await bcrypt.hash(password, 10);
const user = new User({ firstname, lastname, username, email, password: hashedPass });
await user.save();
res.status(201).json({ success: true, message: "Signup successful!" });
} catch (err) {
console.error(err);
res.status(500).json({ success: false, message: "Server error." });
}
});

// Login
app.post("/login", async (req, res) => {
try {
const { email, password } = req.body;
const user = await User.findOne({ email });
if (!user) return res.status(400).json({ success: false, message: "User not found." });

const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect password." });

res.json({ success: true, message: "Login successful!" });
} catch (err) {
res.status(500).json({ success: false, message: "Server error." });
}
});

// Reviews
app.get("/review", async (req, res) => {
try {
const reviews = await Review.find().sort({ createdAt: -1 });
res.json(reviews);
} catch (err) {
res.status(500).json({ success: false, message: "Failed to load reviews" });
}
});

app.post("/review", async (req, res) => {
try {
const { username, review, rating } = req.body;
if (!username||!review||!rating) return res.status(400).json({ success: false, message: "All fields required" });
if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be 1-5" });

const newReview = new Review({ username, review, rating });
await newReview.save();
res.json({ success: true, message: "Review added!" });
} catch (err) {
res.status(500).json({ success: false, message: "Could not add review." });
}
});

// Products
app.get("/products", async (req, res) => {
try {
const { category, sort } = req.query;
let query = {};
if (category) query.category = category;

let productsQuery = Product.find(query);

if (sort === "low-to-high") productsQuery = productsQuery.sort({ price: 1 });
else if (sort === "high-to-low") productsQuery = productsQuery.sort({ price: -1 });

const products = await productsQuery.exec();
res.json(products);
} catch (err) {
console.error(err);
res.status(500).json({ error: "Failed to fetch products" });
}
});

app.post("/products", async (req, res) => {
try {
const { name, price, image, category } = req.body;
const product = new Product({ name, price, image, category });
await product.save();
res.json({ success: true, message: "Product added!" });
} catch (err) {
res.status(500).json({ success: false, error: err.message });
}
});

// Start server
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
