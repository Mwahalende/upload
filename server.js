const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect("mongodb+srv://user1:malafiki@leodb.5mf7q.mongodb.net/?retryWrites=true&w=majority&appName=leodb", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));


const mediaSchema = new mongoose.Schema({
  filename: String,
  type: String, // "image" or "video"
  timestamp: { type: Date, default: Date.now },
});

const Media = mongoose.model("Media", mediaSchema);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.use(cors());
app.use(express.static("uploads"));

// Upload media (image or video)
app.post("/upload", upload.single("media"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const mediaType = req.file.mimetype.startsWith("image") ? "image" : "video";
  const newMedia = new Media({ filename: req.file.filename, type: mediaType });

  try {
    await newMedia.save();
    res.json({ success: true, filename: req.file.filename, type: mediaType });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Fetch media sorted by timestamp
app.get("/media", async (req, res) => {
  try {
    const media = await Media.find().sort({ timestamp: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
