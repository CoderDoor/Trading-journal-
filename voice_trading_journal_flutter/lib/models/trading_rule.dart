class TradingRule {
  final String id;
  final String name;
  final String? description;
  final String category;
  final String? condition;
  final String severity;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  TradingRule({
    required this.id,
    required this.name,
    this.description,
    required this.category,
    this.condition,
    required this.severity,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TradingRule.fromMap(Map<String, dynamic> map) {
    return TradingRule(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      description: map['description'],
      category: map['category'] ?? 'GENERAL',
      condition: map['condition'],
      severity: map['severity'] ?? 'MEDIUM',
      isActive: map['isActive'] ?? true,
      createdAt: map['createdAt'] != null 
          ? DateTime.parse(map['createdAt']) 
          : DateTime.now(),
      updatedAt: map['updatedAt'] != null 
          ? DateTime.parse(map['updatedAt']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'condition': condition,
      'severity': severity,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class RuleViolation {
  final String id;
  final String ruleId;
  final String ruleName;
  final String? journalEntryId;
  final String punishment;
  final String punishmentType;
  final String severity;
  final String status;
  final DateTime? completedAt;
  final DateTime? dueDate;
  final String? notes;
  final DateTime createdAt;

  RuleViolation({
    required this.id,
    required this.ruleId,
    required this.ruleName,
    this.journalEntryId,
    required this.punishment,
    required this.punishmentType,
    required this.severity,
    required this.status,
    this.completedAt,
    this.dueDate,
    this.notes,
    required this.createdAt,
  });

  factory RuleViolation.fromMap(Map<String, dynamic> map) {
    return RuleViolation(
      id: map['id'] ?? '',
      ruleId: map['ruleId'] ?? '',
      ruleName: map['ruleName'] ?? '',
      journalEntryId: map['journalEntryId'],
      punishment: map['punishment'] ?? '',
      punishmentType: map['punishmentType'] ?? 'TASK',
      severity: map['severity'] ?? 'MEDIUM',
      status: map['status'] ?? 'PENDING',
      completedAt: map['completedAt'] != null 
          ? DateTime.parse(map['completedAt']) 
          : null,
      dueDate: map['dueDate'] != null 
          ? DateTime.parse(map['dueDate']) 
          : null,
      notes: map['notes'],
      createdAt: map['createdAt'] != null 
          ? DateTime.parse(map['createdAt']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'ruleId': ruleId,
      'ruleName': ruleName,
      'journalEntryId': journalEntryId,
      'punishment': punishment,
      'punishmentType': punishmentType,
      'severity': severity,
      'status': status,
      'completedAt': completedAt?.toIso8601String(),
      'dueDate': dueDate?.toIso8601String(),
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
