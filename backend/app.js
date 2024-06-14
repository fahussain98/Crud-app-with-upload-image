const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 9060;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connecting to the database
mongoose.connect("mongodb://localhost:27017/cloudy", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  rollnumber: String,
  lastname: String,
  image: String  // Add image field to store image path or URL
});

// Create model
const User = mongoose.model("users", userSchema);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Directory to save uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Ensure unique filenames
  }
});
const upload = multer({ storage });

// Create new user with image upload
app.post("/add", upload.single('image'), async (req, res) => {
  const { name, email, password, rollnumber, lastname } = req.body;
  const image = req.file ? req.file.filename : null;
  try {
    const newUser = await User.create({
      name,
      email,
      password,
      rollnumber,
      lastname,
      image
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error });
  }
});

// Update user with image upload
app.put("/update/:id", upload.single('image'), async (req, res) => {
  const id = req.params.id;
  const { name, email, password, rollnumber, lastname } = req.body;
  const image = req.file ? req.file.filename : null;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password, rollnumber, lastname, ...(image && { image }) },
      { new: true }
    );
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error });
  }
});

// Delete a user by ID
app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (deletedUser) {
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
