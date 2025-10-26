// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'position.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Position _$PositionFromJson(Map<String, dynamic> json) => Position(
  id: json['id'] as String,
  name: json['name'] as String,
  category: json['category'] as String,
  description: json['description'] as String?,
  level: json['level'] as String?,
  isActive: json['isActive'] as bool?,
);

Map<String, dynamic> _$PositionToJson(Position instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'category': instance.category,
  'description': instance.description,
  'level': instance.level,
  'isActive': instance.isActive,
};
