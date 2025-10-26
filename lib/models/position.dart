import 'package:json_annotation/json_annotation.dart';

part 'position.g.dart';

@JsonSerializable()
class Position {
  final String id;
  final String name;
  final String category;
  final String? description;
  final String? level;
  final bool? isActive;

  Position({
    required this.id,
    required this.name,
    required this.category,
    this.description,
    this.level,
    this.isActive,
  });

  factory Position.fromJson(Map<String, dynamic> json) => _$PositionFromJson(json);
  Map<String, dynamic> toJson() => _$PositionToJson(this);

  String get displayName {
    switch (category) {
      case 'адміністратор_закладу':
        return 'Адміністратор закладу';
      case 'банкетний_менеджер':
        return 'Банкетний менеджер';
      case 'шеф_кухар':
        return 'Шеф кухар';
      case 'менеджер_звязку':
        return 'Менеджер звязку';
      default:
        return name;
    }
  }

  String get descriptionText {
    switch (category) {
      case 'адміністратор_закладу':
        return 'Керівна посада, відповідальна за загальне управління закладом';
      case 'банкетний_менеджер':
        return 'Відповідає за організацію та проведення банкетів та заходів';
      case 'шеф_кухар':
        return 'Керує кухонним персоналом та відповідає за якість страв';
      case 'менеджер_звязку':
        return 'Відповідає за комунікації та взаємодію з клієнтами';
      default:
        return description ?? '';
    }
  }
}
