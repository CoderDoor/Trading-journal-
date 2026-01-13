// Journal Entry Model - mirrors the Next.js schema
class JournalEntry {
  final String id;
  final String? instrument;
  final String? tradeType;
  final String? timeframe;
  final double? entryPrice;
  final double? stopLoss;
  final double? target;
  final double? riskReward;
  final String? outcome;
  final String? tradeReason;
  final String? strategyLogic;
  
  // ICT Checklist
  final bool htfBiasAligned;
  final bool liquidityTaken;
  final bool entryAtPOI;
  final bool riskManaged;
  final bool bosConfirmed;
  final bool mssConfirmed;
  final bool chochConfirmed;
  final bool orderBlockEntry;
  final bool fvgEntry;
  final bool killZoneEntry;
  
  // Sessions
  final bool asianSession;
  final bool londonSession;
  final bool nySession;
  final bool londonClose;
  
  // Reflection
  final String? emotionState;
  final String? whatWentWell;
  final String? whatWentWrong;
  final String? improvement;
  
  final String? screenshot;
  final String? rawTranscript;
  final DateTime createdAt;
  final DateTime updatedAt;

  JournalEntry({
    required this.id,
    this.instrument,
    this.tradeType,
    this.timeframe,
    this.entryPrice,
    this.stopLoss,
    this.target,
    this.riskReward,
    this.outcome,
    this.tradeReason,
    this.strategyLogic,
    this.htfBiasAligned = false,
    this.liquidityTaken = false,
    this.entryAtPOI = false,
    this.riskManaged = false,
    this.bosConfirmed = false,
    this.mssConfirmed = false,
    this.chochConfirmed = false,
    this.orderBlockEntry = false,
    this.fvgEntry = false,
    this.killZoneEntry = false,
    this.asianSession = false,
    this.londonSession = false,
    this.nySession = false,
    this.londonClose = false,
    this.emotionState,
    this.whatWentWell,
    this.whatWentWrong,
    this.improvement,
    this.screenshot,
    this.rawTranscript,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'instrument': instrument,
      'tradeType': tradeType,
      'timeframe': timeframe,
      'entryPrice': entryPrice,
      'stopLoss': stopLoss,
      'target': target,
      'riskReward': riskReward,
      'outcome': outcome,
      'tradeReason': tradeReason,
      'strategyLogic': strategyLogic,
      'htfBiasAligned': htfBiasAligned ? 1 : 0,
      'liquidityTaken': liquidityTaken ? 1 : 0,
      'entryAtPOI': entryAtPOI ? 1 : 0,
      'riskManaged': riskManaged ? 1 : 0,
      'bosConfirmed': bosConfirmed ? 1 : 0,
      'mssConfirmed': mssConfirmed ? 1 : 0,
      'chochConfirmed': chochConfirmed ? 1 : 0,
      'orderBlockEntry': orderBlockEntry ? 1 : 0,
      'fvgEntry': fvgEntry ? 1 : 0,
      'killZoneEntry': killZoneEntry ? 1 : 0,
      'asianSession': asianSession ? 1 : 0,
      'londonSession': londonSession ? 1 : 0,
      'nySession': nySession ? 1 : 0,
      'londonClose': londonClose ? 1 : 0,
      'emotionState': emotionState,
      'whatWentWell': whatWentWell,
      'whatWentWrong': whatWentWrong,
      'improvement': improvement,
      'screenshot': screenshot,
      'rawTranscript': rawTranscript,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Helper to parse booleans from both Firebase (true/false) and SQLite (1/0)
  static bool _parseBool(dynamic value) {
    if (value == null) return false;
    if (value is bool) return value;
    if (value is int) return value == 1;
    if (value is String) return value == 'true' || value == '1';
    return false;
  }

  factory JournalEntry.fromMap(Map<String, dynamic> map) {
    return JournalEntry(
      id: map['id'],
      instrument: map['instrument'],
      tradeType: map['tradeType'],
      timeframe: map['timeframe'],
      entryPrice: map['entryPrice']?.toDouble(),
      stopLoss: map['stopLoss']?.toDouble(),
      target: map['target']?.toDouble(),
      riskReward: map['riskReward']?.toDouble(),
      outcome: map['outcome'],
      tradeReason: map['tradeReason'],
      strategyLogic: map['strategyLogic'],
      htfBiasAligned: _parseBool(map['htfBiasAligned']),
      liquidityTaken: _parseBool(map['liquidityTaken']),
      entryAtPOI: _parseBool(map['entryAtPOI']),
      riskManaged: _parseBool(map['riskManaged']),
      bosConfirmed: _parseBool(map['bosConfirmed']),
      mssConfirmed: _parseBool(map['mssConfirmed']),
      chochConfirmed: _parseBool(map['chochConfirmed']),
      orderBlockEntry: _parseBool(map['orderBlockEntry']),
      fvgEntry: _parseBool(map['fvgEntry']),
      killZoneEntry: _parseBool(map['killZoneEntry']),
      asianSession: _parseBool(map['asianSession']),
      londonSession: _parseBool(map['londonSession']),
      nySession: _parseBool(map['nySession']),
      londonClose: _parseBool(map['londonClose']),
      emotionState: map['emotionState'],
      whatWentWell: map['whatWentWell'],
      whatWentWrong: map['whatWentWrong'],
      improvement: map['improvement'],
      screenshot: map['screenshot'],
      rawTranscript: map['rawTranscript'],
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
    );
  }

  JournalEntry copyWith({
    String? id,
    String? instrument,
    String? tradeType,
    String? timeframe,
    double? entryPrice,
    double? stopLoss,
    double? target,
    double? riskReward,
    String? outcome,
    String? tradeReason,
    String? strategyLogic,
    bool? htfBiasAligned,
    bool? liquidityTaken,
    bool? entryAtPOI,
    bool? riskManaged,
    bool? bosConfirmed,
    bool? mssConfirmed,
    bool? chochConfirmed,
    bool? orderBlockEntry,
    bool? fvgEntry,
    bool? killZoneEntry,
    bool? asianSession,
    bool? londonSession,
    bool? nySession,
    bool? londonClose,
    String? emotionState,
    String? whatWentWell,
    String? whatWentWrong,
    String? improvement,
    String? screenshot,
    String? rawTranscript,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return JournalEntry(
      id: id ?? this.id,
      instrument: instrument ?? this.instrument,
      tradeType: tradeType ?? this.tradeType,
      timeframe: timeframe ?? this.timeframe,
      entryPrice: entryPrice ?? this.entryPrice,
      stopLoss: stopLoss ?? this.stopLoss,
      target: target ?? this.target,
      riskReward: riskReward ?? this.riskReward,
      outcome: outcome ?? this.outcome,
      tradeReason: tradeReason ?? this.tradeReason,
      strategyLogic: strategyLogic ?? this.strategyLogic,
      htfBiasAligned: htfBiasAligned ?? this.htfBiasAligned,
      liquidityTaken: liquidityTaken ?? this.liquidityTaken,
      entryAtPOI: entryAtPOI ?? this.entryAtPOI,
      riskManaged: riskManaged ?? this.riskManaged,
      bosConfirmed: bosConfirmed ?? this.bosConfirmed,
      mssConfirmed: mssConfirmed ?? this.mssConfirmed,
      chochConfirmed: chochConfirmed ?? this.chochConfirmed,
      orderBlockEntry: orderBlockEntry ?? this.orderBlockEntry,
      fvgEntry: fvgEntry ?? this.fvgEntry,
      killZoneEntry: killZoneEntry ?? this.killZoneEntry,
      asianSession: asianSession ?? this.asianSession,
      londonSession: londonSession ?? this.londonSession,
      nySession: nySession ?? this.nySession,
      londonClose: londonClose ?? this.londonClose,
      emotionState: emotionState ?? this.emotionState,
      whatWentWell: whatWentWell ?? this.whatWentWell,
      whatWentWrong: whatWentWrong ?? this.whatWentWrong,
      improvement: improvement ?? this.improvement,
      screenshot: screenshot ?? this.screenshot,
      rawTranscript: rawTranscript ?? this.rawTranscript,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

// Trade Template Model
class TradeTemplate {
  final String id;
  final String name;
  final String? description;
  final String? instrument;
  final String? tradeType;
  final String? timeframe;
  final String? strategyLogic;
  final bool htfBiasAligned;
  final bool liquidityTaken;
  final bool entryAtPOI;
  final bool riskManaged;
  final bool bosConfirmed;
  final bool mssConfirmed;
  final bool chochConfirmed;
  final bool orderBlockEntry;
  final bool fvgEntry;
  final bool killZoneEntry;
  final DateTime createdAt;

  TradeTemplate({
    required this.id,
    required this.name,
    this.description,
    this.instrument,
    this.tradeType,
    this.timeframe,
    this.strategyLogic,
    this.htfBiasAligned = false,
    this.liquidityTaken = false,
    this.entryAtPOI = false,
    this.riskManaged = false,
    this.bosConfirmed = false,
    this.mssConfirmed = false,
    this.chochConfirmed = false,
    this.orderBlockEntry = false,
    this.fvgEntry = false,
    this.killZoneEntry = false,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'instrument': instrument,
      'tradeType': tradeType,
      'timeframe': timeframe,
      'strategyLogic': strategyLogic,
      'htfBiasAligned': htfBiasAligned ? 1 : 0,
      'liquidityTaken': liquidityTaken ? 1 : 0,
      'entryAtPOI': entryAtPOI ? 1 : 0,
      'riskManaged': riskManaged ? 1 : 0,
      'bosConfirmed': bosConfirmed ? 1 : 0,
      'mssConfirmed': mssConfirmed ? 1 : 0,
      'chochConfirmed': chochConfirmed ? 1 : 0,
      'orderBlockEntry': orderBlockEntry ? 1 : 0,
      'fvgEntry': fvgEntry ? 1 : 0,
      'killZoneEntry': killZoneEntry ? 1 : 0,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory TradeTemplate.fromMap(Map<String, dynamic> map) {
    return TradeTemplate(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      instrument: map['instrument'],
      tradeType: map['tradeType'],
      timeframe: map['timeframe'],
      strategyLogic: map['strategyLogic'],
      htfBiasAligned: map['htfBiasAligned'] == 1,
      liquidityTaken: map['liquidityTaken'] == 1,
      entryAtPOI: map['entryAtPOI'] == 1,
      riskManaged: map['riskManaged'] == 1,
      bosConfirmed: map['bosConfirmed'] == 1,
      mssConfirmed: map['mssConfirmed'] == 1,
      chochConfirmed: map['chochConfirmed'] == 1,
      orderBlockEntry: map['orderBlockEntry'] == 1,
      fvgEntry: map['fvgEntry'] == 1,
      killZoneEntry: map['killZoneEntry'] == 1,
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}
