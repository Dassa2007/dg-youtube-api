const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/youtube', async (req, res) => {
    let ytUrl = req.query.url;
    if (!ytUrl) {
        return res.status(400).json({ status: false, error: "Please provide a YouTube URL using ?url=" });
    }

    try {
        if (!ytdl.validateURL(ytUrl)) {
            return res.status(400).json({ status: false, error: "Invalid YouTube URL!" });
        }

        const info = await ytdl.getInfo(ytUrl);
        const title = info.videoDetails.title;
        const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
        
        // Filtering formats that have both video and audio or just video/audio
        const formats = info.formats
            .filter(format => format.hasVideo && format.hasAudio)
            .map(format => ({
                quality: format.qualityLabel,
                container: format.container,
                url: format.url
            }));

        // Fallback or specific formats if needed
        return res.json({
            status: true,
            result: {
                title: title,
                thumbnail: thumbnail,
                formats: formats
            }
        });

    } catch (error) {
        return res.status(500).json({ status: false, error: "Failed to fetch YouTube video info. YouTube might be blocking requests from cloud servers." });
    }
});

// Download Proxy to stream and force file download
app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    const title = req.query.title || 'video';
    if (!videoUrl) return res.status(400).send("Missing URL");

    try {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');
        
        ytdl(videoUrl, { quality: 'highest' }).pipe(res);
    } catch (error) {
        res.status(500).send("Download failed.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`YouTube Server running on port ${PORT}`));
