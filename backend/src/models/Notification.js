const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    default: 'info',
    enum: ['info', 'warning', 'success', 'error', 'quiz', 'system']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ sentAt: -1 });
notificationSchema.index({ type: 1 });

// Static methods
notificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  return await notification.save();
};

notificationSchema.statics.getUserNotifications = async function(userId, limit = 20, offset = 0) {
  return await this.find({ userId })
    .sort({ sentAt: -1 })
    .limit(limit)
    .skip(offset);
};

notificationSchema.statics.markAsRead = async function(id, userId) {
  return await this.findOneAndUpdate(
    { _id: id, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ userId, isRead: false });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;