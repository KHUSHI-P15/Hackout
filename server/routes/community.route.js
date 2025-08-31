const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, getUnifiedLeaderboard } = require('../controllers/community.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/posts', authMiddleware(), createPost);
router.get('/posts', getAllPosts);

// Public unified leaderboard (no auth required)
router.get('/leaderboard', getUnifiedLeaderboard);

module.exports = router;
