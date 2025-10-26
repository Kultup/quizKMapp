const mongoose = require('mongoose');

const dailyQuizSchema = new mongoose.Schema({
  quizDate: {
    type: Date,
    required: true,
    unique: true
  },
  questions: {
    type: [mongoose.Schema.Types.Mixed],
    required: true
  },
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
dailyQuizSchema.index({ quizDate: 1 });
dailyQuizSchema.index({ isSent: 1 });

// Static methods
dailyQuizSchema.statics.createQuiz = async function(quizData) {
  const quiz = new this(quizData);
  return await quiz.save();
};

dailyQuizSchema.statics.findByDate = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await this.findOne({
    quizDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
};

dailyQuizSchema.statics.getTodayQuiz = async function() {
  const today = new Date().toISOString().split('T')[0];
  return await this.findByDate(today);
};

dailyQuizSchema.statics.markAsSent = async function(id) {
  return await this.findByIdAndUpdate(id, {
    isSent: true,
    sentAt: new Date()
  });
};

dailyQuizSchema.statics.getRecentQuizzes = async function(limit = 30) {
  return await this.find({})
    .sort({ quizDate: -1 })
    .limit(limit);
};

dailyQuizSchema.statics.getQuizStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        sentQuizzes: { $sum: { $cond: ['$isSent', 1, 0] } },
        quizzesLast30Days: {
          $sum: {
            $cond: [
              { $gte: ['$quizDate', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalQuizzes: 0,
    sentQuizzes: 0,
    quizzesLast30Days: 0
  };
};

const DailyQuiz = mongoose.model('DailyQuiz', dailyQuizSchema);

// User Quiz Attempt Schema
const userQuizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: String,
    required: true
  },
  answers: {
    type: [mongoose.Schema.Types.Mixed],
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  incorrectAnswers: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  completedAt: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
userQuizAttemptSchema.index({ userId: 1 });
userQuizAttemptSchema.index({ quizId: 1 });
userQuizAttemptSchema.index({ createdAt: -1 });

// Static methods
userQuizAttemptSchema.statics.createAttempt = async function(attemptData) {
  const attempt = new this(attemptData);
  return await attempt.save();
};

userQuizAttemptSchema.statics.findByUserAndQuiz = async function(userId, quizId) {
  return await this.findOne({ userId, quizId });
};

userQuizAttemptSchema.statics.completeAttempt = async function(id, score, totalPoints, correctAnswers, incorrectAnswers, accuracy, timeSpent) {
  return await this.findByIdAndUpdate(id, {
    isCompleted: true,
    score,
    totalPoints,
    correctAnswers,
    incorrectAnswers,
    accuracy,
    timeSpent,
    completedAt: new Date()
  }, { new: true });
};

userQuizAttemptSchema.statics.calculateQuizStats = function(answers, questions) {
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let totalPoints = 0;
  
  const detailedAnswers = answers.map((answer, index) => {
    const question = questions[index];
    const isCorrect = answer.selectedAnswer === question.correctAnswer;
    
    if (isCorrect) {
      correctAnswers++;
      totalPoints += 1; // +1 за правильный ответ
    } else {
      incorrectAnswers++;
      totalPoints -= 1; // -1 за неправильный ответ
    }
    
    return {
      questionId: question.id,
      questionText: question.questionText,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeSpent: answer.timeSpent || 0
    };
  });
  
  const totalQuestions = questions.length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  
  return {
    score: Math.round(score),
    totalPoints,
    correctAnswers,
    incorrectAnswers,
    accuracy: Math.round(accuracy),
    detailedAnswers
  };
};

userQuizAttemptSchema.statics.getUserAttempts = async function(userId, limit = 10) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

userQuizAttemptSchema.statics.getAttemptStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        completedAttempts: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        avgScore: { $avg: { $cond: ['$isCompleted', '$score', null] } },
        attemptsToday: {
          $sum: {
            $cond: [
              { $gte: ['$createdAt', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalAttempts: 0,
    completedAttempts: 0,
    avgScore: 0,
    attemptsToday: 0
  };
};

const UserQuizAttempt = mongoose.model('UserQuizAttempt', userQuizAttemptSchema);

// User Answer Schema
const userAnswerSchema = new mongoose.Schema({
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserQuizAttempt',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  userAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  answeredAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
userAnswerSchema.index({ attemptId: 1 });
userAnswerSchema.index({ questionId: 1 });

// Static methods
userAnswerSchema.statics.createAnswer = async function(answerData) {
  const answer = new this(answerData);
  return await answer.save();
};

userAnswerSchema.statics.create = async function(answerData) {
  const answer = new this(answerData);
  return await answer.save();
};

userAnswerSchema.statics.getAttemptAnswers = async function(attemptId) {
  return await this.find({ attemptId })
    .populate({
      path: 'questionId',
      populate: {
        path: 'categoryId',
        select: 'name'
      }
    })
    .sort({ answeredAt: 1 });
};

const UserAnswer = mongoose.model('UserAnswer', userAnswerSchema);

module.exports = {
  DailyQuiz,
  UserQuizAttempt,
  UserAnswer
};