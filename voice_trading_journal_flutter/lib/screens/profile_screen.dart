import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/journal_provider.dart';
import '../providers/theme_provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final isDark = themeProvider.isDarkMode;
    
    return Scaffold(
      body: SafeArea(
        child: Consumer<AuthProvider>(
          builder: (ctx, auth, _) {
            return SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    children: [
                      const Text('👤', style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 12),
                      const Text('Profile & Sync', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Account Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [AppTheme.bgTertiary, AppTheme.bgSecondary]),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: auth.isLoggedIn ? _buildLoggedInView(context, auth) : _buildLoggedOutView(context, auth),
                  ),

                  const SizedBox(height: 24),

                  // Sync Status
                  if (auth.isLoggedIn) ...[
                    const Text('Cloud Sync', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                    const SizedBox(height: 12),
                    _buildSyncCard(context, auth),
                  ],

                  const SizedBox(height: 24),

                  // Settings Section
                  const Text('Settings', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.bgTertiary,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.palette_outlined,
                          color: AppTheme.accent,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Theme', style: TextStyle(fontWeight: FontWeight.w500)),
                              Text(
                                'Dark mode enabled',
                                style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppTheme.accent.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Premium',
                            style: TextStyle(color: AppTheme.accent, fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // App Info
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.bgTertiary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Text('🎙️', style: TextStyle(fontSize: 24)),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Voice Trading Journal', style: TextStyle(fontWeight: FontWeight.w600)),
                                Text('Version 1.0.0', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildLoggedOutView(BuildContext context, AuthProvider auth) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppTheme.bgPrimary.withOpacity(0.5),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.cloud_off, size: 48, color: AppTheme.textMuted),
        ),
        const SizedBox(height: 16),
        const Text(
          'Sign in to sync',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Text(
          'Sync your trades across all devices',
          style: TextStyle(color: AppTheme.textMuted),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: ElevatedButton.icon(
              onPressed: auth.loading ? null : () async {
                final success = await auth.signInWithGoogle();
                if (success && context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Row(
                        children: [
                          const Icon(Icons.check_circle, color: Colors.white),
                          const SizedBox(width: 8),
                          const Text('Signed in successfully!'),
                        ],
                      ),
                      backgroundColor: AppTheme.profit,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                  // Auto sync after login
                  auth.syncWithCloud();
                }
              },
              icon: auth.loading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : Image.network(
                      'https://www.google.com/favicon.ico',
                      width: 20,
                      height: 20,
                      errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata, color: Colors.red),
                    ),
              label: Text(
                auth.loading ? 'Signing in...' : 'Sign in with Google',
                style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w600),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black87,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLoggedInView(BuildContext context, AuthProvider auth) {
    return Row(
      children: [
        CircleAvatar(
          radius: 30,
          backgroundColor: AppTheme.accent.withOpacity(0.2),
          backgroundImage: auth.photoUrl != null ? NetworkImage(auth.photoUrl!) : null,
          child: auth.photoUrl == null
              ? Text(
                  auth.displayName[0].toUpperCase(),
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.accent),
                )
              : null,
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(auth.displayName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
              const SizedBox(height: 4),
              Text(auth.email ?? '', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.profit.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.cloud_done, size: 12, color: AppTheme.profit),
                        const SizedBox(width: 4),
                        Text('Synced', style: TextStyle(color: AppTheme.profit, fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        IconButton(
          onPressed: () async {
            final confirm = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                backgroundColor: AppTheme.bgSecondary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                title: const Text('Sign Out?'),
                content: const Text('Your local data will remain on this device.'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.loss),
                    child: const Text('Sign Out'),
                  ),
                ],
              ),
            );
            if (confirm == true) {
              await auth.signOut();
            }
          },
          icon: const Icon(Icons.logout, color: AppTheme.textMuted),
        ),
      ],
    );
  }

  Widget _buildSyncCard(BuildContext context, AuthProvider auth) {
    final journalProvider = context.read<JournalProvider>();
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppTheme.bgTertiary, AppTheme.bgSecondary]),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    auth.syncing ? Icons.sync : Icons.cloud_sync,
                    color: AppTheme.accent,
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        auth.syncing ? 'Syncing...' : 'Auto Sync Enabled',
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                      Text(
                        'Your trades sync automatically',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: auth.syncing ? null : () async {
                final results = await auth.syncWithCloud();
                await journalProvider.loadEntries();
                
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Row(
                        children: [
                          const Icon(Icons.check_circle, color: Colors.white),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Synced! ↑${results['uploadedEntries'] ?? 0} ↓${results['downloadedEntries'] ?? 0} trades',
                            ),
                          ),
                        ],
                      ),
                      backgroundColor: AppTheme.profit,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                }
              },
              icon: auth.syncing
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.accent),
                    )
                  : const Icon(Icons.sync),
              label: Text(auth.syncing ? 'Syncing...' : 'Sync Now'),
            ),
          ),
        ],
      ),
    );
  }
}
