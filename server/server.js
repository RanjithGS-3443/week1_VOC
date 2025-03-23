require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Auction = require("./models/Auction");
const router = express.Router();


const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret";

// ✅ Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// ✅ Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/auction", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 📁 Configure Multer for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ✅ Schemas & Models
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { collection: "users" }
);
const User = mongoose.model("User", UserSchema);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    sellerName: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "products" }
);
const Product = mongoose.model("Product", ProductSchema);

const PaymentSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    biddedAmount: { type: Number, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "payments" }
);
const Payment = mongoose.model("Payment", PaymentSchema);
// ✅ User Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ User Registration
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



// 🛡️ Middleware: JWT Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(403).json({ message: "Access Denied" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Token missing" });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// ✅ Add Product (With Image Upload)
app.post("/api/products/add", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { name, description, startingPrice, sellerName, sellerEmail } = req.body;
    if (!name || !description || !startingPrice || !sellerName || !sellerEmail || !req.file)
      return res.status(400).json({ message: "All fields and image are required" });

    const newProduct = new Product({
      name,
      description,
      startingPrice,
      sellerName,
      sellerEmail,
      imageUrl: `/uploads/${req.file.filename}`,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("❌ Product Upload Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get All Products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 📌 Get Single Product by ID (Auction Details)
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
app.get("/api/auctions/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Auction ID" });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    
    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/products/:id/bid", async (req, res) => {
  const { id } = req.params;
  const { bidAmount } = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (bidAmount <= product.highestBid) {
      return res.status(400).json({ success: false, message: "Bid must be higher than the current highest bid!" });
    }

    // Update highest bid
    product.highestBid = bidAmount;
    await product.save();

    res.json({ success: true, message: "Bid placed successfully!" });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || id.length !== 24) {
    return res.status(400).json({ error: "Invalid product ID" });
  }
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Payment Processing
app.post("/api/payment", async (req, res) => {
  const { productId, bidderName, amount, cardNumber, expiryDate, cvv } = req.body;

  // Simple validation
  if (!productId || !bidderName || !amount || cardNumber.length !== 16 || cvv.length !== 3) {
    return res.status(400).json({ success: false, message: "Invalid payment details!" });
  }

  // Simulate payment processing
  console.log(`💳 Payment successful for ${bidderName} - $${amount}`);
  res.json({ success: true, message: "Payment successful!" });
});


// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
