const express = require('express');
const cors = require('cors');
const path = require('path');
const ytdl = require('ytdl-core');
const ytSearch = require('youtube-search-api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 🔍 Search route
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const searchResults = await ytSearch.GetListByKeyword(query, false, 10);
    const filtered = searchResults.items
      .filter(item => item.type === 'video')
      .map(video => ({
        videoId: video.id,
        title: video.title,
        channelTitle: video.channel.name
      }));

    res.json({ results: filtered });
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

// 🎵 Download route
app.get('/download', async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) return res.status(400).send('Missing video ID');

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const info = await ytdl.getInfo(url);
    res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp3"`);

    ytdl(url, {
      filter: 'audioonly',
      quality: 'highestaudio',
    }).pipe(res);
  } catch (err) {
    res.status(500).send('Download error');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
