const express = require('express');
const router = express.Router();
const { createPost, getAllPosts } = require('../controllers/community.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/posts', authMiddleware(), createPost);
router.get('/posts', getAllPosts);

module.exports = router;
