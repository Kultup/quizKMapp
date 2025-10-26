import 'package:json_annotation/json_annotation.dart';

part 'quiz_result.g.dart';

@JsonSerializable()
class QuizResult {
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  @JsonKey(name: 'quiz_id')
  final String quizId;
  @JsonKey(name: 'quiz_title')
  final String? quizTitle;
  @JsonKey(name: 'category_id')
  final String? categoryId;
  @JsonKey(name: 'category_name')
  final String? categoryName;
  final int score;
  @JsonKey(name: 'total_points')
  final int totalPoints;
  @JsonKey(name: 'correct_answers')
  final int correctAnswers;
  @JsonKey(name: 'incorrect_answers')
  final int incorrectAnswers;
  final int accuracy;
  @JsonKey(name: 'total_questions')
  final int totalQuestions;
  @JsonKey(name: 'time_taken')
  final int timeTaken; // in seconds
  @JsonKey(name: 'completed_at')
  final DateTime completedAt;
  @JsonKey(name: 'answers')
  final List<QuizAnswer> answers;
  @JsonKey(name: 'detailed_answers')
  final List<DetailedAnswer>? detailedAnswers;
  @JsonKey(name: 'difficulty')
  final String? difficulty;
  @JsonKey(name: 'is_daily_quiz')
  final bool isDailyQuiz;

  QuizResult({
    required this.id,
    required this.userId,
    required this.quizId,
    this.quizTitle,
    this.categoryId,
    this.categoryName,
    required this.score,
    required this.totalPoints,
    required this.correctAnswers,
    required this.incorrectAnswers,
    required this.accuracy,
    required this.totalQuestions,
    required this.timeTaken,
    required this.completedAt,
    required this.answers,
    this.detailedAnswers,
    this.difficulty,
    this.isDailyQuiz = false,
  });

  factory QuizResult.fromJson(Map<String, dynamic> json) => _$QuizResultFromJson(json);
  Map<String, dynamic> toJson() => _$QuizResultToJson(this);

  double get percentage => (score / totalQuestions) * 100;
  
  String get formattedTime {
    final minutes = timeTaken ~/ 60;
    final seconds = timeTaken % 60;
    return '${minutes}:${seconds.toString().padLeft(2, '0')}';
  }

  String get grade {
    final percentage = this.percentage;
    if (percentage >= 90) return 'Відмінно';
    if (percentage >= 80) return 'Добре';
    if (percentage >= 70) return 'Задовільно';
    if (percentage >= 60) return 'Достатньо';
    return 'Незадовільно';
  }
}

@JsonSerializable()
class QuizAnswer {
  @JsonKey(name: 'question_id')
  final String questionId;
  @JsonKey(name: 'question_text')
  final String questionText;
  @JsonKey(name: 'selected_answer')
  final String selectedAnswer;
  @JsonKey(name: 'correct_answer')
  final String correctAnswer;
  @JsonKey(name: 'is_correct')
  final bool isCorrect;
  @JsonKey(name: 'time_spent')
  final int timeSpent; // in seconds

  QuizAnswer({
    required this.questionId,
    required this.questionText,
    required this.selectedAnswer,
    required this.correctAnswer,
    required this.isCorrect,
    required this.timeSpent,
  });

  factory QuizAnswer.fromJson(Map<String, dynamic> json) => _$QuizAnswerFromJson(json);
  Map<String, dynamic> toJson() => _$QuizAnswerToJson(this);
}

@JsonSerializable()
class DetailedAnswer {
  @JsonKey(name: 'question_id')
  final String questionId;
  @JsonKey(name: 'question_text')
  final String questionText;
  @JsonKey(name: 'selected_answer')
  final String selectedAnswer;
  @JsonKey(name: 'correct_answer')
  final String correctAnswer;
  @JsonKey(name: 'is_correct')
  final bool isCorrect;
  @JsonKey(name: 'time_spent')
  final int timeSpent; // in seconds

  DetailedAnswer({
    required this.questionId,
    required this.questionText,
    required this.selectedAnswer,
    required this.correctAnswer,
    required this.isCorrect,
    required this.timeSpent,
  });

  factory DetailedAnswer.fromJson(Map<String, dynamic> json) => _$DetailedAnswerFromJson(json);
  Map<String, dynamic> toJson() => _$DetailedAnswerToJson(this);
}