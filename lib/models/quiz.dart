import 'package:json_annotation/json_annotation.dart';
import 'question.dart';

part 'quiz.g.dart';

@JsonSerializable()
class Quiz {
  final String id;
  final String title;
  final String description;
  final String categoryId;
  final String? category;
  final String difficulty;
  @JsonKey(name: 'questionsCount')
  final int questionsCount;
  @JsonKey(name: 'estimatedTime')
  final int estimatedTime; // in seconds
  final DateTime createdAt;
  final List<Question>? questions;

  Quiz({
    required this.id,
    required this.title,
    required this.description,
    required this.categoryId,
    this.category,
    required this.difficulty,
    required this.questionsCount,
    required this.estimatedTime,
    required this.createdAt,
    this.questions,
  });

  factory Quiz.fromJson(Map<String, dynamic> json) => _$QuizFromJson(json);
  Map<String, dynamic> toJson() => _$QuizToJson(this);

  int get questionCount => questions?.length ?? questionsCount;
}