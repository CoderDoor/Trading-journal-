import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:uuid/uuid.dart';
import '../models/journal_entry.dart';

class DatabaseService {
  static Database? _database;
  static final _uuid = Uuid();

  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB();
    return _database!;
  }

  static Future<Database> _initDB() async {
    String path = join(await getDatabasesPath(), 'trading_journal.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  static Future<void> _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE journal_entries (
        id TEXT PRIMARY KEY,
        instrument TEXT,
        tradeType TEXT,
        timeframe TEXT,
        entryPrice REAL,
        stopLoss REAL,
        target REAL,
        riskReward REAL,
        outcome TEXT,
        tradeReason TEXT,
        strategyLogic TEXT,
        htfBiasAligned INTEGER DEFAULT 0,
        liquidityTaken INTEGER DEFAULT 0,
        entryAtPOI INTEGER DEFAULT 0,
        riskManaged INTEGER DEFAULT 0,
        bosConfirmed INTEGER DEFAULT 0,
        mssConfirmed INTEGER DEFAULT 0,
        chochConfirmed INTEGER DEFAULT 0,
        orderBlockEntry INTEGER DEFAULT 0,
        fvgEntry INTEGER DEFAULT 0,
        killZoneEntry INTEGER DEFAULT 0,
        asianSession INTEGER DEFAULT 0,
        londonSession INTEGER DEFAULT 0,
        nySession INTEGER DEFAULT 0,
        londonClose INTEGER DEFAULT 0,
        emotionState TEXT,
        whatWentWell TEXT,
        whatWentWrong TEXT,
        improvement TEXT,
        screenshot TEXT,
        rawTranscript TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE trade_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        instrument TEXT,
        tradeType TEXT,
        timeframe TEXT,
        strategyLogic TEXT,
        htfBiasAligned INTEGER DEFAULT 0,
        liquidityTaken INTEGER DEFAULT 0,
        entryAtPOI INTEGER DEFAULT 0,
        riskManaged INTEGER DEFAULT 0,
        bosConfirmed INTEGER DEFAULT 0,
        mssConfirmed INTEGER DEFAULT 0,
        chochConfirmed INTEGER DEFAULT 0,
        orderBlockEntry INTEGER DEFAULT 0,
        fvgEntry INTEGER DEFAULT 0,
        killZoneEntry INTEGER DEFAULT 0,
        createdAt TEXT
      )
    ''');

    // Create indexes
    await db.execute('CREATE INDEX idx_entries_createdAt ON journal_entries(createdAt)');
    await db.execute('CREATE INDEX idx_entries_instrument ON journal_entries(instrument)');
    await db.execute('CREATE INDEX idx_entries_outcome ON journal_entries(outcome)');
  }

  // Journal Entry CRUD
  static Future<String> createEntry(JournalEntry entry) async {
    final db = await database;
    final id = _uuid.v4();
    final now = DateTime.now();
    final newEntry = entry.copyWith(id: id, createdAt: now, updatedAt: now);
    await db.insert('journal_entries', newEntry.toMap());
    return id;
  }

  // Create entry with existing ID (for cloud sync)
  static Future<void> createEntryWithId(JournalEntry entry) async {
    final db = await database;
    await db.insert(
      'journal_entries',
      entry.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  static Future<List<JournalEntry>> getEntries({
    String? search,
    String? outcome,
    String? timeframe,
    String? emotionState,
    DateTime? startDate,
    DateTime? endDate,
    int limit = 50,
  }) async {
    final db = await database;
    String whereClause = '1=1';
    List<dynamic> whereArgs = [];

    if (search != null && search.isNotEmpty) {
      whereClause += ' AND (instrument LIKE ? OR tradeReason LIKE ? OR strategyLogic LIKE ?)';
      whereArgs.addAll(['%$search%', '%$search%', '%$search%']);
    }
    if (outcome != null && outcome.isNotEmpty) {
      whereClause += ' AND outcome = ?';
      whereArgs.add(outcome);
    }
    if (timeframe != null && timeframe.isNotEmpty) {
      whereClause += ' AND timeframe = ?';
      whereArgs.add(timeframe);
    }
    if (emotionState != null && emotionState.isNotEmpty) {
      whereClause += ' AND emotionState = ?';
      whereArgs.add(emotionState);
    }
    if (startDate != null) {
      whereClause += ' AND createdAt >= ?';
      whereArgs.add(startDate.toIso8601String());
    }
    if (endDate != null) {
      whereClause += ' AND createdAt <= ?';
      whereArgs.add(endDate.toIso8601String());
    }

    final List<Map<String, dynamic>> maps = await db.query(
      'journal_entries',
      where: whereClause,
      whereArgs: whereArgs,
      orderBy: 'createdAt DESC',
      limit: limit,
    );

    return maps.map((m) => JournalEntry.fromMap(m)).toList();
  }

  static Future<JournalEntry?> getEntry(String id) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'journal_entries',
      where: 'id = ?',
      whereArgs: [id],
    );
    if (maps.isEmpty) return null;
    return JournalEntry.fromMap(maps.first);
  }

  static Future<void> updateEntry(JournalEntry entry) async {
    final db = await database;
    final updated = entry.copyWith(updatedAt: DateTime.now());
    await db.update(
      'journal_entries',
      updated.toMap(),
      where: 'id = ?',
      whereArgs: [entry.id],
    );
  }

  static Future<void> deleteEntry(String id) async {
    final db = await database;
    await db.delete('journal_entries', where: 'id = ?', whereArgs: [id]);
  }

  // Template CRUD
  static Future<String> createTemplate(TradeTemplate template) async {
    final db = await database;
    final id = _uuid.v4();
    final newTemplate = TradeTemplate(
      id: id,
      name: template.name,
      description: template.description,
      instrument: template.instrument,
      tradeType: template.tradeType,
      timeframe: template.timeframe,
      strategyLogic: template.strategyLogic,
      htfBiasAligned: template.htfBiasAligned,
      liquidityTaken: template.liquidityTaken,
      entryAtPOI: template.entryAtPOI,
      riskManaged: template.riskManaged,
      bosConfirmed: template.bosConfirmed,
      mssConfirmed: template.mssConfirmed,
      chochConfirmed: template.chochConfirmed,
      orderBlockEntry: template.orderBlockEntry,
      fvgEntry: template.fvgEntry,
      killZoneEntry: template.killZoneEntry,
      createdAt: DateTime.now(),
    );
    await db.insert('trade_templates', newTemplate.toMap());
    return id;
  }

  static Future<List<TradeTemplate>> getTemplates() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'trade_templates',
      orderBy: 'createdAt DESC',
    );
    return maps.map((m) => TradeTemplate.fromMap(m)).toList();
  }

  static Future<void> deleteTemplate(String id) async {
    final db = await database;
    await db.delete('trade_templates', where: 'id = ?', whereArgs: [id]);
  }

  // Create template with existing ID (for cloud sync)
  static Future<void> createTemplateWithId(TradeTemplate template) async {
    final db = await database;
    await db.insert(
      'trade_templates',
      template.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Analytics
  static Future<Map<String, dynamic>> getAnalytics({
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    final db = await database;
    String whereClause = '1=1';
    List<dynamic> whereArgs = [];

    if (startDate != null) {
      whereClause += ' AND createdAt >= ?';
      whereArgs.add(startDate.toIso8601String());
    }
    if (endDate != null) {
      whereClause += ' AND createdAt <= ?';
      whereArgs.add(endDate.toIso8601String());
    }

    final entries = await db.query('journal_entries', where: whereClause, whereArgs: whereArgs);
    
    int wins = 0, losses = 0, breakeven = 0;
    double totalRR = 0;
    int rrCount = 0;
    Map<String, Map<String, int>> instrumentStats = {};
    Map<String, Map<String, int>> emotionStats = {};

    for (var e in entries) {
      final outcome = e['outcome'] as String?;
      if (outcome == 'WIN') wins++;
      else if (outcome == 'LOSS') losses++;
      else if (outcome == 'BE') breakeven++;

      final rr = e['riskReward'] as double?;
      if (rr != null && rr > 0) {
        totalRR += rr;
        rrCount++;
      }

      final instrument = e['instrument'] as String?;
      if (instrument != null) {
        instrumentStats.putIfAbsent(instrument, () => {'wins': 0, 'total': 0});
        instrumentStats[instrument]!['total'] = (instrumentStats[instrument]!['total'] ?? 0) + 1;
        if (outcome == 'WIN') {
          instrumentStats[instrument]!['wins'] = (instrumentStats[instrument]!['wins'] ?? 0) + 1;
        }
      }

      final emotion = e['emotionState'] as String?;
      if (emotion != null) {
        emotionStats.putIfAbsent(emotion, () => {'wins': 0, 'total': 0});
        emotionStats[emotion]!['total'] = (emotionStats[emotion]!['total'] ?? 0) + 1;
        if (outcome == 'WIN') {
          emotionStats[emotion]!['wins'] = (emotionStats[emotion]!['wins'] ?? 0) + 1;
        }
      }
    }

    final total = wins + losses;
    return {
      'totalTrades': entries.length,
      'wins': wins,
      'losses': losses,
      'breakeven': breakeven,
      'winRate': total > 0 ? (wins / total * 100).round() : 0,
      'avgRiskReward': rrCount > 0 ? (totalRR / rrCount * 100).round() / 100 : 0,
      'instrumentStats': instrumentStats,
      'emotionStats': emotionStats,
    };
  }

  // Get entries for calendar
  static Future<Map<DateTime, List<JournalEntry>>> getEntriesByDate({
    required DateTime start,
    required DateTime end,
  }) async {
    final entries = await getEntries(startDate: start, endDate: end, limit: 500);
    Map<DateTime, List<JournalEntry>> result = {};
    
    for (var entry in entries) {
      final date = DateTime(entry.createdAt.year, entry.createdAt.month, entry.createdAt.day);
      result.putIfAbsent(date, () => []);
      result[date]!.add(entry);
    }
    
    return result;
  }
}
