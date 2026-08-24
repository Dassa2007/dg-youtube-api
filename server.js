const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.send('YouTube API is running successfully!');
});

// Download Route
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    
    if (!videoUrl) {
        return res.status(400).json({ success: false, error: "Please provide a YouTube URL!" });
    }

    if (!ytdl.validateURL(videoUrl)) {
        return res.status(400).json({ success: false, error: "Invalid YouTube URL!" });
    }

    try {
        const info = await ytdl.getInfo(videoUrl);
        
        // උසස්ම තත්ත්වයේ (Audio + Video) ෆෝමැට් එක තෝරාගැනීම
        let format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });
        
        if (!format) {
            format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
        }

        if (format && format.url) {
            return res.json({
                success: true,
                download_url: format.url
            });
        } else {
            return res.status(400).json({ success: false, error: "Could not find a suitable video format." });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Server error or YouTube blocked the request." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
