const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.send('YouTube API is running successfully!');
});

// Download Route using a reliable public alternative API
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    
    if (!videoUrl) {
        return res.status(400).json({ success: false, error: "Please provide a YouTube URL!" });
    }

    try {
        const fetch = (await import('node-fetch')).default;
        
        // වෙනත් ක්‍රියාත්මක වන ස්ථාවර පබ්ලික් ඉන්ස්ටන්ස් එකක් හරහා ලින්ක් එක ලබාගැනීම
        const response = await fetch(`https://tera-dl.pages.dev/api/download?url=${encodeURIComponent(videoUrl)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const data = await response.json();

        if (data && (data.url || data.downloadUrl || data.link)) {
            const downloadUrl = data.url || data.downloadUrl || data.link;
            return res.json({
                success: true,
                download_url: downloadUrl
            });
        } else {
            // වෙනත් විකල්ප API එකක් උත්සාහ කිරීම
            const backupResponse = await fetch(`https://co.wuk.sh/api/json`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: videoUrl, vQuality: '720' })
            });
            const backupData = await backupResponse.json();

            if (backupData && (backupData.url || backupData.picker)) {
                const dlUrl = backupData.url || backupData.picker[0].url;
                return res.json({ success: true, download_url: dlUrl });
            }

            return res.status(400).json({ success: false, error: "Could not fetch video. Try another link!" });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Server error occurred. Please try again." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
