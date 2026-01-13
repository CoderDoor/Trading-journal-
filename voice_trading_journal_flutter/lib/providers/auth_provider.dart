import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../services/firebase_sync_service.dart';
import '../services/database_service.dart';
import '../models/journal_entry.dart';

class AuthProvider extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  User? _user;
  bool _loading = false;
  bool _syncing = false;
  String? _error;

  User? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get loading => _loading;
  bool get syncing => _syncing;
  String? get error => _error;
  String get displayName => _user?.displayName ?? 'User';
  String? get photoUrl => _user?.photoURL;
  String? get email => _user?.email;

  AuthProvider() {
    _auth.authStateChanges().listen((user) {
      _user = user;
      notifyListeners();
    });
  }

  // Google Sign In
  Future<bool> signInWithGoogle() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        _loading = false;
        notifyListeners();
        return false;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      await _auth.signInWithCredential(credential);
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  // Sign Out
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
    notifyListeners();
  }

  // Sync data with cloud
  Future<Map<String, int>> syncWithCloud() async {
    if (!isLoggedIn) return {};

    _syncing = true;
    _error = null;
    notifyListeners();

    try {
      // Get local data
      final localEntries = await DatabaseService.getEntries(limit: 1000);
      final localTemplates = await DatabaseService.getTemplates();

      // Upload to cloud
      final results = await FirebaseSyncService.fullSync(
        localEntries: localEntries,
        localTemplates: localTemplates,
      );

      // Download cloud data and merge
      final cloudEntries = await FirebaseSyncService.downloadEntries();
      final cloudTemplates = await FirebaseSyncService.downloadTemplates();

      // Merge cloud entries to local - use REPLACE to overwrite local with cloud data
      print('📥 Merging ${cloudEntries.length} cloud entries to local...');
      for (var cloudEntry in cloudEntries) {
        // Use createEntryWithId which does INSERT OR REPLACE
        await DatabaseService.createEntryWithId(cloudEntry);
        print('  ✅ Merged entry: ${cloudEntry.id} (outcome: ${cloudEntry.outcome})');
      }

      // Merge cloud templates - update or create
      for (var template in cloudTemplates) {
        await DatabaseService.createTemplateWithId(template);
      }

      _syncing = false;
      notifyListeners();
      return results;
    } catch (e) {
      _error = e.toString();
      _syncing = false;
      notifyListeners();
      return {};
    }
  }

  // Upload single entry to cloud
  Future<void> uploadEntry(JournalEntry entry) async {
    if (!isLoggedIn) return;
    await FirebaseSyncService.uploadEntry(entry);
  }

  // Delete entry from cloud
  Future<void> deleteEntryFromCloud(String entryId) async {
    if (!isLoggedIn) return;
    await FirebaseSyncService.deleteEntry(entryId);
  }
}
