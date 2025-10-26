// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quiz_result.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

QuizResult _$QuizResultFromJson(Map<String, dynamic> json) => QuizResult(
  id: json['id'] as String,
  userId: json['user_id'] as String,
  quizId: json['quiz_id'] as String,
  quizTitle: json['quiz_title'] as String?,
  categoryId: json['category_id'] as String?,
  categoryName: json['category_name'] as String?,
  score: (json['score'] as num).toInt(),
  totalPoints: (json['total_points'] as num).toInt(),
  correctAnswers: (json['correct_answers'] as num).toInt(),
  incorrectAnswers: (json['incorrect_answers'] as num).toInt(),
  accuracy: (json['accuracy'] as num).toInt(),
  totalQuestions: (json['total_questions'] as num).toInt(),
  timeTaken: (json['time_taken'] as num).toInt(),
  completedAt: DateTime.parse(json['completed_at'] as String),
  answers: (json['answers'] as List<dynamic>)
      .map((e) => QuizAnswer.fromJson(e as Map<String, dynamic>))
      .toList(),
  detailedAnswers: (json['detailed_answers'] as List<dynamic>?)
      ?.map((e) => DetailedAnswer.fromJson(e as Map<String, dynamic>))
      .toList(),
  difficulty: json['difficulty'] as String?,
  isDailyQuiz: json['is_daily_quiz'] as bool? ?? false,
);

Map<String, dynamic> _$QuizResultToJson(QuizResult instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'quiz_id': instance.quizId,
      'quiz_title': instance.quizTitle,
      'category_id': instance.categoryId,
      'category_name': instance.categoryName,
      'score': instance.score,
      'total_points': instance.totalPoints,
      'correct_answers': instance.correctAnswers,
      'incorrect_answers': instance.incorrectAnswers,
      'accuracy': instance.accuracy,
      'total_questions': instance.totalQuestions,
      'time_taken': instance.timeTaken,
      'completed_at': instance.completedAt.toIso8601String(),
      'answers': instance.answers,
      'detailed_answers': instance.detailedAnswers,
      'difficulty': instance.difficulty,
      'is_daily_quiz': instance.isDailyQuiz,
    };

QuizAnswer _$QuizAnswerFromJson(Map<String, dynamic> json) => QuizAnswer(
  questionId: json['question_id'] as String,
  questionText: json['question_text'] as String,
  selectedAnswer: json['selected_answer'] as String,
  correctAnswer: json['correct_answer'] as String,
  isCorrect: json['is_correct'] as bool,
  timeSpent: (json['time_spent'] as num).toInt(),
);

Map<String, dynamic> _$QuizAnswerToJson(QuizAnswer instance) =>
    <String, dynamic>{
      'question_id': instance.questionId,
      'question_text': instance.questionText,
      'selected_answer': instance.selectedAnswer,
      'correct_answer': instance.correctAnswer,
      'is_correct': instance.isCorrect,
      'time_spent': instance.timeSpent,
    };

DetailedAnswer _$DetailedAnswerFromJson(Map<String, dynamic> json) =>
    DetailedAnswer(
      questionId: json['question_id'] as String,
      questionText: json['question_text'] as String,
      selectedAnswer: json['selected_answer'] as String,
      correctAnswer: json['correct_answer'] as String,
      isCorrect: json['is_correct'] as bool,
      timeSpent: (json['time_spent'] as num).toInt(),
    );

Map<String, dynamic> _$DetailedAnswerToJson(DetailedAnswer instance) =>
    <String, dynamic>{
      'question_id': instance.questionId,
      'question_text': instance.questionText,
      'selected_answer': instance.selectedAnswer,
      'correct_answer': instance.correctAnswer,
      'is_correct': instance.isCorrect,
      'time_spent': instance.timeSpent,
    };
