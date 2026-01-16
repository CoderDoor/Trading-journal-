import 'package:flutter/foundation.dart';
import '../models/journal_entry.dart';
import '../services/database_service.dart';

class JournalProvider extends ChangeNotifier {
  List<JournalEntry> _entries = [];
  List<TradeTemplate> _templates = [];
  Map<String, dynamic> _analytics = {};
  bool _loading = false;
  String? _error;

  List<JournalEntry> get entries => _entries;
  List<TradeTemplate> get templates => _templates;
  Map<String, dynamic> get analytics => _analytics;
  bool get loading => _loading;
  String? get error => _error;

  // Load all entries from local database
  Future<void> loadEntries({
    String? search,
    String? outcome,
    String? timeframe,
    String? emotionState,
    String? accountId,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      if (accountId != null && accountId.isNotEmpty) {
        _entries = await DatabaseService.getEntriesByAccount(accountId);
      } else {
        _entries = await DatabaseService.getEntries(
          search: search,
          outcome: outcome,
          timeframe: timeframe,
          emotionState: emotionState,
        );
      }
    } catch (e) {
      _error = e.toString();
    }

    _loading = false;
    notifyListeners();
  }

  // Create a new entry - saves to local database
  Future<bool> createEntry(JournalEntry entry) async {
    try {
      await DatabaseService.createEntry(entry);
      await loadEntries(); // Refresh the list
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Delete an entry from local database
  Future<bool> deleteEntry(String id) async {
    try {
      await DatabaseService.deleteEntry(id);
      _entries.removeWhere((e) => e.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Update an entry in local database
  Future<bool> updateEntry(JournalEntry entry) async {
    try {
      await DatabaseService.updateEntry(entry);
      final index = _entries.indexWhere((e) => e.id == entry.id);
      if (index != -1) {
        _entries[index] = entry;
      }
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Load templates
  Future<void> loadTemplates() async {
    try {
      _templates = await DatabaseService.getTemplates();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // Create template
  Future<bool> createTemplate(TradeTemplate template) async {
    try {
      await DatabaseService.createTemplate(template);
      await loadTemplates();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Delete template
  Future<bool> deleteTemplate(String id) async {
    try {
      await DatabaseService.deleteTemplate(id);
      _templates.removeWhere((t) => t.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Load analytics
  Future<void> loadAnalytics({int days = 30}) async {
    _loading = true;
    notifyListeners();

    try {
      final startDate = DateTime.now().subtract(Duration(days: days));
      _analytics = await DatabaseService.getAnalytics(startDate: startDate);
    } catch (e) {
      _error = e.toString();
    }

    _loading = false;
    notifyListeners();
  }

  // Get entries for a specific date
  List<JournalEntry> getEntriesForDate(DateTime date) {
    return _entries.where((e) {
      return e.createdAt.year == date.year &&
          e.createdAt.month == date.month &&
          e.createdAt.day == date.day;
    }).toList();
  }

  // Quick stats
  int get totalTrades => _entries.length;
  int get wins => _entries.where((e) => e.outcome == 'WIN').length;
  int get losses => _entries.where((e) => e.outcome == 'LOSS').length;
  double get winRate {
    final completed = wins + losses;
    return completed > 0 ? (wins / completed * 100) : 0;
  }
}
