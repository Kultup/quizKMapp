// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'question.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Question _$QuestionFromJson(Map<String, dynamic> json) => Question(
  id: json['id'] as String,
  questionText: json['question_text'] as String?,
  optionA: json['option_a'] as String?,
  optionB: json['option_b'] as String?,
  optionC: json['option_c'] as String?,
  optionD: json['option_d'] as String?,
  correctAnswer: json['correct_answer'] as String?,
  difficultyLevel: Question._difficultyFromJson(json['difficulty_level']),
  categoryId: json['category_id'] as String?,
  categoryName: json['category_name'] as String?,
);

Map<String, dynamic> _$QuestionToJson(Question instance) => <String, dynamic>{
  'id': instance.id,
  'question_text': instance.questionText,
  'option_a': instance.optionA,
  'option_b': instance.optionB,
  'option_c': instance.optionC,
  'option_d': instance.optionD,
  'correct_answer': instance.correctAnswer,
  'difficulty_level': instance.difficultyLevel,
  'category_id': instance.categoryId,
  'category_name': instance.categoryName,
};
