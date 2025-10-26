import 'package:json_annotation/json_annotation.dart';

part 'question.g.dart';

@JsonSerializable()
class Question {
  final String id;
  @JsonKey(name: 'question_text')
  final String? questionText;
  @JsonKey(name: 'option_a')
  final String? optionA;
  @JsonKey(name: 'option_b')
  final String? optionB;
  @JsonKey(name: 'option_c')
  final String? optionC;
  @JsonKey(name: 'option_d')
  final String? optionD;
  @JsonKey(name: 'correct_answer')
  final String? correctAnswer;
  @JsonKey(name: 'difficulty_level', fromJson: _difficultyFromJson)
  final String difficultyLevel;
  @JsonKey(name: 'category_id')
  final String? categoryId;
  @JsonKey(name: 'category_name')
  final String? categoryName;

  static String _difficultyFromJson(dynamic value) {
    if (value == null) return '1';
    if (value is String) return value;
    if (value is num) return value.toString();
    return '1';
  }

  Question({
    required this.id,
    this.questionText,
    this.optionA,
    this.optionB,
    this.optionC,
    this.optionD,
    this.correctAnswer,
    required this.difficultyLevel,
    this.categoryId,
    this.categoryName,
  });

  factory Question.fromJson(Map<String, dynamic> json) => _$QuestionFromJson(json);
  Map<String, dynamic> toJson() => _$QuestionToJson(this);

  List<String> get options => [
    optionA ?? '',
    optionB ?? '',
    optionC ?? '',
    optionD ?? ''
  ];
  
  bool isCorrectAnswer(String answer) => answer == (correctAnswer ?? '');
}