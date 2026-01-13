import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme/app_theme.dart';
import '../models/trading_rule.dart';

class RulebookScreen extends StatefulWidget {
  const RulebookScreen({super.key});

  @override
  State<RulebookScreen> createState() => _RulebookScreenState();
}

class _RulebookScreenState extends State<RulebookScreen> {
  List<TradingRule> _rules = [];
  List<RuleViolation> _violations = [];
  bool _loading = true;
  String _selectedCategory = 'ALL';

  final _categories = ['ALL', 'ENTRY', 'EXIT', 'RISK', 'PSYCHOLOGY', 'GENERAL'];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() => _loading = false);
      return;
    }

    try {
      // Load rules
      final rulesSnapshot = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .collection('rules')
          .get();
      
      _rules = rulesSnapshot.docs
          .map((doc) => TradingRule.fromMap(doc.data()))
          .toList();

      // Load violations
      final violationsSnapshot = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .collection('violations')
          .where('status', isEqualTo: 'PENDING')
          .get();
      
      _violations = violationsSnapshot.docs
          .map((doc) => RuleViolation.fromMap(doc.data()))
          .toList();

    } catch (e) {
      print('Error loading rulebook: $e');
    }

    setState(() => _loading = false);
  }

  Future<void> _completeViolation(RuleViolation violation) async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    try {
      await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .collection('violations')
          .doc(violation.id)
          .update({
        'status': 'COMPLETED',
        'completedAt': DateTime.now().toIso8601String(),
      });

      await _loadData();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 8),
                const Text('Punishment completed! 🎉'),
              ],
            ),
            backgroundColor: AppTheme.profit,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      print('Error completing violation: $e');
    }
  }

  List<TradingRule> get _filteredRules {
    if (_selectedCategory == 'ALL') return _rules;
    return _rules.where((r) => r.category == _selectedCategory).toList();
  }

  Color _getSeverityColor(String severity) {
    switch (severity) {
      case 'LOW': return AppTheme.profit;
      case 'MEDIUM': return AppTheme.neutral;
      case 'HIGH': return AppTheme.loss;
      case 'CRITICAL': return Colors.red.shade800;
      default: return AppTheme.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: _loadData,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Row(
                        children: [
                          const Text('📋', style: TextStyle(fontSize: 28)),
                          const SizedBox(width: 12),
                          const Text('Rulebook', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${_rules.length} rules • ${_violations.length} pending violations',
                        style: TextStyle(color: AppTheme.textMuted),
                      ),
                      const SizedBox(height: 24),

                      // Pending Violations
                      if (_violations.isNotEmpty) ...[
                        const Text('⚠️ Pending Punishments', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                        const SizedBox(height: 12),
                        ..._violations.map((v) => _buildViolationCard(v)),
                        const SizedBox(height: 24),
                      ],

                      // Category Filter
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: _categories.map((cat) {
                            final isSelected = _selectedCategory == cat;
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: FilterChip(
                                label: Text(cat),
                                selected: isSelected,
                                onSelected: (_) => setState(() => _selectedCategory = cat),
                                backgroundColor: AppTheme.bgTertiary,
                                selectedColor: AppTheme.accentGlow,
                                labelStyle: TextStyle(
                                  color: isSelected ? AppTheme.accent : AppTheme.textSecondary,
                                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Rules List
                      if (_filteredRules.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.all(40),
                            child: Column(
                              children: [
                                const Text('📭', style: TextStyle(fontSize: 48)),
                                const SizedBox(height: 16),
                                const Text('No rules yet', style: TextStyle(fontWeight: FontWeight.w600)),
                                const SizedBox(height: 8),
                                Text(
                                  'Add rules from the web app and sync',
                                  style: TextStyle(color: AppTheme.textMuted),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        )
                      else
                        ..._filteredRules.map((rule) => _buildRuleCard(rule)),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildViolationCard(RuleViolation violation) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.loss.withOpacity(0.15), AppTheme.bgSecondary],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.loss.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getSeverityColor(violation.severity).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  violation.severity,
                  style: TextStyle(
                    color: _getSeverityColor(violation.severity),
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                violation.punishmentType,
                style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            violation.ruleName,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Text(
            violation.punishment,
            style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _completeViolation(violation),
              icon: const Icon(Icons.check, size: 18),
              label: const Text('Mark Complete'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.profit,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRuleCard(TradingRule rule) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.bgTertiary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 50,
            decoration: BoxDecoration(
              color: _getSeverityColor(rule.severity),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        rule.name,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.bgSecondary,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        rule.category,
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 10),
                      ),
                    ),
                  ],
                ),
                if (rule.description != null && rule.description!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    rule.description!,
                    style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
