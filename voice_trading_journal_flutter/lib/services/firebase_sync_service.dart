import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/journal_entry.dart';
import '../models/trading_rule.dart';

class FirebaseSyncService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static final FirebaseAuth _auth = FirebaseAuth.instance;

  static String? get userId => _auth.currentUser?.uid;

  // Collection references
  static CollectionReference<Map<String, dynamic>> _entriesCollection() {
    return _firestore.collection('users').doc(userId).collection('entries');
  }

  static CollectionReference<Map<String, dynamic>> _templatesCollection() {
    return _firestore.collection('users').doc(userId).collection('templates');
  }

  static CollectionReference<Map<String, dynamic>> _rulesCollection() {
    return _firestore.collection('users').doc(userId).collection('rules');
  }

  static CollectionReference<Map<String, dynamic>> _violationsCollection() {
    return _firestore.collection('users').doc(userId).collection('violations');
  }

  // Batch sync all local entries to cloud (fast!)
  static Future<int> uploadEntries(List<JournalEntry> entries) async {
    if (userId == null) {
      print('❌ Cannot upload: User not signed in');
      return 0;
    }
    
    if (entries.isEmpty) {
      print('ℹ️ No entries to upload');
      return 0;
    }

    print('🔄 Starting batch upload of ${entries.length} entries...');
    
    try {
      // Firestore batch limit is 500 writes per batch
      const batchSize = 500;
      int totalUploaded = 0;
      
      for (int i = 0; i < entries.length; i += batchSize) {
        final batch = _firestore.batch();
        final chunk = entries.skip(i).take(batchSize).toList();
        
        for (var entry in chunk) {
          final docRef = _entriesCollection().doc(entry.id);
          batch.set(docRef, entry.toMap(), SetOptions(merge: true));
        }
        
        await batch.commit();
        totalUploaded += chunk.length;
        print('✅ Batch ${(i ~/ batchSize) + 1} committed: ${chunk.length} entries');
      }
      
      print('✅ Upload complete: $totalUploaded entries synced to cloud');
      return totalUploaded;
    } catch (e) {
      print('❌ Batch upload failed: $e');
      rethrow;
    }
  }

  // Download all entries from cloud
  static Future<List<JournalEntry>> downloadEntries() async {
    if (userId == null) {
      print('❌ Cannot download: User not signed in');
      return [];
    }

    print('📥 Downloading entries from cloud...');
    
    try {
      final snapshot = await _entriesCollection().get();
      final entries = snapshot.docs
          .map((doc) => JournalEntry.fromMap(doc.data()))
          .toList();
      
      print('✅ Downloaded ${entries.length} entries from cloud');
      return entries;
    } catch (e) {
      print('❌ Download failed: $e');
      return [];
    }
  }

  // Upload single entry (for auto-sync on save)
  static Future<void> uploadEntry(JournalEntry entry) async {
    if (userId == null) return;
    
    try {
      await _entriesCollection().doc(entry.id).set(entry.toMap());
      print('✅ Entry ${entry.id} synced to cloud');
    } catch (e) {
      print('❌ Failed to sync entry: $e');
    }
  }

  // Delete entry from cloud
  static Future<void> deleteEntry(String entryId) async {
    if (userId == null) return;
    
    try {
      await _entriesCollection().doc(entryId).delete();
      print('✅ Entry $entryId deleted from cloud');
    } catch (e) {
      print('❌ Failed to delete entry from cloud: $e');
    }
  }

  // Batch sync templates
  static Future<int> uploadTemplates(List<TradeTemplate> templates) async {
    if (userId == null) return 0;
    if (templates.isEmpty) return 0;

    print('🔄 Uploading ${templates.length} templates...');
    
    try {
      final batch = _firestore.batch();
      
      for (var template in templates) {
        final docRef = _templatesCollection().doc(template.id);
        batch.set(docRef, template.toMap(), SetOptions(merge: true));
      }
      
      await batch.commit();
      print('✅ ${templates.length} templates synced to cloud');
      return templates.length;
    } catch (e) {
      print('❌ Template upload failed: $e');
      return 0;
    }
  }

  static Future<List<TradeTemplate>> downloadTemplates() async {
    if (userId == null) return [];

    try {
      final snapshot = await _templatesCollection().get();
      return snapshot.docs
          .map((doc) => TradeTemplate.fromMap(doc.data()))
          .toList();
    } catch (e) {
      print('❌ Template download failed: $e');
      return [];
    }
  }

  // ============================================
  // RULES SYNC
  // ============================================

  static Future<List<TradingRule>> downloadRules() async {
    if (userId == null) return [];

    try {
      final snapshot = await _rulesCollection().get();
      return snapshot.docs
          .map((doc) => TradingRule.fromMap(doc.data()))
          .toList();
    } catch (e) {
      print('❌ Rules download failed: $e');
      return [];
    }
  }

  static Future<int> uploadRules(List<TradingRule> rules) async {
    if (userId == null) return 0;
    if (rules.isEmpty) return 0;

    try {
      final batch = _firestore.batch();
      for (var rule in rules) {
        final docRef = _rulesCollection().doc(rule.id);
        batch.set(docRef, rule.toMap(), SetOptions(merge: true));
      }
      await batch.commit();
      print('✅ ${rules.length} rules synced to cloud');
      return rules.length;
    } catch (e) {
      print('❌ Rules upload failed: $e');
      return 0;
    }
  }

  // ============================================
  // VIOLATIONS SYNC
  // ============================================

  static Future<List<RuleViolation>> downloadViolations() async {
    if (userId == null) return [];

    try {
      final snapshot = await _violationsCollection().get();
      return snapshot.docs
          .map((doc) => RuleViolation.fromMap(doc.data()))
          .toList();
    } catch (e) {
      print('❌ Violations download failed: $e');
      return [];
    }
  }

  static Future<int> uploadViolations(List<RuleViolation> violations) async {
    if (userId == null) return 0;
    if (violations.isEmpty) return 0;

    try {
      final batch = _firestore.batch();
      for (var violation in violations) {
        final docRef = _violationsCollection().doc(violation.id);
        batch.set(docRef, violation.toMap(), SetOptions(merge: true));
      }
      await batch.commit();
      print('✅ ${violations.length} violations synced to cloud');
      return violations.length;
    } catch (e) {
      print('❌ Violations upload failed: $e');
      return 0;
    }
  }

  // Full sync - upload local to cloud, download cloud to local
  static Future<Map<String, int>> fullSync({
    required List<JournalEntry> localEntries,
    required List<TradeTemplate> localTemplates,
  }) async {
    if (userId == null) {
      print('❌ Cannot sync: User not signed in');
      return {'uploadedEntries': 0, 'downloadedEntries': 0};
    }

    print('🔄 Starting full sync...');
    
    // Upload local data
    final uploadedEntries = await uploadEntries(localEntries);
    final uploadedTemplates = await uploadTemplates(localTemplates);

    // Download cloud data
    final cloudEntries = await downloadEntries();
    final cloudTemplates = await downloadTemplates();
    final cloudRules = await downloadRules();
    final cloudViolations = await downloadViolations();

    print('✅ Full sync complete!');
    
    return {
      'uploadedEntries': uploadedEntries,
      'uploadedTemplates': uploadedTemplates,
      'downloadedEntries': cloudEntries.length,
      'downloadedTemplates': cloudTemplates.length,
      'downloadedRules': cloudRules.length,
      'downloadedViolations': cloudViolations.length,
    };
  }
}
