// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quiz.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Quiz _$QuizFromJson(Map<String, dynamic> json) => Quiz(
  id: json['id'] as String,
  title: json['title'] as String,
  description: json['description'] as String,
  categoryId: json['categoryId'] as String,
  category: json['category'] as String?,
  difficulty: json['difficulty'] as String,
  questionsCount: (json['questionsCount'] as num).toInt(),
  estimatedTime: (json['estimatedTime'] as num).toInt(),
  createdAt: DateTime.parse(json['createdAt'] as String),
  questions: (json['questions'] as List<dynamic>?)
      ?.map((e) => Question.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$QuizToJson(Quiz instance) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'description': instance.description,
  'categoryId': instance.categoryId,
  'category': instance.category,
  'difficulty': instance.difficulty,
  'questionsCount': instance.questionsCount,
  'estimatedTime': instance.estimatedTime,
  'createdAt': instance.createdAt.toIso8601String(),
  'questions': instance.questions,
};
