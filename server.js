const express = require("express");
const multer = require("multer");
const { google } = require("googleapis");
const cors = require("cors");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors({ origin: process.env.CORS_ORIGIN }));

// Root route for testing
app.get("/", (req, res) => {
  res.send("✅ Reb Michel Video Backend is running");
});

// Google OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const youtube = google.youtube({ version: "v3", auth: oauth2Client });

// Route: upload video
app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const videoTitle = req.body.title || "Memory Video";

    // Use resumable upload for large files
    const response = await youtube.videos.insert(
      {
        part: "snippet,status",
        requestBody: {
          snippet: { title: videoTitle, description: "Uploaded via Memorial Site" },
          status: { privacyStatus: "unlisted" }
        },
        media: { body: fs.createReadStream(filePath) },
        notifySubscribers: false
      },
      {
        resumable: true
      }
    );

    // cleanup temp file
    fs.unlinkSync(filePath);

    const videoId = response.data.id;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    res.json({ videoId, embedUrl });

  } catch (err) {
    console.error("Upload error:", err);

    // send detailed error to frontend for debugging
    res.status(500).json({
      message: "Upload failed",
      error: err.message,
      details: err.response?.data || null
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
