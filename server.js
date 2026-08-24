const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/youtube', async (req, res) => {
    let ytUrl = req.query.url;
    if (!ytUrl) {
        return res.status(400).json({ status: false, error: "Please provide a YouTube URL!" });
    }

    try {
        // Using stable Cobalt public routing engine
        const response = await axios.post('https://co.wuk.sh/api/json', {
            url: ytUrl,
            vQuality: '720'
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        if (response.data && (response.data.status === 'stream' || response.data.status === 'redirect' || response.data.url)) {
            const downloadUrl = response.data.url || response.data.picker[0].url;
            return res.json({
                status: true,
                download_url: downloadUrl
            });
        } else {
            return res.status(400).json({ status: false, error: "Could not process this YouTube link." });
        }
    } catch (error) {
        return res.status(500).json({ status: false, error: "Server error or link blocked. Try again." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
