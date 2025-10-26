// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) => User(
  id: json['id'] as String,
  username: json['username'] as String,
  firstName: json['firstName'] as String,
  lastName: json['lastName'] as String,
  city: json['city'] as String,
  position: json['position'] == null
      ? null
      : Position.fromJson(json['position'] as Map<String, dynamic>),
  institution: json['institution'] as String?,
  gender: json['gender'] as String?,
  phone: json['phone'] as String?,
  role: json['role'] as String?,
  totalScore: (json['totalScore'] as num?)?.toInt(),
  testsCompleted: (json['testsCompleted'] as num?)?.toInt(),
  registrationDate: json['registrationDate'] == null
      ? null
      : DateTime.parse(json['registrationDate'] as String),
);

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
  'id': instance.id,
  'username': instance.username,
  'firstName': instance.firstName,
  'lastName': instance.lastName,
  'city': instance.city,
  'position': instance.position,
  'institution': instance.institution,
  'gender': instance.gender,
  'phone': instance.phone,
  'role': instance.role,
  'totalScore': instance.totalScore,
  'testsCompleted': instance.testsCompleted,
  'registrationDate': instance.registrationDate?.toIso8601String(),
};
