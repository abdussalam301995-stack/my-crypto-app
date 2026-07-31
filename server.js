const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const path = require('path');

// Middleware to serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve index.html when opening the website
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Middleware
app.use(cors());
app.use(express.json());


// Telegram Bot Setup
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// Base URL configuration (from environment variables or default fallback)
const BASE_URL = process.env.BASE_URL || 'https://my-crypto-app-uz50.onrender.com';

// Target Telegram Channels & Groups for Task Verification
const CHANNELS = {
  newsChannel: '@MAI_News_Official',
  payoutChannel: '@MAI_Payout_Proof',
  communityChat: '@MAICommunityChat',
  partnerChannel1: '@Partner_Channel_Username'
};

// ------------------- ROUTES ------------------- //

// Root Health Check Route
app.get('/', (req, res) => {
  res.status(200).send('Server is running smoothly!');
});

// TON Connect Manifest Endpoint
app.get('/tonconnect-manifest.json', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  res.json({
    url: BASE_URL,
    name: 'MAI Network',
    iconUrl: `${BASE_URL}/mai-coin.jpg`,
    termsOfDeliveryUrl: BASE_URL,
    privacyPolicyUrl: BASE_URL
  });
});

// Verify Membership API Endpoint
app.post('/api/verify-membership', async (req, res) => {
  const { userId, taskKey } = req.body;

  if (!userId || !taskKey) {
    return res.status(400).json({
      success: false,
      isJoined: false,
      message: 'Both userId and taskKey are required.'
    });
  }

  const channelUsername = CHANNELS[taskKey];

  if (!channelUsername) {
    return res.status(400).json({
      success: false,
      isJoined: false,
      message: 'Invalid taskKey provided.'
    });
  }

  try {
    const member = await bot.getChatMember(channelUsername, userId);
    const validStatuses = ['creator', 'administrator', 'member'];
    const isJoined = validStatuses.includes(member.status);

    return res.status(200).json({
      success: true,
      isJoined,
      message: isJoined ? 'User is a channel member.' : 'User is not a channel member.'
    });
  } catch (error) {
    console.error(`[Membership Check Error] Channel: ${channelUsername} | User: ${userId} | Error:`, error.message);
    
    return res.status(500).json({
      success: false,
      isJoined: false,
      message: 'Verification failed. Please make sure the bot is an Admin in the target channel.'
    });
  }
});

// Verify Ad Completion API Endpoint
app.post('/api/verify-ad', (req, res) => {
  const { watchedDuration, hasClickedOpen } = req.body;

  // Verification Criteria: minimum 10 seconds duration and click interaction
  if (watchedDuration >= 10 && hasClickedOpen) {
    return res.status(200).json({
      success: true,
      reward: 2.0,
      message: 'Ad verified successfully.'
    });
  }

  return res.status(400).json({
    success: false,
    reward: 0,
    message: 'Ad criteria not met. Must watch for at least 10 seconds and click open.'
  });
});

// Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});