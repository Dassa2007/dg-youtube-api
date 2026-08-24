const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/youtube', async (req, res) => {
    let ytUrl = req.query.url;
    if (!ytUrl) {
        return res.status(400).json({ status: false, error: "Please provide a YouTube URL using ?url=" });
    }

    try {
        // Using a stable alternative public API provider for YouTube
        const response = await axios.get(`https://apis.davidcyriltech.my.id/youtube?url=${encodeURIComponent(ytUrl)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        if (response.data && response.data.status === 200 && response.data.result) {
            const videoData = response.data.result;
            return res.json({
                status: true,
                result: {
                    title: videoData.title || "YouTube Video",
                    thumbnail: videoData.thumbnail || "https://i.imgur.com/35m47g3.png",
                    formats: [
                        { quality: "HD / Standard Quality", container: "mp4", url: videoData.download_url || videoData.video || videoData.url }
                    ]
                }
            });
        } else {
            return res.status(404).json({ status: false, error: "Could not fetch YouTube video. Try another link!" });
        }

    } catch (error) {
        return res.status(500).json({ status: false, error: "Failed to process YouTube link. Server is waking up, try again in 10 seconds." });
    }
});

// Download Proxy
app.get('/api/download', async (req, res) => {
    const fileUrl = req.query.url;
    if (!fileUrl) return res.status(400).send("Missing URL");

    try {
        const response = await axios({
            method: 'get',
            url: fileUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        res.setHeader('Content-Disposition', 'attachment; filename="YouTube-Video.mp4"');
        res.setHeader('Content-Type', 'video/mp4');
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send("Download failed.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`YouTube Server running on port ${PORT}`));
