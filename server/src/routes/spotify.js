const express = require('express');
const router = express.Router();
const axios = require('axios');
const UserPreferences = require('../models/UserPreferences');
const { requireAuth } = require('../middleware/authMiddleware');

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

const SCOPES = [
    'user-top-read',
    'user-read-recently-played',
    'user-library-read',
].join(' ');

/**
 * GET /api/spotify/login
 * Redirect user to Spotify authorization page
 */
router.get('/login', requireAuth, (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI || `${process.env.CLIENT_URL}/spotify/callback`,
        scope: SCOPES,
        state: req.user.id, // Pass userId through state for security
        show_dialog: true,
    });

    res.json({ url: `${SPOTIFY_AUTH_URL}?${params.toString()}` });
});

/**
 * POST /api/spotify/callback
 * Exchange authorization code for tokens and fetch music taste
 */
router.post('/callback', requireAuth, async (req, res, next) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        // Exchange code for tokens
        const tokenResponse = await axios.post(SPOTIFY_TOKEN_URL, new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI || `${process.env.CLIENT_URL}/spotify/callback`,
            client_id: process.env.SPOTIFY_CLIENT_ID,
            client_secret: process.env.SPOTIFY_CLIENT_SECRET,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // Fetch top artists
        const artistsResponse = await axios.get(`${SPOTIFY_API_URL}/me/top/artists`, {
            headers: { 'Authorization': `Bearer ${access_token}` },
            params: { limit: 10, time_range: 'medium_term' },
        });

        // Fetch top tracks
        const tracksResponse = await axios.get(`${SPOTIFY_API_URL}/me/top/tracks`, {
            headers: { 'Authorization': `Bearer ${access_token}` },
            params: { limit: 10, time_range: 'medium_term' },
        });

        // Extract music taste data
        const topArtists = artistsResponse.data.items.map(a => a.name);
        const topGenres = [...new Set(artistsResponse.data.items.flatMap(a => a.genres))].slice(0, 10);
        const topTracks = tracksResponse.data.items.map(t => ({
            name: t.name,
            artist: t.artists[0]?.name || 'Unknown',
            uri: t.uri,
            previewUrl: t.preview_url,
        }));

        // Save to database
        await UserPreferences.findOneAndUpdate(
            { userId: req.user.id },
            {
                spotifyAccessToken: access_token,
                spotifyRefreshToken: refresh_token,
                spotifyTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
                musicTaste: { topArtists, topTracks, topGenres },
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            musicTaste: { topArtists, topTracks, topGenres },
        });
    } catch (error) {
        console.error('Spotify callback error:', error.response?.data || error.message);
        next(error);
    }
});

/**
 * GET /api/spotify/status
 * Check if user has connected Spotify
 */
router.get('/status', requireAuth, async (req, res, next) => {
    try {
        const prefs = await UserPreferences.findOne({ userId: req.user.id }).lean();

        res.json({
            connected: !!(prefs?.spotifyAccessToken),
            musicTaste: prefs?.musicTaste || null,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
