const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: true
  },
  institution: {
    type: String,
    trim: true,
    maxlength: 200
  },
  gender: {
    type: String,
    enum: ['чоловіча', 'жіноча', 'інше']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },

  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  passwordHash: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  totalScore: {
    type: Number,
    default: 0
  },
  testsCompleted: {
    type: Number,
    default: 0
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ username: 1 });

userSchema.index({ city: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ totalScore: -1 });

// Static methods
userSchema.statics.createUser = async function(userData) {
  const user = new this(userData);
  return await user.save();
};



userSchema.statics.findById = async function(id) {
  return await this.findOne({ _id: id }).select('-passwordHash');
};

userSchema.statics.updateLastLogin = async function(id) {
  return await this.findByIdAndUpdate(id, { lastLogin: new Date() });
};

userSchema.statics.updateScore = async function(id, additionalScore) {
  return await this.findByIdAndUpdate(
    id, 
    { 
      $inc: { 
        totalScore: additionalScore, 
        testsCompleted: 1 
      } 
    },
    { new: true }
  );
};

userSchema.statics.getAll = async function(limit = 50, offset = 0) {
  return await this.find({})
    .select('-passwordHash')
    .sort({ totalScore: -1, registrationDate: -1 })
    .limit(limit)
    .skip(offset);
};

userSchema.statics.getLeaderboard = async function(limit = 10) {
  return await this.find({ isActive: true })
    .select('firstName lastName city position totalScore testsCompleted')
    .sort({ totalScore: -1, testsCompleted: -1 })
    .limit(limit);
};

userSchema.statics.deactivate = async function(id) {
  return await this.findByIdAndUpdate(id, { isActive: false });
};

userSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
        newUsers30Days: {
          $sum: {
            $cond: [
              { $gte: ['$registrationDate', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        },
        avgScore: { $avg: '$totalScore' },
        maxScore: { $max: '$totalScore' }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    newUsers30Days: 0,
    avgScore: 0,
    maxScore: 0
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;