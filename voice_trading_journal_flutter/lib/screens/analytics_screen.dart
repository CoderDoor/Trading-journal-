import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/journal_provider.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  int _days = 30;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<JournalProvider>().loadAnalytics(days: _days);
    });
  }

  void _changePeriod(int days) {
    setState(() => _days = days);
    context.read<JournalProvider>().loadAnalytics(days: days);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Consumer<JournalProvider>(
          builder: (ctx, provider, _) {
            final analytics = provider.analytics;

            return RefreshIndicator(
              onRefresh: () => provider.loadAnalytics(days: _days),
              color: AppTheme.accent,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Text('📊', style: TextStyle(fontSize: 28)),
                            const SizedBox(width: 12),
                            const Text('Analytics', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: AppTheme.bgTertiary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [7, 30, 90].map((d) {
                              final isSelected = _days == d;
                              return GestureDetector(
                                onTap: () => _changePeriod(d),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: isSelected ? AppTheme.accent : Colors.transparent,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '${d}D',
                                    style: TextStyle(
                                      color: isSelected ? Colors.white : AppTheme.textMuted,
                                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    if (provider.loading)
                      const Center(child: Padding(
                        padding: EdgeInsets.all(50),
                        child: CircularProgressIndicator(color: AppTheme.accent),
                      ))
                    else if ((analytics['totalTrades'] ?? 0) == 0)
                      _buildEmptyState()
                    else ...[
                      _buildSummaryCards(analytics),
                      const SizedBox(height: 20),
                      _buildWinLossChart(analytics),
                      const SizedBox(height: 20),
                      _buildInstrumentStats(analytics),
                      const SizedBox(height: 20),
                      _buildEmotionStats(analytics),
                    ],
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(50),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.bgTertiary.withOpacity(0.5),
                shape: BoxShape.circle,
              ),
              child: const Text('📊', style: TextStyle(fontSize: 48)),
            ),
            const SizedBox(height: 20),
            const Text('No data yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text('Start journaling to see analytics', style: TextStyle(color: AppTheme.textMuted)),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCards(Map<String, dynamic> analytics) {
    final total = analytics['totalTrades'] ?? 0;
    final wins = analytics['wins'] ?? 0;
    final losses = analytics['losses'] ?? 0;
    final winRate = analytics['winRate'] ?? 0;
    final avgRR = analytics['avgRiskReward'] ?? 0;

    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildStatCard('Total Trades', total.toString(), Icons.trending_up, AppTheme.accent)),
            const SizedBox(width: 12),
            Expanded(child: _buildStatCard('Win Rate', '$winRate%', Icons.pie_chart,
                winRate >= 50 ? AppTheme.profit : AppTheme.loss)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _buildStatCard('Wins', wins.toString(), Icons.check_circle, AppTheme.profit)),
            const SizedBox(width: 12),
            Expanded(child: _buildStatCard('Losses', losses.toString(), Icons.cancel, AppTheme.loss)),
          ],
        ),
        const SizedBox(height: 12),
        _buildStatCard('Avg R:R', '1:$avgRR', Icons.show_chart, AppTheme.accent, fullWidth: true),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color, {bool fullWidth = false}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppTheme.bgTertiary, AppTheme.bgSecondary]),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: color)),
                const SizedBox(height: 2),
                Text(label, style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWinLossChart(Map<String, dynamic> analytics) {
    final wins = (analytics['wins'] ?? 0).toDouble();
    final losses = (analytics['losses'] ?? 0).toDouble();
    final be = (analytics['breakeven'] ?? 0).toDouble();
    final total = wins + losses + be;

    if (total == 0) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppTheme.bgTertiary, AppTheme.bgSecondary]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Win/Loss Distribution', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
          const SizedBox(height: 20),
          SizedBox(
            height: 160,
            child: PieChart(
              PieChartData(
                sectionsSpace: 3,
                centerSpaceRadius: 35,
                sections: [
                  PieChartSectionData(
                    value: wins,
                    color: AppTheme.profit,
                    title: '${(wins / total * 100).round()}%',
                    titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                    radius: 50,
                  ),
                  PieChartSectionData(
                    value: losses,
                    color: AppTheme.loss,
                    title: '${(losses / total * 100).round()}%',
                    titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                    radius: 50,
                  ),
                  if (be > 0)
                    PieChartSectionData(
                      value: be,
                      color: AppTheme.neutral,
                      title: '${(be / total * 100).round()}%',
                      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      radius: 50,
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegendItem('Wins', AppTheme.profit),
              const SizedBox(width: 20),
              _buildLegendItem('Losses', AppTheme.loss),
              if (be > 0) ...[
                const SizedBox(width: 20),
                _buildLegendItem('BE', AppTheme.neutral),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
      ],
    );
  }

  Widget _buildInstrumentStats(Map<String, dynamic> analytics) {
    final stats = analytics['instrumentStats'] as Map<String, Map<String, int>>? ?? {};
    if (stats.isEmpty) return const SizedBox.shrink();

    final sorted = stats.entries.toList()
      ..sort((a, b) => (b.value['total'] ?? 0).compareTo(a.value['total'] ?? 0));

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppTheme.bgTertiary, AppTheme.bgSecondary]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('By Instrument', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
          const SizedBox(height: 16),
          ...sorted.take(5).map((e) {
            final winRate = e.value['total']! > 0 ? (e.value['wins']! / e.value['total']! * 100).round() : 0;
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                children: [
                  SizedBox(width: 70, child: Text(e.key, style: const TextStyle(fontWeight: FontWeight.w500))),
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: winRate / 100,
                        backgroundColor: AppTheme.loss.withOpacity(0.2),
                        valueColor: AlwaysStoppedAnimation(winRate >= 50 ? AppTheme.profit : AppTheme.loss),
                        minHeight: 8,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 45,
                    child: Text(
                      '$winRate%',
                      textAlign: TextAlign.right,
                      style: TextStyle(color: winRate >= 50 ? AppTheme.profit : AppTheme.loss, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildEmotionStats(Map<String, dynamic> analytics) {
    final stats = analytics['emotionStats'] as Map<String, Map<String, int>>? ?? {};
    if (stats.isEmpty) return const SizedBox.shrink();

    final emotionIcons = {'CALM': '😌', 'CONFIDENT': '💪', 'FEAR': '😰', 'FOMO': '😬', 'REVENGE': '😤', 'ANXIOUS': '😟'};

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppTheme.bgTertiary, AppTheme.bgSecondary]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('By Emotion', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: stats.entries.map((e) {
              final winRate = e.value['total']! > 0 ? (e.value['wins']! / e.value['total']! * 100).round() : 0;
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppTheme.bgPrimary,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(emotionIcons[e.key] ?? '😐', style: const TextStyle(fontSize: 16)),
                    const SizedBox(width: 6),
                    Text(e.key, style: const TextStyle(fontSize: 12)),
                    const SizedBox(width: 10),
                    Text(
                      '$winRate%',
                      style: TextStyle(
                        color: winRate >= 50 ? AppTheme.profit : AppTheme.loss,
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
