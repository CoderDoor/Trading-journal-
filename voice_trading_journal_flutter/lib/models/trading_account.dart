/// Trading Account model for multi-account support
class TradingAccount {
  final String id;
  final String name;
  final String? broker;
  final String accountType; // PERSONAL, PROP_FIRM, DEMO, CHALLENGE
  final double? accountSize;
  final String currency;
  final String status; // ACTIVE, PASSED, FAILED, INACTIVE
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  TradingAccount({
    required this.id,
    required this.name,
    this.broker,
    this.accountType = 'PERSONAL',
    this.accountSize,
    this.currency = 'USD',
    this.status = 'ACTIVE',
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TradingAccount.fromMap(Map<String, dynamic> map) {
    return TradingAccount(
      id: map['id'] as String,
      name: map['name'] as String,
      broker: map['broker'] as String?,
      accountType: map['accountType'] as String? ?? 'PERSONAL',
      accountSize: map['accountSize'] != null ? (map['accountSize'] as num).toDouble() : null,
      currency: map['currency'] as String? ?? 'USD',
      status: map['status'] as String? ?? 'ACTIVE',
      notes: map['notes'] as String?,
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'broker': broker,
      'accountType': accountType,
      'accountSize': accountSize,
      'currency': currency,
      'status': status,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  TradingAccount copyWith({
    String? id,
    String? name,
    String? broker,
    String? accountType,
    double? accountSize,
    String? currency,
    String? status,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return TradingAccount(
      id: id ?? this.id,
      name: name ?? this.name,
      broker: broker ?? this.broker,
      accountType: accountType ?? this.accountType,
      accountSize: accountSize ?? this.accountSize,
      currency: currency ?? this.currency,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  String get displayName {
    final emoji = switch (accountType) {
      'PROP_FIRM' => '🏢',
      'DEMO' => '📝',
      'CHALLENGE' => '🎯',
      _ => '👤',
    };
    return '$emoji $name';
  }

  String get statusDisplay {
    return switch (status) {
      'ACTIVE' => '🟢 Active',
      'PASSED' => '✅ Passed',
      'FAILED' => '❌ Failed',
      'INACTIVE' => '⚪ Inactive',
      _ => status,
    };
  }
}

/// Account types
class AccountType {
  static const String personal = 'PERSONAL';
  static const String propFirm = 'PROP_FIRM';
  static const String demo = 'DEMO';
  static const String challenge = 'CHALLENGE';

  static const List<String> all = [personal, propFirm, demo, challenge];

  static String displayName(String type) {
    return switch (type) {
      propFirm => 'Prop Firm',
      demo => 'Demo',
      challenge => 'Challenge',
      _ => 'Personal',
    };
  }
}

/// Account status
class AccountStatus {
  static const String active = 'ACTIVE';
  static const String passed = 'PASSED';
  static const String failed = 'FAILED';
  static const String inactive = 'INACTIVE';

  static const List<String> all = [active, passed, failed, inactive];
}
