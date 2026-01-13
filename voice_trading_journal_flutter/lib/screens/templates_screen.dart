import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../models/journal_entry.dart';
import '../providers/journal_provider.dart';

class TemplatesScreen extends StatefulWidget {
  const TemplatesScreen({super.key});

  @override
  State<TemplatesScreen> createState() => _TemplatesScreenState();
}

class _TemplatesScreenState extends State<TemplatesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<JournalProvider>().loadTemplates();
    });
  }

  void _showTemplateForm([TradeTemplate? template]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => TemplateFormSheet(
        template: template,
        onSaved: () {
          Navigator.pop(ctx);
          context.read<JournalProvider>().loadTemplates();
        },
      ),
    );
  }

  Future<void> _deleteTemplate(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bgSecondary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Template?'),
        content: const Text('This action cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.loss),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirm == true && mounted) {
      await context.read<JournalProvider>().deleteTemplate(id);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Text('📋', style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 12),
                      const Text('Templates', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: IconButton(
                      onPressed: () => _showTemplateForm(),
                      icon: const Icon(Icons.add, color: Colors.white),
                      tooltip: 'New Template',
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Consumer<JournalProvider>(
                builder: (ctx, provider, _) {
                  if (provider.templates.isEmpty) return _buildEmptyState();

                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: provider.templates.length,
                    itemBuilder: (ctx, i) => _buildTemplateCard(provider.templates[i]),
                  );
                },
              ),
            ),
          ],
        ),
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
            child: const Text('📋', style: TextStyle(fontSize: 48)),
          ),
          const SizedBox(height: 20),
          const Text('No templates yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text('Create templates for common setups', style: TextStyle(color: AppTheme.textMuted)),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => _showTemplateForm(),
            icon: const Icon(Icons.add),
            label: const Text('Create Template'),
          ),
        ],
      ),
    );
  }

  Widget _buildTemplateCard(TradeTemplate template) {
    final checklist = <String>[];
    if (template.htfBiasAligned) checklist.add('HTF');
    if (template.liquidityTaken) checklist.add('Liq');
    if (template.entryAtPOI) checklist.add('POI');
    if (template.bosConfirmed) checklist.add('BOS');
    if (template.mssConfirmed) checklist.add('MSS');
    if (template.chochConfirmed) checklist.add('CHoCH');
    if (template.orderBlockEntry) checklist.add('OB');
    if (template.fvgEntry) checklist.add('FVG');
    if (template.killZoneEntry) checklist.add('KZ');

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppTheme.bgTertiary, AppTheme.bgSecondary]),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(template.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, size: 20, color: AppTheme.textMuted),
                    onPressed: () => _showTemplateForm(template),
                    visualDensity: VisualDensity.compact,
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: AppTheme.loss, size: 20),
                    onPressed: () => _deleteTemplate(template.id),
                    visualDensity: VisualDensity.compact,
                  ),
                ],
              ),
            ],
          ),
          if (template.description?.isNotEmpty == true) ...[
            const SizedBox(height: 4),
            Text(template.description!, style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          ],
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              if (template.instrument != null) _buildTag(template.instrument!, AppTheme.accent),
              if (template.tradeType != null)
                _buildTag(template.tradeType!, template.tradeType == 'BUY' ? AppTheme.profit : AppTheme.loss),
              if (template.timeframe != null) _buildTag(template.timeframe!, AppTheme.textSecondary),
            ],
          ),
          if (checklist.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 4,
              runSpacing: 4,
              children: checklist.map((c) => _buildSmallTag(c)).toList(),
            ),
          ],
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Template applied! Go to Journal tab'),
                    backgroundColor: AppTheme.profit,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                );
              },
              icon: const Icon(Icons.play_arrow, size: 18),
              label: const Text('Use Template'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
      child: Text(text, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w500)),
    );
  }

  Widget _buildSmallTag(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: AppTheme.bgPrimary, borderRadius: BorderRadius.circular(4)),
      child: Text(text, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10)),
    );
  }
}

// Template Form Sheet
class TemplateFormSheet extends StatefulWidget {
  final TradeTemplate? template;
  final VoidCallback onSaved;

  const TemplateFormSheet({super.key, this.template, required this.onSaved});

  @override
  State<TemplateFormSheet> createState() => _TemplateFormSheetState();
}

class _TemplateFormSheetState extends State<TemplateFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descController = TextEditingController();

  String? _instrument, _tradeType, _timeframe;
  bool _htfBiasAligned = false, _liquidityTaken = false, _entryAtPOI = false;
  bool _riskManaged = false, _bosConfirmed = false, _mssConfirmed = false;
  bool _chochConfirmed = false, _orderBlockEntry = false, _fvgEntry = false;
  bool _killZoneEntry = false;

  @override
  void initState() {
    super.initState();
    if (widget.template != null) {
      _nameController.text = widget.template!.name;
      _descController.text = widget.template!.description ?? '';
      _instrument = widget.template!.instrument;
      _tradeType = widget.template!.tradeType;
      _timeframe = widget.template!.timeframe;
      _htfBiasAligned = widget.template!.htfBiasAligned;
      _liquidityTaken = widget.template!.liquidityTaken;
      _entryAtPOI = widget.template!.entryAtPOI;
      _riskManaged = widget.template!.riskManaged;
      _bosConfirmed = widget.template!.bosConfirmed;
      _mssConfirmed = widget.template!.mssConfirmed;
      _chochConfirmed = widget.template!.chochConfirmed;
      _orderBlockEntry = widget.template!.orderBlockEntry;
      _fvgEntry = widget.template!.fvgEntry;
      _killZoneEntry = widget.template!.killZoneEntry;
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    final template = TradeTemplate(
      id: widget.template?.id ?? '',
      name: _nameController.text,
      description: _descController.text,
      instrument: _instrument,
      tradeType: _tradeType,
      timeframe: _timeframe,
      htfBiasAligned: _htfBiasAligned,
      liquidityTaken: _liquidityTaken,
      entryAtPOI: _entryAtPOI,
      riskManaged: _riskManaged,
      bosConfirmed: _bosConfirmed,
      mssConfirmed: _mssConfirmed,
      chochConfirmed: _chochConfirmed,
      orderBlockEntry: _orderBlockEntry,
      fvgEntry: _fvgEntry,
      killZoneEntry: _killZoneEntry,
      createdAt: widget.template?.createdAt ?? DateTime.now(),
    );

    await context.read<JournalProvider>().createTemplate(template);
    widget.onSaved();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.85),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.5,
        maxChildSize: 1.0,
        expand: false,
        builder: (ctx, scrollController) => Form(
          key: _formKey,
          child: SingleChildScrollView(
            controller: scrollController,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(color: AppTheme.border, borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  widget.template == null ? 'New Template' : 'Edit Template',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Template Name *'),
                  validator: (v) => v?.isEmpty == true ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _descController,
                  decoration: const InputDecoration(labelText: 'Description'),
                  maxLines: 2,
                ),
                const SizedBox(height: 20),
                const Text('Pre-checked Items', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _buildCheck('HTF Bias', _htfBiasAligned, (v) => setState(() => _htfBiasAligned = v)),
                    _buildCheck('Liquidity', _liquidityTaken, (v) => setState(() => _liquidityTaken = v)),
                    _buildCheck('POI', _entryAtPOI, (v) => setState(() => _entryAtPOI = v)),
                    _buildCheck('Risk', _riskManaged, (v) => setState(() => _riskManaged = v)),
                    _buildCheck('BOS', _bosConfirmed, (v) => setState(() => _bosConfirmed = v)),
                    _buildCheck('MSS', _mssConfirmed, (v) => setState(() => _mssConfirmed = v)),
                    _buildCheck('CHoCH', _chochConfirmed, (v) => setState(() => _chochConfirmed = v)),
                    _buildCheck('OB', _orderBlockEntry, (v) => setState(() => _orderBlockEntry = v)),
                    _buildCheck('FVG', _fvgEntry, (v) => setState(() => _fvgEntry = v)),
                    _buildCheck('KZ', _killZoneEntry, (v) => setState(() => _killZoneEntry = v)),
                  ],
                ),
                const SizedBox(height: 32),
                Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ElevatedButton(
                    onPressed: _save,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Save Template', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCheck(String label, bool value, Function(bool) onChanged) {
    return FilterChip(
      label: Text(label),
      selected: value,
      onSelected: onChanged,
      selectedColor: AppTheme.accentGlow,
      checkmarkColor: AppTheme.accent,
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    super.dispose();
  }
}
