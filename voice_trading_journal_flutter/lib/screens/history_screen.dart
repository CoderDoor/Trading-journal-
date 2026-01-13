import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:typed_data';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../models/journal_entry.dart';
import '../providers/journal_provider.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  String _searchQuery = '';
  String? _outcomeFilter;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<JournalProvider>().loadEntries();
    });
  }

  Future<void> _deleteEntry(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bgSecondary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Entry?'),
        content: const Text('This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.loss),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirm == true && mounted) {
      await context.read<JournalProvider>().deleteEntry(id);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Entry deleted'),
          backgroundColor: AppTheme.loss,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _applyFilters() {
    context.read<JournalProvider>().loadEntries(
      search: _searchQuery.isEmpty ? null : _searchQuery,
      outcome: _outcomeFilter,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('📜', style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 12),
                      const Text(
                        'Trade History',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Search & Filters
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          style: const TextStyle(fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'Search trades...',
                            prefixIcon: const Icon(Icons.search, size: 20),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            filled: true,
                            fillColor: AppTheme.bgTertiary,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          onChanged: (v) {
                            _searchQuery = v;
                            _applyFilters();
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        decoration: BoxDecoration(
                          color: AppTheme.bgTertiary,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: PopupMenuButton<String?>(
                          icon: Icon(
                            Icons.filter_list,
                            color: _outcomeFilter != null ? AppTheme.accent : AppTheme.textMuted,
                          ),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          color: AppTheme.bgSecondary,
                          onSelected: (v) {
                            setState(() => _outcomeFilter = v);
                            _applyFilters();
                          },
                          itemBuilder: (ctx) => [
                            _buildFilterItem(null, '🔮 All', _outcomeFilter),
                            _buildFilterItem('WIN', '✅ Wins', _outcomeFilter),
                            _buildFilterItem('LOSS', '❌ Losses', _outcomeFilter),
                            _buildFilterItem('BE', '➖ Breakeven', _outcomeFilter),
                            _buildFilterItem('RUNNING', '🔵 Running', _outcomeFilter),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Entries List
            Expanded(
              child: Consumer<JournalProvider>(
                builder: (ctx, provider, _) {
                  if (provider.loading) {
                    return const Center(
                      child: CircularProgressIndicator(color: AppTheme.accent),
                    );
                  }

                  if (provider.entries.isEmpty) {
                    return _buildEmptyState();
                  }

                  return RefreshIndicator(
                    onRefresh: () => provider.loadEntries(),
                    color: AppTheme.accent,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: provider.entries.length,
                      itemBuilder: (ctx, i) => _buildEntryCard(provider.entries[i]),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  PopupMenuItem<String?> _buildFilterItem(String? value, String label, String? current) {
    return PopupMenuItem(
      value: value,
      child: Row(
        children: [
          if (current == value) Icon(Icons.check, color: AppTheme.accent, size: 18),
          if (current == value) const SizedBox(width: 8),
          Text(label),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppTheme.bgTertiary.withOpacity(0.5),
              shape: BoxShape.circle,
            ),
            child: const Text('📜', style: TextStyle(fontSize: 48)),
          ),
          const SizedBox(height: 20),
          const Text(
            'No trades yet',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Start journaling to see your history',
            style: TextStyle(color: AppTheme.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildEntryCard(JournalEntry entry) {
    final outcomeColor = AppTheme.getOutcomeColor(entry.outcome);

    return Dismissible(
      key: Key(entry.id),
      direction: DismissDirection.endToStart,
      background: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: AppTheme.loss,
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      confirmDismiss: (_) async {
        await _deleteEntry(entry.id);
        return false;
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppTheme.bgTertiary, AppTheme.bgSecondary],
          ),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.border),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _showEntryDetails(entry),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 4,
                      height: 40,
                      decoration: BoxDecoration(
                        color: outcomeColor,
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
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: outcomeColor.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  entry.outcome ?? 'N/A',
                                  style: TextStyle(
                                    color: outcomeColor,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 11,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                entry.instrument ?? 'Unknown',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 16,
                                ),
                              ),
                              const Spacer(),
                              if (entry.riskReward != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.accent.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '1:${entry.riskReward!.toStringAsFixed(1)}',
                                    style: const TextStyle(
                                      color: AppTheme.accent,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              if (entry.tradeType != null) ...[
                                Icon(
                                  entry.tradeType == 'BUY' ? Icons.trending_up : Icons.trending_down,
                                  color: entry.tradeType == 'BUY' ? AppTheme.profit : AppTheme.loss,
                                  size: 16,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  entry.tradeType!,
                                  style: TextStyle(
                                    color: entry.tradeType == 'BUY' ? AppTheme.profit : AppTheme.loss,
                                    fontWeight: FontWeight.w500,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(width: 12),
                              ],
                              if (entry.timeframe != null)
                                Text(
                                  entry.timeframe!,
                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                                ),
                              const Spacer(),
                              Icon(Icons.access_time, size: 12, color: AppTheme.textMuted),
                              const SizedBox(width: 4),
                              Text(
                                DateFormat('MMM d, h:mm a').format(entry.createdAt),
                                style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showEntryDetails(JournalEntry entry) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        decoration: BoxDecoration(
          color: AppTheme.bgSecondary,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.3,
          maxChildSize: 1.0,
          expand: false,
          builder: (ctx, scrollController) => SingleChildScrollView(
            controller: scrollController,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppTheme.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppTheme.getOutcomeColor(entry.outcome).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        entry.outcome ?? 'N/A',
                        style: TextStyle(
                          color: AppTheme.getOutcomeColor(entry.outcome),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      entry.instrument ?? 'Unknown',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _buildDetailSection('Trade Details', [
                  _buildDetailRow('Type', entry.tradeType),
                  _buildDetailRow('Timeframe', entry.timeframe),
                  _buildDetailRow('Entry', entry.entryPrice?.toStringAsFixed(5)),
                  _buildDetailRow('Stop Loss', entry.stopLoss?.toStringAsFixed(5)),
                  _buildDetailRow('Target', entry.target?.toStringAsFixed(5)),
                  _buildDetailRow('R:R', entry.riskReward != null ? '1:${entry.riskReward!.toStringAsFixed(1)}' : null),
                ]),
                if (entry.emotionState != null || entry.tradeReason != null)
                  _buildDetailSection('Reflection', [
                    _buildDetailRow('Emotion', entry.emotionState),
                    _buildDetailRow('Reason', entry.tradeReason),
                    _buildDetailRow('Strategy', entry.strategyLogic),
                    if (entry.whatWentWell?.isNotEmpty == true)
                      _buildDetailRow('✅ Went Well', entry.whatWentWell),
                    if (entry.whatWentWrong?.isNotEmpty == true)
                      _buildDetailRow('❌ Went Wrong', entry.whatWentWrong),
                  ]),
                // Screenshot Debug Info
                Container(
                  padding: const EdgeInsets.all(8),
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.bgTertiary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Screenshot data: ${entry.screenshot != null ? "${entry.screenshot!.length} chars" : "null"}',
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                  ),
                ),
                // Screenshot
                if (entry.screenshot != null && entry.screenshot!.isNotEmpty)
                  _buildScreenshotSection(entry.screenshot!)
                else
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.bgTertiary,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.image_not_supported, color: AppTheme.textMuted),
                        SizedBox(width: 8),
                        Text('No screenshot attached', style: TextStyle(color: AppTheme.textMuted)),
                      ],
                    ),
                  ),
                const SizedBox(height: 24),
                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _showEditModal(entry);
                        },
                        icon: const Icon(Icons.edit),
                        label: const Text('Edit'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.accent,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _deleteEntry(entry.id);
                        },
                        icon: const Icon(Icons.delete, color: AppTheme.loss),
                        label: const Text('Delete', style: TextStyle(color: AppTheme.loss)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppTheme.loss),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailSection(String title, List<Widget> children) {
    final filtered = children.where((w) => w is! SizedBox).toList();
    if (filtered.isEmpty) return const SizedBox.shrink();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.bgTertiary,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(children: children),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildDetailRow(String label, String? value) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 14)),
          ),
        ],
      ),
    );
  }

  Widget _buildScreenshotSection(String screenshot) {
    // Split by ||| for multiple screenshots
    final screenshots = screenshot.split('|||').where((s) => s.isNotEmpty).toList();
    
    if (screenshots.isEmpty) return const SizedBox.shrink();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '📸 Screenshot${screenshots.length > 1 ? 's' : ''} (${screenshots.length})',
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
        ),
        const SizedBox(height: 12),
        if (screenshots.length == 1)
          _buildSingleScreenshot(screenshots[0])
        else
          _buildScreenshotGrid(screenshots),
        const SizedBox(height: 8),
        Center(
          child: Text(
            'Tap to view full size',
            style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
  
  Widget _buildSingleScreenshot(String screenshot) {
    try {
      String base64String = screenshot;
      if (screenshot.contains(',')) {
        base64String = screenshot.split(',').last;
      }
      final bytes = base64Decode(base64String);
      
      return GestureDetector(
        onTap: () => _showFullScreenImage(bytes),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.memory(
            bytes,
            width: double.infinity,
            height: 200,
            fit: BoxFit.cover,
            errorBuilder: (ctx, error, stack) => _buildImageErrorWidget(),
          ),
        ),
      );
    } catch (e) {
      return _buildImageErrorWidget();
    }
  }
  
  Widget _buildScreenshotGrid(List<String> screenshots) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: screenshots.length,
      itemBuilder: (context, index) {
        try {
          String base64String = screenshots[index];
          if (base64String.contains(',')) {
            base64String = base64String.split(',').last;
          }
          final bytes = base64Decode(base64String);
          
          return GestureDetector(
            onTap: () => _showFullScreenImageGallery(screenshots, index),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.memory(
                bytes,
                fit: BoxFit.cover,
                errorBuilder: (ctx, error, stack) => _buildImageErrorWidget(small: true),
              ),
            ),
          );
        } catch (e) {
          return _buildImageErrorWidget(small: true);
        }
      },
    );
  }
  
  Widget _buildImageErrorWidget({bool small = false}) {
    return Container(
      height: small ? 50 : 100,
      decoration: BoxDecoration(
        color: AppTheme.bgTertiary,
        borderRadius: BorderRadius.circular(small ? 8 : 12),
      ),
      child: Center(
        child: Icon(
          Icons.image_not_supported,
          color: AppTheme.textMuted,
          size: small ? 24 : 32,
        ),
      ),
    );
  }
  
  void _showFullScreenImageGallery(List<String> screenshots, int initialIndex) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (ctx) => _ScreenshotGalleryViewer(
          screenshots: screenshots,
          initialIndex: initialIndex,
        ),
      ),
    );
  }

  void _showFullScreenImage(List<int> bytes) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (ctx) => Scaffold(
          backgroundColor: Colors.black,
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            iconTheme: const IconThemeData(color: Colors.white),
          ),
          body: Center(
            child: InteractiveViewer(
              panEnabled: true,
              minScale: 0.5,
              maxScale: 4,
              child: Image.memory(
                Uint8List.fromList(bytes),
                fit: BoxFit.contain,
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showEditModal(JournalEntry entry) {
    final instrumentController = TextEditingController(text: entry.instrument ?? '');
    final entryPriceController = TextEditingController(text: entry.entryPrice?.toString() ?? '');
    final stopLossController = TextEditingController(text: entry.stopLoss?.toString() ?? '');
    final targetController = TextEditingController(text: entry.target?.toString() ?? '');
    final tradeReasonController = TextEditingController(text: entry.tradeReason ?? '');
    final whatWentWellController = TextEditingController(text: entry.whatWentWell ?? '');
    final whatWentWrongController = TextEditingController(text: entry.whatWentWrong ?? '');
    
    String? selectedOutcome = entry.outcome;
    String? selectedTradeType = entry.tradeType;
    
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: BoxDecoration(
            color: AppTheme.bgSecondary,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Padding(
            padding: EdgeInsets.only(
              left: 24,
              right: 24,
              top: 24,
              bottom: MediaQuery.of(context).viewInsets.bottom + 24,
            ),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppTheme.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('✏️ Edit Trade', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 24),
                  
                  // Instrument
                  TextField(
                    controller: instrumentController,
                    decoration: const InputDecoration(labelText: 'Instrument'),
                  ),
                  const SizedBox(height: 12),
                  
                  // Trade Type & Outcome
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: selectedTradeType,
                          decoration: const InputDecoration(labelText: 'Type'),
                          items: ['BUY', 'SELL'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                          onChanged: (v) => setModalState(() => selectedTradeType = v),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: selectedOutcome,
                          decoration: const InputDecoration(labelText: 'Outcome'),
                          items: ['WIN', 'LOSS', 'BE', 'RUNNING'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                          onChanged: (v) => setModalState(() => selectedOutcome = v),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  
                  // Prices
                  Row(
                    children: [
                      Expanded(child: TextField(controller: entryPriceController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Entry Price'))),
                      const SizedBox(width: 12),
                      Expanded(child: TextField(controller: stopLossController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Stop Loss'))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(controller: targetController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Target')),
                  const SizedBox(height: 12),
                  
                  // Reason
                  TextField(controller: tradeReasonController, maxLines: 2, decoration: const InputDecoration(labelText: 'Trade Reason')),
                  const SizedBox(height: 12),
                  TextField(controller: whatWentWellController, maxLines: 2, decoration: const InputDecoration(labelText: 'What Went Well')),
                  const SizedBox(height: 12),
                  TextField(controller: whatWentWrongController, maxLines: 2, decoration: const InputDecoration(labelText: 'What Went Wrong')),
                  const SizedBox(height: 24),
                  
                  // Save Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () async {
                        final updatedEntry = entry.copyWith(
                          instrument: instrumentController.text.isNotEmpty ? instrumentController.text : null,
                          tradeType: selectedTradeType,
                          outcome: selectedOutcome,
                          entryPrice: double.tryParse(entryPriceController.text),
                          stopLoss: double.tryParse(stopLossController.text),
                          target: double.tryParse(targetController.text),
                          tradeReason: tradeReasonController.text.isNotEmpty ? tradeReasonController.text : null,
                          whatWentWell: whatWentWellController.text.isNotEmpty ? whatWentWellController.text : null,
                          whatWentWrong: whatWentWrongController.text.isNotEmpty ? whatWentWrongController.text : null,
                          updatedAt: DateTime.now(),
                        );
                        
                        await context.read<JournalProvider>().updateEntry(updatedEntry);
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Entry updated! ✅'),
                            backgroundColor: AppTheme.profit,
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.accent,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text('Save Changes'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// Screenshot Gallery Viewer for multiple images
class _ScreenshotGalleryViewer extends StatefulWidget {
  final List<String> screenshots;
  final int initialIndex;
  
  const _ScreenshotGalleryViewer({
    required this.screenshots,
    required this.initialIndex,
  });

  @override
  State<_ScreenshotGalleryViewer> createState() => _ScreenshotGalleryViewerState();
}

class _ScreenshotGalleryViewerState extends State<_ScreenshotGalleryViewer> {
  late PageController _pageController;
  late int _currentIndex;
  
  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }
  
  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Uint8List? _decodeImage(String screenshot) {
    try {
      String base64String = screenshot;
      if (screenshot.contains(',')) {
        base64String = screenshot.split(',').last;
      }
      return base64Decode(base64String);
    } catch (e) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          '${_currentIndex + 1} / ${widget.screenshots.length}',
          style: const TextStyle(color: Colors.white),
        ),
        centerTitle: true,
      ),
      body: PageView.builder(
        controller: _pageController,
        onPageChanged: (index) => setState(() => _currentIndex = index),
        itemCount: widget.screenshots.length,
        itemBuilder: (context, index) {
          final bytes = _decodeImage(widget.screenshots[index]);
          if (bytes == null) {
            return const Center(
              child: Icon(Icons.image_not_supported, color: Colors.white54, size: 64),
            );
          }
          return InteractiveViewer(
            panEnabled: true,
            minScale: 0.5,
            maxScale: 4,
            child: Center(
              child: Image.memory(
                bytes,
                fit: BoxFit.contain,
              ),
            ),
          );
        },
      ),
    );
  }
}
