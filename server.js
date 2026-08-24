const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.send('YouTube API is running successfully!');
});

// Download Route using stable public parsing backend
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    
    if (!videoUrl) {
        return res.status(400).json({ success: false, error: "Please provide a YouTube URL!" });
    }

    try {
        const fetch = (await import('node-fetch')).default;
        
        // අපි දැන් ඉතාමත් ස්ථාවර සහ වැඩ කරන Cobalt public API එකේ වෙනත් නිවැරදි ක්‍රමයක් පාවිච්චි කරමු
        const response = dgApiCall(videoUrl); // පහත ප්‍රධාන ලොජික් එක බලන්න
        
        const apiResponse = await fetch('https://co.wuk.sh/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: '720',
                isAudioOnly: false,
                filenamePattern: 'classic'
            })
        });

        const data = await apiResponse.json();

        if (data && (data.url || (data.picker && data.picker.length > 0))) {
            const downloadUrl = data.url || data.picker[0].url;
            return res.json({
                success: true,
                download_url: downloadUrl
            });
        } else {
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
