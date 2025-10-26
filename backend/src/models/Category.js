const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

// Static methods
categorySchema.statics.createCategory = async function(categoryData) {
  const category = new this(categoryData);
  return await category.save();
};

categorySchema.statics.findById = async function(id) {
  return await this.findOne({ _id: id });
};

categorySchema.statics.findByName = async function(name) {
  return await this.findOne({ name: name, isActive: true });
};

categorySchema.statics.getAll = async function(activeOnly = true) {
  const query = activeOnly ? { isActive: true } : {};
  return await this.find(query).sort({ name: 1 });
};

categorySchema.statics.updateCategory = async function(id, updateData) {
  return await this.findByIdAndUpdate(id, updateData, { new: true });
};

categorySchema.statics.deleteCategory = async function(id) {
  return await this.findByIdAndDelete(id);
};

categorySchema.statics.deactivate = async function(id) {
  return await this.findByIdAndUpdate(id, { isActive: false });
};

categorySchema.statics.getWithQuestionCount = async function() {
  return await this.aggregate([
    {
      $lookup: {
        from: 'questions',
        localField: '_id',
        foreignField: 'categoryId',
        as: 'questions',
        pipeline: [
          { $match: { isActive: true } }
        ]
      }
    },
    {
      $addFields: {
        questionCount: { $size: '$questions' }
      }
    },
    {
      $project: {
        questions: 0
      }
    },
    {
      $match: { isActive: true }
    },
    {
      $sort: { name: 1 }
    }
  ]);
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;