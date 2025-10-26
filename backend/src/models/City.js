const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  region: {
    type: String,
    trim: true,
    maxlength: 100
  },
  country: {
    type: String,
    default: 'Україна',
    trim: true,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
citySchema.index({ name: 1 });
citySchema.index({ region: 1 });
citySchema.index({ isActive: 1 });

// Static methods
citySchema.statics.getAll = async function(limit = 50, offset = 0, search = '') {
  const query = { isActive: true };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { region: { $regex: search, $options: 'i' } }
    ];
  }

  const cities = await this.find(query)
    .sort({ name: 1 })
    .limit(limit)
    .skip(offset)
    .populate('createdBy', 'firstName lastName');

  const total = await this.countDocuments(query);

  return { cities, total };
};

citySchema.statics.createCity = async function(cityData) {
  const city = new this(cityData);
  return await city.save();
};

citySchema.statics.updateCity = async function(id, updateData) {
  return await this.findByIdAndUpdate(id, updateData, { new: true });
};

citySchema.statics.deleteCity = async function(id) {
  return await this.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

citySchema.statics.getStats = async function() {
  const totalCities = await this.countDocuments({ isActive: true });
  const totalRegions = await this.distinct('region', { isActive: true });
  
  return {
    totalCities,
    totalRegions: totalRegions.length
  };
};

const City = mongoose.model('City', citySchema);

module.exports = City;