const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  feedbackType: {
    type: String,
    default: 'general',
    enum: ['general', 'bug', 'feature', 'improvement']
  }
}, {
  timestamps: true
});

// Indexes
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ feedbackType: 1 });
feedbackSchema.index({ createdAt: -1 });

// Static methods
feedbackSchema.statics.createFeedback = async function(feedbackData) {
  const feedback = new this(feedbackData);
  return await feedback.save();
};

feedbackSchema.statics.getUserFeedback = async function(userId, limit = 10) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

feedbackSchema.statics.getAllFeedback = async function(limit = 50, offset = 0) {
  return await this.find({})
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset);
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;