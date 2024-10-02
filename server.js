const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const connectDB = require('./db'); // Adjust the path if you put db.js in a different folder
const app = express();

require('dotenv').config();

// Connect to MongoDB
connectDB();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
    try {
        const shortUrls = await ShortUrl.find();
        console.log('Short URLs fetched:', shortUrls);
        res.render('index', { shortUrls: shortUrls });
    } catch (error) {
        console.error('Error fetching short URLs:', error);
        res.status(500).render('index', { shortUrls: [], error: 'Failed to fetch URLs' });
    }
});

app.post('/shortUrls', async (req, res) => {
    await ShortUrl.create({ full: req.body.fullUrl });
    res.redirect('/');
});

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) return res.sendStatus(404);
    shortUrl.clicks++;
    shortUrl.save();
    res.redirect(shortUrl.full);
});

app.delete('/deleteUrl/:shortUrl', async (req, res) => {
    try {
        console.log('Request hit the delete route');
        const { shortUrl } = req.params;

        // Find and remove the document
        const result = await ShortUrl.findOneAndDelete({ short: shortUrl });

        if (!result) {
            return res.status(404).json({ message: 'URL not found' });
        }

        // Send a success response
        res.status(200).json({ message: 'URL deleted successfully' });
    } catch (error) {
        console.error('Error deleting URL:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));