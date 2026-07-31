const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home Route
app.get('/', (req, res) => {
    res.send('Server is running smoothly!');
});

// TON Connect Manifest Endpoint (FIXED)
app.get('/tonconnect-manifest.json', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    res.json({
        "url": "https://my-crypto-app-x6z7.onrender.com",
        "name": "MAI Network Mini App",
        "iconUrl": "https://raw.githubusercontent.com/ton-blockchain/token-logos/main/ton.png",
        "termsOfServiceUrl": "https://my-crypto-app-x6z7.onrender.com",
        "privacyPolicyUrl": "https://my-crypto-app-x6z7.onrender.com"
    });
});

// Telegram Bot Token Setup
const BOT_TOKEN = process.env.BOT_TOKEN || '8819278062:AAG...'; // Replace with actual token
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// Target Telegram Channels & Bots for Tasks
const CHANNELS = {
    newsChannel: '@MAI_News_Official',
    payoutChannel: '@MAI_Payout_Proof',
    communityChat: '@MAICommunityChat',
    partnerChannel1: '@Partner_Channel_Username' // Example Partner Channel
};

// Verify Membership API (Channels)
app.post('/api/verify-membership', async (req, res) => {
    const { userId, taskKey } = req.body;

    if (!userId || !taskKey) {
        return res.status(400).json({ success: false, isJoined: false, message: 'userId and taskKey required' });
    }

    const channelUsername = CHANNELS[taskKey];

    if (!channelUsername) {
        return res.status(400).json({ success: false, isJoined: false, message: 'Invalid taskKey' });
    }

    try {
        const member = await bot.getChatMember(channelUsername, userId);
        const isJoined = ['creator', 'administrator', 'member'].includes(member.status);

        return res.json({
            success: true,
            isJoined: isJoined,
            message: isJoined ? 'User is a channel member' : 'User is not a channel member'
        });
    } catch (error) {
        console.error(Error verifying ${channelUsername}:, error.message);
        return res.json({
            success: false,
            isJoined: isJoined,
            message: 'Verification failed. Ensure bot is an Admin.'
        });
    }
});

// Verify Ad Completion Endpoint
app.post('/api/verify-ad', (req, res) => {
    const { watchedDuration, hasClickedOpen } = req.body;

    // Must watch at least 10 seconds AND click Open Now
    if (watchedDuration >= 10 && hasClickedOpen) {
        return res.json({ success: true, reward: 2.0, message: 'Ad verified successfully' });
    } else {
        return res.json({ success: false, reward: 0, message: 'Ad criteria not met' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(Server running on port ${PORT});
});