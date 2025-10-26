const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 200
  },
  shortName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  type: {
    type: String,
    required: true,
    enum: ['школа', 'ліцей', 'гімназія', 'коледж', 'університет', 'інститут', 'академія', 'інше'],
    default: 'школа'
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
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
institutionSchema.index({ name: 1 });
institutionSchema.index({ type: 1 });
institutionSchema.index({ city: 1 });
institutionSchema.index({ isActive: 1 });

// Static methods
institutionSchema.statics.getAll = async function(limit = 50, offset = 0, search = '', cityId = null, type = null) {
  const query = { isActive: true };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { shortName: { $regex: search, $options: 'i' } }
    ];
  }

  if (cityId) {
    query.city = cityId;
  }

  if (type) {
    query.type = type;
  }

  const institutions = await this.find(query)
    .sort({ name: 1 })
    .limit(limit)
    .skip(offset)
    .populate('city', 'name region')
    .populate('createdBy', 'firstName lastName');

  const total = await this.countDocuments(query);

  return { institutions, total };
};

institutionSchema.statics.createInstitution = async function(institutionData) {
  const institution = new this(institutionData);
  return await institution.save();
};

institutionSchema.statics.updateInstitution = async function(id, updateData) {
  return await this.findByIdAndUpdate(id, updateData, { new: true });
};

institutionSchema.statics.deleteInstitution = async function(id) {
  return await this.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

institutionSchema.statics.getByCity = async function(cityId) {
  return await this.find({ city: cityId, isActive: true })
    .sort({ name: 1 })
    .select('name shortName type');
};

institutionSchema.statics.getStats = async function() {
  const totalInstitutions = await this.countDocuments({ isActive: true });
  const institutionsByType = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return {
    totalInstitutions,
    institutionsByType
  };
};

const Institution = mongoose.model('Institution', institutionSchema);

module.exports = Institution;