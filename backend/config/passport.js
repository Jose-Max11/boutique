import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config(); // load env variables

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // 1️⃣ Find user by Google ID
    let user = await User.findOne({ googleId: profile.id });
    if (user) return done(null, user);

    // 2️⃣ Link existing email user with Google ID
    user = await User.findOne({ email });
    if (user) {
      user.googleId = profile.id;
      await user.save();
      return done(null, user);
    }

    // 3️⃣ Create new user if not exist
    const role = email === "myadmin@gmail.com" ? "admin" : "user"; // ✅ set admin role for specific Gmail
    const newUser = new User({
      name: profile.displayName,
      email,
      googleId: profile.id,
      role
    });
    await newUser.save();
    done(null, newUser);

  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
