class PinSettings {
  final bool isEnabled;
  final String? pinHash;
  final DateTime? createdAt;
  final DateTime? lastUsed;

  PinSettings({
    required this.isEnabled,
    this.pinHash,
    this.createdAt,
    this.lastUsed,
  });

  PinSettings copyWith({
    bool? isEnabled,
    String? pinHash,
    DateTime? createdAt,
    DateTime? lastUsed,
  }) {
    return PinSettings(
      isEnabled: isEnabled ?? this.isEnabled,
      pinHash: pinHash ?? this.pinHash,
      createdAt: createdAt ?? this.createdAt,
      lastUsed: lastUsed ?? this.lastUsed,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'isEnabled': isEnabled,
      'pinHash': pinHash,
      'createdAt': createdAt?.toIso8601String(),
      'lastUsed': lastUsed?.toIso8601String(),
    };
  }

  factory PinSettings.fromJson(Map<String, dynamic> json) {
    return PinSettings(
      isEnabled: json['isEnabled'] ?? false,
      pinHash: json['pinHash'],
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : null,
      lastUsed: json['lastUsed'] != null 
          ? DateTime.parse(json['lastUsed']) 
          : null,
    );
  }

  @override
  String toString() {
    return 'PinSettings(isEnabled: $isEnabled, createdAt: $createdAt, lastUsed: $lastUsed)';
  }
}
