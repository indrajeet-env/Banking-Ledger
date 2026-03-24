const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true, // Ensure that each token is unique in the blacklist to prevent duplicate entries
  },
  blacklistedAt: {
    type: Date,
    default: Date.now, // Automatically set the blacklistedAt field to the current date and time when a token is added to the blacklist
    immutable: true, 
  }
}, {
  timestamps: true, 
})

// Token is not kept in the blacklist forever, we can set an expiry time for the blacklisted tokens (TTL i.e Time To Live), for example, we can set the expiry time to 7 days, which means that after 7 days, the blacklisted token will be automatically removed from the blacklist collection in the database

tokenBlacklistSchema.index({createdAt: 1}, {expireAfterSeconds: 3 * 24 * 60 * 60}); // This creates a TTL index on the createdAt field, which will automatically remove documents from the collection after the specified number of seconds (in this case, 7 days)

const tokenBlacklistModel = mongoose.model('tokenBlacklist', tokenBlacklistSchema);

module.exports = tokenBlacklistModel;