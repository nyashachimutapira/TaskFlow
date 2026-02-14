const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const { generateToken } = require('../services/tokenService');

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            username: profile.displayName.replace(/\s+/g, '_').toLowerCase(),
            email: profile.emails[0].value,
            fullName: profile.displayName,
            password: 'oauth-' + Math.random().toString(36).substring(7),
          });
        }

        const token = generateToken(user._id);
        done(null, { user, token });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (!user) {
          user = await User.create({
            username: profile.username,
            email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
            fullName: profile.displayName || profile.username,
            password: 'oauth-' + Math.random().toString(36).substring(7),
          });
        }

        const token = generateToken(user._id);
        done(null, { user, token });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
