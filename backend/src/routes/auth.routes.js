const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateProfile, logout } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.post('/logout', logout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/?error=auth_failed' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`http://localhost:5173/?token=${token}`);
  }
);

module.exports = router;