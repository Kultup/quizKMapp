const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 150
  },
  category: {
    type: String,
    required: true,
    enum: ['адміністратор_закладу', 'банкетний_менеджер', 'шеф_кухар', 'менеджер_звязку'],
    default: 'адміністратор_закладу'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  level: {
    type: String,
    enum: ['початковий', 'середній', 'старший', 'керівний'],
    default: 'середній'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
positionSchema.index({ name: 1 });
positionSchema.index({ category: 1 });
positionSchema.index({ level: 1 });
positionSchema.index({ isActive: 1 });

// Static methods
positionSchema.statics.getAll = async function(limit = 50, offset = 0, search = '', category = null, level = null) {
  const query = { isActive: true };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (level) {
    query.level = level;
  }

  const positions = await this.find(query)
    .sort({ category: 1, name: 1 })
    .limit(limit)
    .skip(offset)
    .populate('createdBy', 'firstName lastName');

  const total = await this.countDocuments(query);

  return { positions, total };
};

positionSchema.statics.createPosition = async function(positionData) {
  const position = new this(positionData);
  return await position.save();
};

positionSchema.statics.updatePosition = async function(id, updateData) {
  return await this.findByIdAndUpdate(id, updateData, { new: true });
};

positionSchema.statics.deletePosition = async function(id) {
  return await this.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

positionSchema.statics.getByCategory = async function(category) {
  return await this.find({ category, isActive: true })
    .sort({ name: 1 })
    .select('name level description');
};

positionSchema.statics.getStats = async function() {
  const totalPositions = await this.countDocuments({ isActive: true });
  const positionsByCategory = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const positionsByLevel = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return {
    totalPositions,
    positionsByCategory,
    positionsByLevel
  };
};

const Position = mongoose.model('Position', positionSchema);

module.exports = Position;