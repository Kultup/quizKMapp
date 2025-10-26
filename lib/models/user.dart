import 'package:json_annotation/json_annotation.dart';
import 'position.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final String id;
  final String username;
  final String firstName;
  final String lastName;
  final String city;
  final Position? position;
  final String? institution;
  final String? gender;
  final String? phone;
  final String? role;
  final int? totalScore;
  final int? testsCompleted;
  final DateTime? registrationDate;

  User({
    required this.id,
    required this.username,
    required this.firstName,
    required this.lastName,
    required this.city,
    this.position,
    this.institution,
    this.gender,
    this.phone,
    this.role,
    this.totalScore,
    this.testsCompleted,
    this.registrationDate,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

  String get fullName => '$firstName $lastName';
  
  String get positionName => position?.displayName ?? 'Не вказано';
}