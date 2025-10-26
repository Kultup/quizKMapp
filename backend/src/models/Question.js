const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  optionA: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  optionB: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  optionC: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  optionD: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  correctAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  difficultyLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
questionSchema.index({ positionId: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ difficultyLevel: 1 });

// Static methods
questionSchema.statics.createQuestion = async function(questionData) {
  const question = new this(questionData);
  return await question.save();
};

questionSchema.statics.findById = async function(id) {
  return await this.findOne({ _id: id }).populate('positionId', 'name category');
};

questionSchema.statics.getAll = async function(filters = {}) {
  const query = {};
  
  if (filters.positionId) query.positionId = filters.positionId;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  if (filters.difficultyLevel) query.difficultyLevel = filters.difficultyLevel;
  
  const questions = await this.find(query)
    .populate('positionId', 'name category')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .skip(filters.offset || 0);
    
  return questions.map(q => ({
    id: q._id,
    position_id: q.positionId._id,
    position_name: q.positionId.name,
    position_category: q.positionId.category,
    question_text: q.questionText,
    option_a: q.optionA,
    option_b: q.optionB,
    option_c: q.optionC,
    option_d: q.optionD,
    correct_answer: q.correctAnswer,
    explanation: q.explanation,
    difficulty_level: q.difficultyLevel,
    isActive: q.isActive,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt
  }));
};

questionSchema.statics.getRandomQuestions = async function(positionId, count = 5) {
  const questions = await this.aggregate([
    {
      $match: {
        isActive: true,
        positionId: new mongoose.Types.ObjectId(positionId)
      }
    },
    {
      $lookup: {
        from: 'positions',
        localField: 'positionId',
        foreignField: '_id',
        as: 'position'
      }
    },
    {
      $unwind: '$position'
    },
    {
      $sample: { size: count }
    },
    {
      $project: {
        id: '$_id',
        position_id: '$positionId',
        position_name: '$position.name',
        position_category: '$position.category',
        question_text: '$questionText',
        option_a: '$optionA',
        option_b: '$optionB',
        option_c: '$optionC',
        option_d: '$optionD',
        correct_answer: '$correctAnswer',
        explanation: 1,
        difficulty_level: '$difficultyLevel',
        isActive: 1
      }
    }
  ]);
  
  return questions;
};

questionSchema.statics.updateQuestion = async function(id, updateData) {
  return await this.findByIdAndUpdate(id, updateData, { new: true });
};

questionSchema.statics.deleteQuestion = async function(id) {
  return await this.findByIdAndDelete(id);
};

questionSchema.statics.deactivate = async function(id) {
  return await this.findByIdAndUpdate(id, { isActive: false });
};

questionSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalQuestions: { $sum: 1 },
        activeQuestions: { $sum: { $cond: ['$isActive', 1, 0] } },
        positionsCount: { $addToSet: '$positionId' },
        avgDifficulty: { $avg: '$difficultyLevel' }
      }
    },
    {
      $project: {
        totalQuestions: 1,
        activeQuestions: 1,
        positionsCount: { $size: '$positionsCount' },
        avgDifficulty: { $round: ['$avgDifficulty', 2] }
      }
    }
  ]);
  
  return stats[0] || {
    totalQuestions: 0,
    activeQuestions: 0,
    positionsCount: 0,
    avgDifficulty: 0
  };
};

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;