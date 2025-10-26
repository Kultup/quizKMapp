class UserStats {
  final int totalScore;
  final int testsCompleted;
  final int totalAttempts;
  final int completedAttempts;
  final double avgScore;
  final DateTime? lastQuizDate;
  final int correctAnswers;
  final int totalAnswers;
  final Map<String, int> categoryStats;
  final List<RecentQuiz> recentQuizzes;
  final int currentStreak;
  final int longestStreak;
  final int rank;

  UserStats({
    required this.totalScore,
    required this.testsCompleted,
    required this.totalAttempts,
    required this.completedAttempts,
    required this.avgScore,
    this.lastQuizDate,
    required this.correctAnswers,
    required this.totalAnswers,
    required this.categoryStats,
    required this.recentQuizzes,
    required this.currentStreak,
    required this.longestStreak,
    required this.rank,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) {
    final stats = json['stats'] ?? {};
    final categories = stats['category_stats'] ?? {};
    final recent = stats['recent_quizzes'] ?? [];
    
    return UserStats(
      totalScore: (stats['total_score'] ?? 0).toInt(),
      testsCompleted: (stats['tests_completed'] ?? 0).toInt(),
      totalAttempts: (stats['total_attempts'] ?? 0).toInt(),
      completedAttempts: (stats['completed_attempts'] ?? 0).toInt(),
      avgScore: (stats['avg_score'] ?? 0.0).toDouble(),
      lastQuizDate: stats['last_quiz_date'] != null 
          ? DateTime.parse(stats['last_quiz_date'])
          : null,
      correctAnswers: (stats['correct_answers'] ?? 0).toInt(),
      totalAnswers: (stats['total_answers'] ?? 0).toInt(),
      categoryStats: Map<String, int>.from(categories),
      recentQuizzes: (recent as List)
          .map((q) => RecentQuiz.fromJson(q))
          .toList(),
      currentStreak: (stats['current_streak'] ?? 0).toInt(),
      longestStreak: (stats['longest_streak'] ?? 0).toInt(),
      rank: (stats['rank'] ?? 0).toInt(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_score': totalScore,
      'tests_completed': testsCompleted,
      'total_attempts': totalAttempts,
      'completed_attempts': completedAttempts,
      'avg_score': avgScore,
      'last_quiz_date': lastQuizDate?.toIso8601String(),
      'correct_answers': correctAnswers,
      'total_answers': totalAnswers,
      'category_stats': categoryStats,
      'recent_quizzes': recentQuizzes.map((q) => q.toJson()).toList(),
      'current_streak': currentStreak,
      'longest_streak': longestStreak,
      'rank': rank,
    };
  }

  double get completionRate {
    if (totalAttempts == 0) return 0.0;
    return (completedAttempts / totalAttempts) * 100;
  }

  double get accuracyRate {
    if (totalAnswers == 0) return 0.0;
    return (correctAnswers / totalAnswers) * 100;
  }

  String get formattedAvgScore {
    return '${avgScore.toStringAsFixed(1)}%';
  }

  String get formattedAccuracy {
    return '${accuracyRate.toStringAsFixed(1)}%';
  }

  String get bestCategory {
    if (categoryStats.isEmpty) return 'Немає даних';
    return categoryStats.entries
        .reduce((a, b) => a.value > b.value ? a : b)
        .key;
  }
}

class RecentQuiz {
  final String id;
  final String title;
  final String categoryName;
  final int score;
  final int totalQuestions;
  final DateTime completedAt;
  final String grade;

  RecentQuiz({
    required this.id,
    required this.title,
    required this.categoryName,
    required this.score,
    required this.totalQuestions,
    required this.completedAt,
    required this.grade,
  });

  factory RecentQuiz.fromJson(Map<String, dynamic> json) {
    return RecentQuiz(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      categoryName: json['category_name'] ?? '',
      score: (json['score'] ?? 0).toInt(),
      totalQuestions: (json['total_questions'] ?? 0).toInt(),
      completedAt: DateTime.parse(json['completed_at']),
      grade: json['grade'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'category_name': categoryName,
      'score': score,
      'total_questions': totalQuestions,
      'completed_at': completedAt.toIso8601String(),
      'grade': grade,
    };
  }

  double get percentage => (score / totalQuestions) * 100;
}