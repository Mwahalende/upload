const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

// MongoDB Atlas Connection
const dbURI = "mongodb+srv://user1:<db_password>@leodb.5mf7q.mongodb.net/?retryWrites=true&w=majority&appName=leodb";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch(err => console.error("Database Connection Error:", err));

// Define media schema
const mediaSchema = new mongoose.Schema({
  filename: String,
  mediaType: String,
  timestamp: { type: Date, default: Date.now }
});
const Media = mongoose.model("Media", mediaSchema);

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));
app.use(cors());
app.use(express.static("uploads"));

// Multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("media"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const mediaType = req.file.mimetype.startsWith("image") ? "image" : "video";
  const newMedia = new Media({ filename: req.file.filename, mediaType });
  await newMedia.save();

  res.json({ success: true, filename: req.file.filename, type: mediaType });
});

// Fetch media sorted by time (latest first)
app.get("/media", async (req, res) => {
  try {
    const media = await Media.find().sort({ timestamp: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
