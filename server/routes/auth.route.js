const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { asyncRouteHandler } = require('../utils/route.utils');

// router.get('/verify', asyncRouteHandler(authController.verify));
router.post('/register', asyncRouteHandler(authController.registerUser));
router.post('/login', asyncRouteHandler(authController.loginUser));
// router.post('/logout', asyncRouteHandler(authController.logout));
// router.post('/forgot-password', asyncRouteHandler(authController.forgotPassword));
// router.post('/change-password', asyncRouteHandler(authController.changePassword));

module.exports = router;
